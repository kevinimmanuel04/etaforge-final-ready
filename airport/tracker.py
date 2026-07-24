import time
import requests
import json
import re
import threading
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from FlightRadar24 import FlightRadar24API

import os
from dotenv import load_dotenv

load_dotenv()

# --- CONFIGURATION ---
service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH', 'service-account.json')
cred = credentials.Certificate(service_account_path)

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()
fr_api = FlightRadar24API()

# KEYS & COLLECTIONS
GOOGLE_MAPS_KEY = os.getenv('VITE_GOOGLE_MAPS_API_KEY', 'AIzaSyBta64CrHTAb8w0cTJV9eLl1PjecrQ5O2Q')
COLLECTION_FLIGHTS = 'etaforge_live_flights'
COLLECTION_REQUESTS = 'etaforge_requests'
DOC_REQUEST = 'active_request'
DOC_SEARCH = 'current_search'
DOC_AIRPORT = 'current_airport'

# HEADERS
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://www.flightradar24.com",
    "Referer": "https://www.flightradar24.com/"
}

class SmartFlight:
    def __init__(self, flight_id):
        self.id = flight_id

# --- HELPERS ---

def format_duration(seconds):
    if not seconds: return "N/A"
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    return f"{h}h {m}m"

def get_flight_status_text(details):
    if not details: return "Unknown"
    status_text = details.get('status', {}).get('text', '')
    if status_text: return status_text
    trail = details.get('trail', [])
    if trail and len(trail) > 0: return "Live"
    time_info = details.get('time', {})
    real_dep = time_info.get('real', {}).get('departure')
    real_arr = time_info.get('real', {}).get('arrival')
    if real_arr: return "Landed"
    if real_dep: return "In Air"
    return "Scheduled"

def calculate_cockpit_data(trail):
    pitch, roll = 0, 0
    if trail and len(trail) >= 2:
        try:
            now = trail[0]; prev = trail[1]
            h_now = now.get('hd', 0); h_prev = prev.get('hd', 0)
            diff = h_now - h_prev
            if diff > 180: diff -= 360
            if diff < -180: diff += 360
            roll = max(min(diff * 2.5, 30), -30)
            alt_diff = now.get('alt', 0) - prev.get('alt', 0)
            if alt_diff > 20: pitch = 5
            elif alt_diff < -20: pitch = -3
        except: pass
    return pitch, roll

def fetch_fr24_schedule(iata):
    past_window = int(time.time() - 10800) 
    
    def format_ts(ts):
        if not ts: return None
        return datetime.fromtimestamp(ts).strftime('%I:%M %p')

    def parse_list(flight_list, is_arr):
        parsed = []
        for item in flight_list:
            try:
                flight = item.get('flight', {})
                ident = flight.get('identification', {}).get('number', {}).get('default')
                if not ident: continue 

                airline = flight.get('airline', {}).get('name', 'Unknown')
                key = 'origin' if is_arr else 'destination'
                port = flight.get('airport', {}).get(key, {})
                city = port.get('position', {}).get('region', {}).get('city') or port.get('name', 'Unknown')
                
                time_d = flight.get('time', {}) or item.get('time', {})
                ts_sched = time_d.get('scheduled', {}).get('arrival' if is_arr else 'departure')
                ts_real = time_d.get('real', {}).get('arrival' if is_arr else 'departure')
                ts_est = time_d.get('estimated', {}).get('arrival' if is_arr else 'departure')
                
                status = item.get('status', {}).get('text') or flight.get('status', {}).get('text')
                if not status:
                    if ts_real: status = "Landed" if is_arr else "Departed"
                    elif ts_est: status = "Expected"
                    else: status = "Scheduled"

                sched_str = format_ts(ts_sched) or "--:--"
                real_str = format_ts(ts_real or ts_est) or sched_str

                row = {'flight': ident, 'airline': airline, 'city': city, 'time_sched': sched_str, 'time_real': real_str, 'status': status}
                if is_arr: row['origin'] = city
                else: row['destination'] = city
                parsed.append(row)
            except: continue
        return parsed

    arrs, deps = [], []
    for mode in ['arrivals', 'departures']:
        try:
            url = f"https://api.flightradar24.com/common/v1/airport.json?code={iata}&plugin[]=&plugin-setting[schedule][mode]={mode}&plugin-setting[schedule][timestamp]={past_window}&page=1&limit=50"
            r = requests.get(url, headers=HEADERS, timeout=10)
            if r.status_code == 200:
                raw = r.json().get('result', {}).get('response', {}).get('airport', {}).get('pluginData', {}).get('schedule', {}).get(mode, {}).get('data', [])
                if mode == 'arrivals': arrs = parse_list(raw, True)
                else: deps = parse_list(raw, False)
        except Exception: pass
    return arrs, deps

def find_flight_id(query, search_date=None):
    print(f"    -> Looking up history for {query} (Date: {search_date or 'Auto'})...")
    url = f"https://api.flightradar24.com/common/v1/flight/list.json?query={query}&fetchBy=flight&page=1&limit=20"
    try:
        res = requests.get(url, headers=HEADERS)
        if res.status_code != 200: return None
        data = res.json().get('result', {}).get('response', {}).get('data', [])
        if not data: return None

        target_id = None
        if search_date:
            for f in data:
                ts = f.get('time', {}).get('scheduled', {}).get('departure')
                if ts:
                    flight_date = datetime.fromtimestamp(ts).strftime('%Y-%m-%d')
                    if flight_date == search_date:
                        target_id = f.get('identification', {}).get('id')
                        print(f"    -> Found match for date {search_date}: {target_id}")
                        break
        else:
            # Auto logic: Live > recent
            for f in data:
                if f.get('status', {}).get('live', False):
                    target_id = f.get('identification', {}).get('id')
                    print(f"    -> Found LIVE flight: {target_id}")
                    break
            if not target_id and data:
                now = time.time()
                best_flight = None
                min_diff = float('inf')
                for f in data:
                    ts = f.get('time', {}).get('scheduled', {}).get('departure')
                    if ts:
                        diff = abs(now - ts)
                        if diff < min_diff:
                            min_diff = diff
                            best_flight = f
                if best_flight:
                    target_id = best_flight.get('identification', {}).get('id')
                    print(f"    -> Found most recent flight: {target_id}")

        return target_id
    except Exception as e:
        print(f"    -> History Lookup Error: {e}")
        return None

def process_flight(query, date_str=None):
    print(f"[*] Processing Flight: {query} [Date: {date_str}]")
    try:
        flight_id = find_flight_id(query, date_str)
        if not flight_id: return {'error': 'Flight not found in database.'}

        # Fetch flight details directly using proper headers to avoid 403 Forbidden errors
        details = None
        try:
            url = f"https://data-live.flightradar24.com/clickhandler/?flight={flight_id}"
            res = requests.get(url, headers=HEADERS, timeout=10)
            if res.status_code == 200:
                details = res.json()
        except Exception as e:
            print(f"    -> Details Error: {e}")
            
        if not details: return {'error': 'No details available'}

        ai = details.get('airport', {})
        ori = ai.get('origin', {})
        dst = ai.get('destination', {})
        
        ori_gate = ori.get('info', {}).get('gate') or "N/A"
        ori_term = ori.get('info', {}).get('terminal') or "N/A"
        dst_gate = dst.get('info', {}).get('gate') or "N/A"
        dst_term = dst.get('info', {}).get('terminal') or "N/A"

        trail = details.get('trail', [])
        lat, lng, hd, alt, spd = 0, 0, 0, 0, 0
        status_raw = get_flight_status_text(details)
        
        if trail:
            l = trail[0]
            lat, lng, hd, alt, spd = l.get('lat'), l.get('lng'), l.get('hd'), l.get('alt'), l.get('spd')
        elif status_raw == "Landed" and dst:
            lat = dst.get('position', {}).get('latitude')
            lng = dst.get('position', {}).get('longitude')
        elif ori:
            lat = ori.get('position', {}).get('latitude')
            lng = ori.get('position', {}).get('longitude')

        ti = details.get('time', {})
        ts_dep_sch = ti.get('scheduled', {}).get('departure')
        ts_arr_sch = ti.get('scheduled', {}).get('arrival')
        ts_arr_est = ti.get('estimated', {}).get('arrival') or ts_arr_sch
        ts_dep_real = ti.get('real', {}).get('departure')
        
        duration_txt = "N/A"
        time_left_txt = "N/A"
        if ts_dep_sch and ts_arr_sch: duration_txt = format_duration(ts_arr_sch - ts_dep_sch)
        
        now = time.time()
        if status_raw == "Landed": time_left_txt = "Arrived"
        elif ts_arr_est and ts_arr_est > now: time_left_txt = format_duration(ts_arr_est - now)
        else: time_left_txt = status_raw

        def fmt_time(ts): return datetime.fromtimestamp(ts).strftime('%I:%M %p') if ts else "N/A"

        data = {
            'number': details.get('identification', {}).get('number', {}).get('default', query),
            'airline': details.get('airline', {}).get('name', 'Unknown'),
            'aircraft': details.get('aircraft', {}).get('model', {}).get('text', 'Unknown'),
            'latitude': lat, 'longitude': lng, 'heading': hd, 'altitude': alt, 'speed': spd,
            'origin': {
                'city': ori.get('position', {}).get('region', {}).get('city', 'Unknown'),
                'code': ori.get('code', {}).get('iata', ''),
                'gate': ori_gate, 'terminal': ori_term,
                'time': fmt_time(ts_dep_real or ts_dep_sch),
                'coords': [ori.get('position', {}).get('latitude'), ori.get('position', {}).get('longitude')]
            },
            'destination': {
                'city': dst.get('position', {}).get('region', {}).get('city', 'Unknown'),
                'code': dst.get('code', {}).get('iata', ''),
                'gate': dst_gate, 'terminal': dst_term,
                'time': fmt_time(ts_arr_est),
                'coords': [dst.get('position', {}).get('latitude'), dst.get('position', {}).get('longitude')]
            },
            'status': status_raw,
            'meta': { 'duration': duration_txt, 'eta': time_left_txt },
            'cockpit': {'pitch': calculate_cockpit_data(trail)[0], 'roll': calculate_cockpit_data(trail)[1]},
            'last_update': firestore.SERVER_TIMESTAMP
        }
        
        db.collection(COLLECTION_FLIGHTS).document(DOC_SEARCH).set(data)
        return {'success': True}
    except Exception as e: return {'error': str(e)}

def process_airport(query):
    print(f"[*] Processing Airport: {query}")
    try:
        # 1. GEOCODE VIA GOOGLE
        g_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={query} airport&key={GOOGLE_MAPS_KEY}"
        g_res = requests.get(g_url)
        lat, lng, full_name = 0, 0, query
        if g_res.status_code == 200:
            g_data = g_res.json()
            if g_data.get('status') == 'OK' and g_data.get('results'):
                res = g_data['results'][0]
                loc = res['geometry']['location']
                lat = loc['lat']; lng = loc['lng']
                full_name = res.get('formatted_address', query)
                print(f"    -> Google Resolved: {full_name} ({lat}, {lng})")
        
        # 2. FR24 CODE
        iata = query.upper() if len(query) == 3 else None
        if not iata:
            f_url = f"https://www.flightradar24.com/v1/search/web/find?query={query}&limit=1"
            f_res = requests.get(f_url, headers=HEADERS)
            if f_res.status_code == 200:
                f_data = f_res.json().get('results', [])
                if f_data and f_data[0].get('type') == 'airport':
                    iata = f_data[0].get('id')
                    print(f"    -> FR24 Resolved IATA: {iata}")

        if not iata: return {'error': 'Airport code not found.'}
        if lat == 0: return {'error': 'Could not locate airport coordinates.'}

        arrs, deps = fetch_fr24_schedule(iata)
        data = {
            'iata': iata, 'name': full_name.split(',')[0],
            'position': {'latitude': lat, 'longitude': lng},
            'arrivals': arrs, 'departures': deps,
            'last_update': firestore.SERVER_TIMESTAMP
        }
        db.collection(COLLECTION_FLIGHTS).document(DOC_AIRPORT).set(data)
        print(f"    -> Pushed {len(arrs)} Arr / {len(deps)} Dep")
        return {'success': True}
    except Exception as e: return {'error': str(e)}

def on_snapshot(col_snapshot, changes, read_time):
    for change in changes:
        if change.type.name in ['MODIFIED', 'ADDED']:
            doc = change.document
            data = doc.to_dict()
            if data.get('status') == 'pending':
                req_type = data.get('mode')
                query = data.get('query')
                date = data.get('date')
                print(f"\n[!] New Request: {req_type.upper()} -> {query} (Date: {date})")
                doc.reference.update({'status': 'processing'})
                result = process_flight(query, date) if req_type == 'flight' else process_airport(query)
                if result.get('error'):
                    doc.reference.update({'status': 'error', 'message': result['error']})
                    print(f"    -> Failed: {result['error']}")
                else:
                    doc.reference.update({'status': 'completed'})
                    print("    -> Completed.")

if __name__ == '__main__':
    print("-------------------------------------------------")
    print(" SYSTEM ONLINE: Etaforge Listener Backend")
    print(" MODE: Real-Time Heartbeat + Google Geocode")
    print("-------------------------------------------------")
    doc_ref = db.collection(COLLECTION_REQUESTS).document(DOC_REQUEST)
    doc_watch = doc_ref.on_snapshot(on_snapshot)
    while True: time.sleep(1)