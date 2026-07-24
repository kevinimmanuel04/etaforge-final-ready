import firebase_admin
from firebase_admin import credentials, db
import time
import re
import sys
import traceback
from datetime import datetime
import random
import io

# Force UTF-8 encoding for Windows console to prevent emoji print errors
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Selenium Imports
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import WebDriverException, TimeoutException
from webdriver_manager.chrome import ChromeDriverManager

import os
from dotenv import load_dotenv

load_dotenv()

# --- 1. CONFIGURATION ---
try:
    service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH', 'service-account.json')
    db_url = os.getenv('VITE_FIREBASE_DATABASE_URL', 'https://etaforge-live-default-rtdb.asia-southeast1.firebasedatabase.app')
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred, {
        'databaseURL': db_url
    })
    
    ref_stations = db.reference('stations_data')
    ref_tracking = db.reference('tracking_data')
    ref_cmd = db.reference('cmd')
    
    print(" >> Firebase Connected Successfully.")
except Exception as e:
    print(f" !! FIREBASE CONNECTION ERROR: {e}")
    sys.exit()

def get_driver():
    options = Options()
    options.add_argument("--headless=new") 
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--log-level=3")
    options.add_argument("--window-size=1920,1080")
    
    # Enhanced anti-detection
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    
    # Disable images for faster loading
    prefs = {
        "profile.managed_default_content_settings.images": 2,
        "profile.default_content_setting_values.notifications": 2
    }
    options.add_experimental_option("prefs", prefs)
    
    # Rotate user agents to avoid detection
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    ]
    options.add_argument(f"user-agent={random.choice(user_agents)}")
    
    # Additional headers
    options.add_argument("--accept-language=en-US,en;q=0.9")
    options.add_argument("--accept-encoding=gzip, deflate, br")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    
    # Execute CDP commands to further hide automation
    driver.execute_cdp_cmd("Network.setUserAgentOverride", {
        "userAgent": driver.execute_script("return navigator.userAgent").replace("Headless", "")
    })
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    return driver


# =============================================================================
# WORKER 1: STATION BOARDS (Source: RunningStatus.in /liveTrains/{CODE})
# =============================================================================
# The headless browser receives a simplified 3-column layout:
#   Headers: TRAIN | AT STATION | STATUS
#   col[0]: Train number + name  (e.g., "11021\nDr-ten Express")
#   col[1]: Currently At station (e.g., "Monr")
#   col[2]: Delay/Status text    (e.g., "2h 23m Late" or "On Time")
# =============================================================================
def handle_station_request(event):
    if event.data is None: return

    try:
        data_str = str(event.data)
        parts = data_str.split('|')
        if len(parts) < 3: return
            
        station_code = parts[0].strip()
        station_id = parts[1].strip()
        station_name = parts[2].strip()
    except: return

    print(f" >> [Worker 1] Scanning Station: {station_name} ({station_code})")
    ref_stations.child(station_code).update({"loading_status": "scanning"})

    driver = None
    try:
        driver = get_driver()
        trains = []
        
        url = f"https://runningstatus.in/liveTrains/{station_code}"
        driver.get(url)
        
        # Wait for the table data to appear
        try: 
            WebDriverWait(driver, 20).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "table.table tbody tr td"))
            )
        except TimeoutException:
            print(f"   -> Page load timeout for station {station_code}")
            raise Exception("Station page did not load table")

        time.sleep(4)

        rows = driver.find_elements(By.CSS_SELECTOR, "table.table tbody tr")
        
        for row in rows:
            try:
                cols = row.find_elements(By.TAG_NAME, "td")
                if len(cols) < 3:
                    continue
                
                # --- Col 0: TRAIN number + name ---
                train_cell = cols[0].text.strip()
                train_lines = train_cell.split('\n')
                
                t_num = ""
                t_name = ""
                for line in train_lines:
                    line = line.strip()
                    if not line: continue
                    num_match = re.search(r'\b(\d{4,5})\b', line)
                    if num_match and not t_num:
                        t_num = num_match.group(1)
                    elif t_num and not t_name and len(line) > 3 and not line.isdigit():
                        if not re.match(r'^[0-9][A-Z]$', line) and not re.match(r'^[A-Z]{2}$', line):
                            t_name = line.replace("*", "").strip()
                
                if not t_num or not t_num.isdigit():
                    continue
                
                # --- Col 1: AT STATION ---
                currently_at = cols[1].text.strip() if len(cols) > 1 else "-"
                
                # --- Col 2: STATUS (delay) ---
                status_text = cols[2].text.strip() if len(cols) > 2 else "On Time"
                status = "On Time"
                
                hm_match = re.search(r'(\d+)h\s*(\d+)m', status_text, re.IGNORECASE)
                if hm_match:
                    total_mins = int(hm_match.group(1)) * 60 + int(hm_match.group(2))
                    status = f"Late by {total_mins} min"
                else:
                    min_match = re.search(r'(\d+)\s*m(?:in)?', status_text, re.IGNORECASE)
                    if min_match:
                        status = f"Late by {min_match.group(1)} min"
                    elif "on time" in status_text.lower():
                        status = "On Time"
                    elif "late" in status_text.lower():
                        status = status_text
                
                trains.append({
                    "number": t_num, 
                    "name": t_name, 
                    "arrival": "-",
                    "departure": "-",
                    "platform": "TBD",
                    "status": status,
                    "currently_at": currently_at
                })
            except:
                continue
        
        trains.sort(key=lambda x: x.get('status', '') == 'On Time')
        
        ref_stations.child(station_code).set({
            "name": station_name,
            "updated": datetime.now().strftime('%H:%M:%S'),
            "trains": trains[:30],
            "loading_status": "success"
        })
        print(f"   -> Success: {len(trains)} trains found.")

    except Exception as e:
        print(f" !! Station Error: {e}")
        traceback.print_exc()
        ref_stations.child(station_code).update({"loading_status": "failed"})
    finally:
        if driver: driver.quit()


# =============================================================================
# WORKER 2: LIVE TRACKING (Source: RunningStatus.in /status/{trainNo})
# =============================================================================
# Table class: "table table-hover table-borderless mb-0 align-middle"
# Headers: [timeline] | Station & Speed | Sch. Arr/Dep | Actual Arr/Dep | Delay Status | Dist / PF
#
# Row classes: "row-passed", "row-current", "row-upcoming"
#
# col[0]: Timeline visual (dot/line)
# col[1]: Station name with code: "BANGALORE CANT (BNC)\nAvg Speed: 22 km/h"
# col[2]: Sch times: "08:44 AM 30-Apr\n08:45 AM 30-Apr"
# col[3]: Actual times: same format
# col[4]: Delay: "Arr: 4 mins  Dep: 6 mins" or "Arr: RT  Dep: RT"
# col[5]: "4 km\nPF: 2"
# =============================================================================
def handle_track_request(event):
    if event.data is None: return

    train_no = str(event.data).strip()
    print(f" >> [Worker 2] Tracking Train {train_no} via RunningStatus.in...")
    
    ref_tracking.child(train_no).update({"loading_status": "tracking"})

    driver = None
    max_retries = 3
    
    for attempt in range(max_retries):
        try:
            if driver:
                try: driver.quit()
                except: pass
            
            driver = get_driver()
            url = f"https://runningstatus.in/status/{train_no}"
            
            time.sleep(random.uniform(1, 3))
            driver.get(url)
            
            # Wait for the route table
            try:
                WebDriverWait(driver, 15).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "table.table tbody tr td"))
                )
            except TimeoutException:
                print(f"   -> Page Load Timeout for {train_no} (Attempt {attempt + 1}/{max_retries})")
                raise Exception("Page did not load data table within timeout")

            time.sleep(3)

            # --- Journey Date ---
            journey_date = ""
            try:
                page_text = driver.find_element(By.TAG_NAME, "body").text
                date_match = re.search(r'(\d{1,2}[-/][A-Za-z]{3}[-/]\d{4})', page_text)
                if date_match:
                    journey_date = date_match.group(1).strip()
                else:
                    date_match = re.search(r'(\d{1,2}[-/]\d{1,2}[-/]\d{4})', page_text)
                    if date_match:
                        journey_date = date_match.group(1).strip()
                    else:
                        journey_date = datetime.now().strftime('%d-%b-%Y')
            except:
                journey_date = "Date Unknown"

            # --- Status Banner ---
            status_summary = ""
            try:
                banner_elements = driver.find_elements(By.XPATH, 
                    "//*[contains(text(), 'Currently near') or contains(text(), 'Not Yet Started') or contains(text(), 'Journey Concluded') or contains(text(), 'Scheduled to depart')]"
                )
                for el in banner_elements:
                    text = el.text.strip()
                    if "Currently near" in text:
                        status_summary = text
                        break
                    elif "Not Yet Started" in text:
                        status_summary = "Train has not started yet"
                        break
                    elif "Journey Concluded" in text:
                        status_summary = "Journey Concluded"
                        break
                    elif "Scheduled to depart" in text:
                        status_summary = text
                        break
            except:
                pass

            if not status_summary:
                try:
                    badges = driver.find_elements(By.CSS_SELECTOR, ".badge")
                    for b in badges:
                        txt = b.text.strip().lower()
                        if txt in ["running", "yet to start", "scheduled", "arrived", "delayed"]:
                            status_summary = b.text.strip()
                            break
                except:
                    pass

            if not status_summary:
                status_summary = "Status Unknown"

            # --- Route Table ---
            rows = driver.find_elements(By.CSS_SELECTOR, "table.table tbody tr")
            processed_route = []

            for i, row in enumerate(rows):
                try:
                    cols = row.find_elements(By.TAG_NAME, "td")
                    if len(cols) < 6: 
                        continue
                    
                    # Col 1: Station Name + Code + Speed
                    stn_cell_text = cols[1].text.strip()
                    text_lines = stn_cell_text.split('\n')
                    stn_name_raw = text_lines[0].strip()
                    
                    code_match = re.search(r'\(([A-Z]{2,5})\)', stn_name_raw)
                    stn_code = code_match.group(1) if code_match else ""
                    stn_name = re.sub(r'\s*\([A-Z]{2,5}\)\s*', '', stn_name_raw).strip()
                    
                    speed = ""
                    for line in text_lines[1:]:
                        speed_match = re.search(r'(\d+)\s*km/h', line, re.IGNORECASE)
                        if speed_match:
                            speed = f"{speed_match.group(1)} km/h"

                    # Col 2: Scheduled Arr/Dep
                    sch_arr, sch_dep = _extract_arr_dep_times(cols[2].text.strip())
                    
                    # Col 3: Actual Arr/Dep
                    act_arr, act_dep = _extract_arr_dep_times(cols[3].text.strip())
                    
                    # Col 4: Delay Status
                    delay = "No Delay"
                    delay_col_text = cols[4].text.strip()
                    
                    delay_values = re.findall(r'(?:Arr|Dep):\s*(\d+\s*mins?|RT)', delay_col_text, re.IGNORECASE)
                    has_delay = False
                    for dv in delay_values:
                        if dv.strip().upper() != "RT":
                            has_delay = True
                            delay = dv.strip()
                            if "late" not in delay.lower():
                                delay = delay + " Late"
                            break
                    
                    if not has_delay and delay_values:
                        delay = "No Delay"

                    # Col 5: Dist / PF
                    dist_pf_text = cols[5].text.strip()
                    platform = "-"
                    pf_match = re.search(r'PF[:\s]*(\d+)', dist_pf_text, re.IGNORECASE)
                    if pf_match:
                        platform = pf_match.group(1)
                    
                    dist_km = ""
                    dist_match = re.search(r'(\d+)\s*km', dist_pf_text, re.IGNORECASE)
                    if dist_match:
                        dist_km = dist_match.group(1) + " km"

                    # Row class for status
                    cls = row.get_attribute("class").lower() if row.get_attribute("class") else ""
                    status_calc = "upcoming"
                    if "row-passed" in cls:
                        status_calc = "passed"
                    elif "row-current" in cls:
                        status_calc = "current"
                    elif "row-upcoming" in cls:
                        status_calc = "upcoming"

                    processed_route.append({
                        "name": stn_name,
                        "code": stn_code, 
                        "status": status_calc,
                        "delay": delay,
                        "platform": platform,
                        "sch_arr": sch_arr,
                        "act_arr": act_arr,
                        "sch_dep": sch_dep,
                        "act_dep": act_dep,
                        "speed": speed,
                        "distance": dist_km,
                    })

                except:
                    continue

            if not processed_route:
                raise Exception("No stations parsed from the table")

            # --- Compute next station + ETA ---
            next_stn = "-"
            eta = "-"
            
            has_current = any(s['status'] == 'current' for s in processed_route)
            has_passed = any(s['status'] == 'passed' for s in processed_route)

            for s in processed_route:
                if s['status'] == 'current':
                    if status_summary in ["Status Unknown", "Running"]:
                        speed_info = f" ({s['speed']})" if s.get('speed') else ""
                        status_summary = f"At {s['name']}{speed_info}"
                
                if s['status'] == 'upcoming' and next_stn == "-":
                    next_stn = s['name']
                    
                    if has_passed and not has_current:
                        s['status'] = 'approaching'
                        if status_summary in ["Status Unknown", "Running"]:
                            status_summary = f"Approaching {s['name']}"
                            
                    eta = s['act_arr'] if s['act_arr'] != '-' else s['sch_arr']
                    if eta == "-":
                        eta = s['act_dep'] if s['act_dep'] != '-' else s['sch_dep']
            
            passed_count = sum(1 for s in processed_route if s['status'] == 'passed')
            current_count = sum(1 for s in processed_route if s['status'] in ['current', 'approaching'])
            
            if passed_count == 0 and current_count == 0:
                if status_summary in ["Status Unknown", "Running"]:
                    status_summary = "Train has not started yet"
            elif status_summary == "Status Unknown":
                if next_stn == "-" and passed_count > 0:
                    status_summary = "Journey Concluded"
                elif passed_count > 0:
                    status_summary = "Running"

            result = {
                "train_no": train_no,
                "journey_date": journey_date,
                "current_location": status_summary,
                "next_station": next_stn,
                "eta": eta,
                "route": processed_route,
                "updated": datetime.now().strftime('%H:%M:%S'),
                "loading_status": "success"
            }
            
            ref_tracking.child(train_no).set(result)
            print(f"   -> Data Pushed for {train_no} | Date: {journey_date} | Status: {status_summary} | Stations: {len(processed_route)}")
            
            if driver:
                driver.quit()
            return
            
        except (WebDriverException, TimeoutException, ConnectionResetError) as e:
            print(f" !! [Tracker] Network/Selenium Error for {train_no} (Attempt {attempt + 1}/{max_retries})")
            print(f"    -> Error: {str(e)[:100]}")
            
            if attempt < max_retries - 1:
                wait_time = 2 ** (attempt + 1)
                print(f"    -> Retrying in {wait_time} seconds...")
                time.sleep(wait_time)
            else:
                print(f"    -> Max retries reached for {train_no}. Giving up.")
                ref_tracking.child(train_no).update({"loading_status": "failed"})
                
        except Exception as e:
            print(f" !! [Tracker] Unexpected Error for {train_no}: {e}")
            traceback.print_exc()
            ref_tracking.child(train_no).update({"loading_status": "failed"})
            break
    
    if driver:
        try: driver.quit()
        except: pass


# =============================================================================
# HELPER: Extract Arrival / Departure times from a table cell
# =============================================================================
# New format: "08:44 AM 30-Apr\n08:45 AM 30-Apr" or "--\n03:00 PM"
# =============================================================================
def _extract_arr_dep_times(text):
    if not text or not text.strip():
        return "-", "-"
    
    lines = text.strip().split('\n')
    lines = [l.strip() for l in lines if l.strip()]
    
    def parse_time(t):
        t = t.strip()
        if "--" in t or not t:
            return "-"
        match = re.search(r'(\d{1,2}:\d{2}\s*[APap][Mm])', t)
        return match.group(1).strip() if match else "-"
    
    if len(lines) >= 2:
        arr = parse_time(lines[0])
        dep = parse_time(lines[1])
        return arr, dep
    elif len(lines) == 1:
        t = parse_time(lines[0])
        return "-", t
    
    return "-", "-"


# =============================================================================
# MAIN
# =============================================================================
if __name__ == '__main__':
    print("--------------------------------------------------")
    print(" ETAFORGE 2.0: RAIL BACKEND SERVER ONLINE")
    print(" Source: RunningStatus.in (Redesigned May 2026)")
    print("--------------------------------------------------")
    try:
        ref_cmd.child('get_station').listen(handle_station_request)
        ref_cmd.child('track_train').listen(handle_track_request)
        
        while True: 
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n >> Stopping Server...")
        sys.exit(0)