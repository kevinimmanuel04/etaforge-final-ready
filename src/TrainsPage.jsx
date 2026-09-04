import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, set, off } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { 
  Search, Activity, MapPin, Train, Navigation, ArrowRight, ArrowLeft,
  Clock, RefreshCw, Zap, AlertTriangle, CheckCircle, Lock, Circle, 
  Map as MapIcon, ChevronDown, ChevronUp, X, LayoutList, Map as MapIcon2, Loader2, Play, Calendar
} from 'lucide-react';

// --- CONFIGURATION ---
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBta64CrHTAb8w0cTJV9eLl1PjecrQ5O2Q";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAhBhKMWuPQJefMr997-m_-zSVvtg_p8Js",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "etaforge-live.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://etaforge-live-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "etaforge-live",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "etaforge-live.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "14242983734",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:14242983734:web:cda6c57463217ba2700d97"
};

// Initialize Firebase (only if not already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);
const auth = getAuth(app);

// --- STATION DATABASE ---
const ALL_STATIONS = [
    { code: "SBC", name: "KSR Bengaluru", lat: 12.9781, lng: 77.5695 },
    { code: "YPR", name: "Yesvantpur", lat: 13.0237, lng: 77.5503 },
    { code: "SMVB", name: "SMVT Bengaluru", lat: 12.9942, lng: 77.6534 },
    { code: "WFD", name: "Whitefield", lat: 12.9760, lng: 77.7554 },
    { code: "KJM", name: "Krishnarajapuram", lat: 13.0006, lng: 77.6750 },
    { code: "MYS", name: "Mysuru Jn", lat: 12.3168, lng: 76.6433 },
    { code: "UBL", name: "Hubballi Jn", lat: 15.3464, lng: 75.1482 },
    { code: "MAS", name: "MGR Chennai Central", lat: 13.0827, lng: 80.2707 },
    { code: "MS", name: "Chennai Egmore", lat: 13.0763, lng: 80.2604 },
    { code: "TBM", name: "Tambaram", lat: 12.9238, lng: 80.1252 },
    { code: "CBE", name: "Coimbatore Jn", lat: 11.0016, lng: 76.9663 },
    { code: "MDU", name: "Madurai Jn", lat: 9.9202, lng: 78.1130 },
    { code: "TPJ", name: "Tiruchchirappali Jn", lat: 10.7854, lng: 78.6853 },
    { code: "CAPE", name: "Kanniyakumari", lat: 8.0863, lng: 77.5458 },
    { code: "SC", name: "Secunderabad Jn", lat: 17.4339, lng: 78.5020 },
    { code: "HYB", name: "Hyderabad Deccan", lat: 17.3929, lng: 78.4735 },
    { code: "WL", name: "Warangal", lat: 17.9678, lng: 79.6015 },
    { code: "BZA", name: "Vijayawada Jn", lat: 16.5193, lng: 80.6190 },
    { code: "VSKP", name: "Visakhapatnam", lat: 17.7214, lng: 83.2922 },
    { code: "GNT", name: "Guntur Jn", lat: 16.2995, lng: 80.4430 },
    { code: "TVC", name: "Thiruvananthapuram Cntl", lat: 8.4871, lng: 76.9538 },
    { code: "KCVL", name: "Kochuveli", lat: 8.5135, lng: 76.9069 },
    { code: "ERS", name: "Ernakulam Jn (South)", lat: 9.9620, lng: 76.2923 },
    { code: "ERN", name: "Ernakulam Town (North)", lat: 9.9922, lng: 76.2891 },
    { code: "CLT", name: "Kozhikode Main", lat: 11.2464, lng: 75.7750 },
    { code: "CSMT", name: "Mumbai CSMT", lat: 18.9415, lng: 72.8358 },
    { code: "LTT", name: "Lokmanya Tilak Term", lat: 19.0683, lng: 72.8913 }
].map((s, i) => ({ ...s, id: String(1000 + i) })).sort((a, b) => a.name.localeCompare(b.name));

const defaultCenter = { lat: 12.9716, lng: 77.5946 }; 

// --- UTILITIES ---
const formatToAmPm = (time24) => {
  if (!time24 || typeof time24 !== 'string' || time24 === '-' || time24.includes('AM') || time24.includes('PM')) return time24 || '-';
  const match = time24.match(/(\d{1,2}):(\d{2})/);
  if (!match) return time24;
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

// Robust Date Parser
const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(dateStr)) {
        const parts = dateStr.split(/[-/]/);
        const d = parts[0];
        const m = parts[1];
        const y = parts[2];
        return new Date(`${y}-${m}-${d}`);
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
};

// Helper: Calculate Date + (DayNumber - 1)
const getDateForDay = (startDateStr, dayNumber) => {
    const baseDateStr = startDateStr || new Date().toISOString(); 
    try {
        const date = parseDate(baseDateStr);
        date.setDate(date.getDate() + (dayNumber - 1));
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch (e) {
        return "Date N/A";
    }
};

const filterUpcomingTrains = (trains) => {
  if (!trains || !Array.isArray(trains)) return [];
  const now = new Date();
  
  return trains.filter(t => {
    // If no times available (new simplified station view), show all trains
    const timeStr = t.departure !== '-' ? t.departure : t.arrival;
    if (!timeStr || !timeStr.includes(':')) return true;
    const [h, m] = timeStr.split(':').map(Number);
    let d = new Date(now); d.setHours(h, m, 0, 0);
    
    if (d < now) { 
        const diff = (now - d) / 1000 / 60; 
        if (diff > 30) {
             d.setDate(d.getDate() + 1);
        } else {
            return true; 
        }
    }
    return d >= now; 
  });
};

const getStationStatusColor = (status) => {
    switch(status) {
      case 'passed': return { dot: 'bg-red-500', line: 'bg-red-300', text: 'text-gray-400' };
      case 'current': return { dot: 'bg-blue-500', line: 'bg-gray-700', text: 'text-blue-300' };
      default: return { dot: 'bg-emerald-500', line: 'bg-gray-700', text: 'text-gray-200' };
    }
};

// --- COMPONENTS ---

// 1. Theme Switch Component
const ThemeSwitch = ({ isDarkMode, toggleTheme }) => {
    return (
        <div className="theme-toggle-wrapper">
             <label className="switch">
                <input 
                    id="checkbox" 
                    type="checkbox" 
                    checked={!isDarkMode} // Checked = Light Mode (Day), Unchecked = Dark Mode
                    onChange={toggleTheme}
                />
                <span className="slider">
                    <div className="star star_1" />
                    <div className="star star_2" />
                    <div className="star star_3" />
                    <svg viewBox="0 0 16 16" className="cloud_1 cloud">
                        <path transform="matrix(.77976 0 0 .78395-299.99-418.63)" fill="#fff" d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925" />
                    </svg>
                </span>
            </label>
        </div>
    );
};

// 2. Custom Back Button
const CustomBackButton = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white text-center w-32 rounded-xl h-10 relative text-black text-sm font-bold group shadow-lg hover:shadow-xl transition-all scale-90 origin-top-left" 
    type="button"
  >
    <div className="bg-green-400 rounded-lg h-8 w-8 flex items-center justify-center absolute left-1 top-1 group-hover:w-[120px] z-10 duration-500">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" height="18px" width="18px">
        <path d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z" fill="#000000" />
        <path d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z" fill="#000000" />
      </svg>
    </div>
    <p className="translate-x-3">Go Back</p>
  </button>
);

// 3. Unified Search Component
const UnifiedSearch = ({ onSearch, onStationSelect, stations }) => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);

        if (!val.trim()) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const matches = stations.filter(s => 
            s.name.toLowerCase().includes(val.toLowerCase()) || 
            s.code.toLowerCase().includes(val.toLowerCase())
        );
        setSuggestions(matches);
        setShowSuggestions(matches.length > 0 && isNaN(val)); 
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isNaN(query) && query.trim().length > 0) {
            onSearch(query);
            setSuggestions([]);
            setShowSuggestions(false);
        } else {
             const exactMatch = stations.find(s => s.code.toLowerCase() === query.toLowerCase());
             if (exactMatch) {
                 onStationSelect(exactMatch.code);
                 setSuggestions([]);
                 setShowSuggestions(false);
             }
        }
    };

    const handleSelectStation = (stn) => {
        setQuery(stn.name);
        setSuggestions([]);
        setShowSuggestions(false);
        onStationSelect(stn.code);
    };

    return (
        <div className="relative">
            <form onSubmit={handleSubmit} className="input-wrapper">
                <button type="submit" className="icon group">
                    <svg width="25px" height="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform group-hover:scale-110">
                        <path d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 22L20 20" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <input 
                    type="text" 
                    name="text" 
                    className="input" 
                    placeholder="Search..." 
                    value={query}
                    onChange={handleInputChange}
                    autoComplete="off"
                />
            </form>
            
            {showSuggestions && (
                <div className="absolute top-14 left-0 right-0 bg-white rounded-lg shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
                    {suggestions.map(stn => (
                        <div 
                            key={stn.code} 
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-slate-800 border-b border-gray-100 last:border-0"
                            onClick={() => handleSelectStation(stn)}
                        >
                            <div className="font-bold text-sm">{stn.name}</div>
                            <div className="text-xs text-slate-500">{stn.code}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// 4. Timeline Row
const TimelineItem = ({ station, isLast, dayBadge, isDarkMode }) => {
    const { dot, line, text } = getStationStatusColor(station.status);
    // Adjust colors based on theme for text if needed, though status colors usually work well on both
    const textColor = isDarkMode ? text : 'text-slate-700';
    const subTextColor = isDarkMode ? 'text-slate-400' : 'text-slate-500';
    const timeColor = isDarkMode ? 'text-white' : 'text-slate-900';

    const hasDelay = station.delay && station.delay !== "No Delay" && station.delay !== "On Time" && station.delay !== "-";
    const statusText = hasDelay ? `${station.delay}` : "On Time";
    const statusColor = hasDelay ? "text-red-400" : "text-emerald-500";

    const arrivalTime = station.act_arr !== '-' ? station.act_arr : station.sch_arr;
    const departureTime = station.act_dep !== '-' ? station.act_dep : station.sch_dep;

    return (
      <div className="relative">
        {dayBadge && (
            <div className="flex items-center gap-2 mb-3 ml-1 animate-in slide-in-from-left-2 fade-in duration-500 mt-2">
                <div className={`text-[10px] font-bold px-3 py-1 rounded-full border flex items-center gap-1 uppercase tracking-wider shadow-md
                    ${isDarkMode ? 'bg-slate-700 text-slate-300 border-slate-600' : 'bg-white text-slate-600 border-slate-200'}
                `}>
                    <Calendar size={10} className="text-emerald-500" />
                    <span className="text-emerald-500">
                        {dayBadge.isSource ? "Departs" : `Day ${dayBadge.day}`}
                    </span> • {dayBadge.date}
                </div>
            </div>
        )}

        <div className="flex gap-4 min-h-[70px] relative">
            <div className="flex flex-col items-center w-6 shrink-0">
               <div className={`w-3 h-3 rounded-full z-10 ${dot} ${station.status === 'current' ? 'ring-4 ring-blue-500/30 scale-125' : ''}`}></div>
               {!isLast && <div className={`w-0.5 h-full absolute top-3 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-300'}`}></div>}
            </div>

            <div className={`flex-1 grid grid-cols-12 gap-2 pb-6 border-b ${isDarkMode ? 'border-slate-800/50' : 'border-slate-200'} ${station.status === 'current' ? (isDarkMode ? 'bg-slate-800/30' : 'bg-blue-50') + ' -m-2 p-2 rounded-lg border-none' : ''}`}>
                <div className="col-span-5 flex flex-col justify-start pr-2">
                    <div className={`text-sm font-bold truncate ${textColor}`}>{station.name}</div>
                    <div className="flex flex-col mt-1">
                        <div className="flex items-center gap-2 text-[10px]">
                            {station.platform !== '-' && (
                                <span className={`${isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-slate-500 border-slate-200'} px-1.5 py-0.5 rounded border`}>PF {station.platform}</span>
                            )}
                            <span className={`font-medium ${statusColor}`}>{statusText}</span>
                        </div>
                    </div>
                </div>
                <div className="col-span-3 flex flex-col justify-start">
                    <div className={`text-xs font-mono font-bold whitespace-nowrap ${timeColor}`}>{arrivalTime}</div>
                </div>
                <div className="col-span-4 flex flex-col justify-start text-right">
                    <div className={`text-xs font-mono font-bold whitespace-nowrap ${timeColor}`}>{departureTime}</div>
                </div>
            </div>
        </div>
      </div>
    );
};

// 5. Glass Card
import { motion } from "framer-motion";

const NextStationCard = ({ nextStationName, eta, pf, departure, isDarkMode }) => {
    return (
        <motion.div
            drag
            dragMomentum={false}
            className="glass-card-wrapper absolute top-1/2 right-4 -translate-y-1/2 z-50 cursor-grab active:cursor-grabbing"
        >
            <div className={`card ${isDarkMode ? 'card-dark' : 'card-light'}`}>
                <div className="content">
                    <div className="flex items-center gap-2 mb-1 opacity-70">
                        <MapIcon2 size={12} className={isDarkMode ? "text-blue-200" : "text-blue-600"} />
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${isDarkMode ? "text-blue-100" : "text-blue-700"}`}>
                            Next Station
                        </span>
                    </div>

                    <h1 className="station-name">{nextStationName}</h1>

                    <div className="mt-3 border-t border-slate-500/20 pt-2">
                        <div className="stats-grid">
                            <div className="stat"><span className="label">ETA</span><span className="value text-emerald-400">{eta}</span></div>
                            <div className="stat"><span className="label">PF</span><span className="value text-yellow-400">{pf || '-'}</span></div>
                            <div className="stat"><span className="label">Dep</span><span className={`value ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{departure || '-'}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};


// --- MAP COMPONENT ---
const MapView = ({ center, zoom, route, mode, onStationClick, stations, nextStationData, isDarkMode }) => {
  const mapRef = useRef(null);
  const [mapObj, setMapObj] = useState(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [mappedStations, setMappedStations] = useState([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleMapsLoaded(true);
      document.head.appendChild(script);
    } else {
      setGoogleMapsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (googleMapsLoaded && mapRef.current && !mapObj) {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: zoom,
        center: center,
        disableDefaultUI: true, 
        gestureHandling: "greedy",
        keyboardShortcuts: false, 
        clickableIcons: false,    
      });
      setMapObj(map);
    }
  }, [googleMapsLoaded, mapRef, mapObj]);

  // Handle Theme Switching for Map
  useEffect(() => {
      if (mapObj && window.google) {
          const darkStyles = [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
            { featureType: "poi", stylers: [{ visibility: "off" }] }
          ];
          // Empty array for default light mode
          mapObj.setOptions({ styles: isDarkMode ? darkStyles : [] });
      }
  }, [isDarkMode, mapObj]);

  useEffect(() => {
      if (mapObj && center && typeof center.lat === 'number') {
          mapObj.panTo(center);
          mapObj.setZoom(zoom);
      }
  }, [center, zoom, mapObj]);

  useEffect(() => {
    const routeList = Array.isArray(route) ? route : (route ? Object.values(route) : []);
    if (!googleMapsLoaded || mode !== 'TRACKING' || routeList.length === 0) {
        setMappedStations([]);
        return;
    }

    setIsGeocoding(true);
    const geocoder = new window.google.maps.Geocoder();
    let isCancelled = false;

    // Helper: Try to find coordinates from our local station database
    const findLocalCoords = (station) => {
        if (station.code) {
            const localMatch = ALL_STATIONS.find(s => s.code === station.code);
            if (localMatch) return { lat: localMatch.lat, lng: localMatch.lng };
        }
        // Also try matching by name
        if (station.name) {
            const nameLower = station.name.toLowerCase();
            const localMatch = ALL_STATIONS.find(s => 
                s.name.toLowerCase().includes(nameLower) || nameLower.includes(s.name.toLowerCase())
            );
            if (localMatch) return { lat: localMatch.lat, lng: localMatch.lng };
        }
        return null;
    };

    const fetchCoordinates = async () => {
        setMappedStations([]);
        let currentMapped = [];

        for (let i = 0; i < routeList.length; i++) {
            if (isCancelled) break;
            const station = routeList[i];

            // 1. Already has coordinates
            if (station.lat && station.lng) {
                currentMapped.push(station);
                setMappedStations([...currentMapped]); 
                continue;
            }

            // 2. Try local station database lookup (instant, no API call)
            const localCoords = findLocalCoords(station);
            if (localCoords) {
                const enriched = { ...station, ...localCoords };
                currentMapped.push(enriched);
                // Do not update state here to avoid massive re-renders for 50+ stations
                continue;
            }

            // 3. Fall back to Google Geocoding API
            const query = `${station.name} Railway Station, India`;
            try {
                await new Promise(r => setTimeout(r, 400)); 
                const result = await new Promise((resolve) => {
                    geocoder.geocode({ address: query }, (results, status) => {
                        resolve(status === 'OK' && results[0] ? results[0] : null);
                    });
                });

                if (result) {
                    const loc = result.geometry.location;
                    const enriched = { ...station, lat: loc.lat(), lng: loc.lng() };
                    currentMapped.push(enriched);
                    setMappedStations([...currentMapped]);
                }
            } catch (e) { console.warn(e); }
        }
        if (!isCancelled) {
            setMappedStations([...currentMapped]);
            setIsGeocoding(false);
        }
    };

    fetchCoordinates();
    return () => { isCancelled = true; };
  }, [googleMapsLoaded, route, mode]);

  const overlaysRef = useRef([]);

  useEffect(() => {
      if (!mapObj) return;

      overlaysRef.current.forEach(o => o.setMap(null));
      overlaysRef.current = [];

      if (mode === 'OVERVIEW' && stations) {
          stations.forEach(stn => {
              // Create glow effect behind station
              const glowMarker = new window.google.maps.Marker({
                  position: { lat: stn.lat, lng: stn.lng },
                  map: mapObj,
                  icon: {
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 12,
                      fillColor: "#3B82F6",
                      fillOpacity: 0.3,
                      strokeColor: "#3B82F6",
                      strokeWeight: 0,
                      strokeOpacity: 0.5
                  },
                  zIndex: 1
              });
              overlaysRef.current.push(glowMarker);
              
              const marker = new window.google.maps.Marker({
                  position: { lat: stn.lat, lng: stn.lng },
                  map: mapObj,
                  icon: {
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 6, fillColor: "#3B82F6", fillOpacity: 0.9, strokeColor: "#fff", strokeWeight: 2
                  },
                  title: stn.name,
                  zIndex: 2
              });
              
              // Add hover info window
              const infoWindow = new window.google.maps.InfoWindow({
                  content: `
                      <style>
                          .gm-style .gm-style-iw-c { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
                          .gm-style .gm-style-iw-d { overflow: visible !important; }
                          .gm-style .gm-style-iw-t::after { display: none !important; }
                      </style>
                      <div style="
                          background: ${isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
                          border: 2px solid #3B82F6;
                          border-radius: 12px;
                          padding: 12px 16px;
                          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                          box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 20px #3B82F640;
                          backdrop-filter: blur(12px);
                          -webkit-backdrop-filter: blur(12px);
                          min-width: 140px;
                      ">
                          <div style="font-weight: 700; font-size: 14px; color: ${isDarkMode ? '#fff' : '#1f2937'}; margin-bottom: 6px; letter-spacing: 0.3px;">
                              ${stn.name}
                          </div>
                          <div style="font-size: 12px; color: ${isDarkMode ? '#e5e7eb' : '#4b5563'}; display: flex; align-items: center; gap: 8px; font-weight: 500;">
                              <div style="width: 10px; height: 10px; background: #3B82F6; border-radius: 50%; border: 2px solid ${isDarkMode ? '#fff' : '#000'}; box-shadow: 0 0 8px #3B82F6;"></div>
                              ${stn.code} - Railway Station
                          </div>
                      </div>
                  `,
                  disableAutoPan: true
              });
              
              marker.addListener('mouseover', () => {
                  infoWindow.open(mapObj, marker);
                  // Enhance glow on hover
                  const glowIcon = glowMarker.getIcon();
                  glowIcon.scale = 15;
                  glowIcon.fillOpacity = 0.5;
                  glowMarker.setIcon(glowIcon);
              });
              
              marker.addListener('mouseout', () => {
                  infoWindow.close();
                  // Reset glow
                  const glowIcon = glowMarker.getIcon();
                  glowIcon.scale = 12;
                  glowIcon.fillOpacity = 0.3;
                  glowMarker.setIcon(glowIcon);
              });
              
              marker.addListener("click", () => onStationClick && onStationClick(stn));
              overlaysRef.current.push(marker);
          });
      }

      if (mode === 'TRACKING' && mappedStations.length > 0) {
          const validPoints = mappedStations.filter(s => s.lat && s.lng);
          if (validPoints.length === 0) return;

          const polyline = new window.google.maps.Polyline({
              path: validPoints.map(p => ({ lat: p.lat, lng: p.lng })),
              geodesic: true,
              strokeColor: "#3B82F6", strokeOpacity: 0.8, strokeWeight: 5,
              map: mapObj
          });
          overlaysRef.current.push(polyline);

          validPoints.forEach(s => {
              let color = "#10B981"; 
              if (s.status === 'passed') color = "#EF4444"; 
              if (s.status === 'current' || s.status === 'approaching') color = "#3B82F6"; 

              // Create glow effect for non-current stations
              if (s.status !== 'current' && s.status !== 'approaching') {
                  const glowMarker = new window.google.maps.Marker({
                      position: { lat: s.lat, lng: s.lng },
                      map: mapObj,
                      icon: {
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 10,
                          fillColor: color,
                          fillOpacity: 0.3,
                          strokeColor: color,
                          strokeWeight: 0,
                          strokeOpacity: 0.5
                      },
                      zIndex: 1
                  });
                  overlaysRef.current.push(glowMarker);
              }

              const marker = new window.google.maps.Marker({
                  position: { lat: s.lat, lng: s.lng },
                  map: mapObj,
                  icon: (s.status === 'current' || s.status === 'approaching') 
                      ? { url: '/svg and animations/train icon.svg', scaledSize: new window.google.maps.Size(60, 60), anchor: new window.google.maps.Point(30, 30) }
                      : {
                          path: window.google.maps.SymbolPath.CIRCLE,
                          fillColor: color, fillOpacity: 1, strokeWeight: 2, strokeColor: "#fff",
                          scale: 5,
                      },
                  title: s.name,
                  zIndex: 2
              });
              
              // Add hover info window
              const statusText = s.status === 'passed' ? 'Passed' : s.status === 'current' ? 'Current Station' : s.status === 'approaching' ? 'Approaching' : 'Upcoming';
              const infoWindow = new window.google.maps.InfoWindow({
                  content: `
                      <style>
                          .gm-style .gm-style-iw-c { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
                          .gm-style .gm-style-iw-d { overflow: visible !important; }
                          .gm-style .gm-style-iw-t::after { display: none !important; }
                      </style>
                      <div style="
                          background: ${isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
                          border: 2px solid ${color};
                          border-radius: 12px;
                          padding: 12px 16px;
                          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                          box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 20px ${color}40;
                          backdrop-filter: blur(12px);
                          -webkit-backdrop-filter: blur(12px);
                          min-width: 140px;
                      ">
                          <div style="font-weight: 700; font-size: 14px; color: ${isDarkMode ? '#fff' : '#1f2937'}; margin-bottom: 6px; letter-spacing: 0.3px;">
                              ${s.name}
                          </div>
                          <div style="font-size: 12px; color: ${isDarkMode ? '#e5e7eb' : '#4b5563'}; display: flex; align-items: center; gap: 8px; font-weight: 500;">
                              <div style="width: 10px; height: 10px; background: ${color}; border-radius: 50%; border: 2px solid ${isDarkMode ? '#fff' : '#000'}; box-shadow: 0 0 8px ${color};"></div>
                              ${s.code || 'Station'} - ${statusText}
                          </div>
                      </div>
                  `,
                  disableAutoPan: true
              });
              
              marker.addListener('mouseover', () => {
                  infoWindow.open(mapObj, marker);
              });
              
              marker.addListener('mouseout', () => {
                  infoWindow.close();
              });
              
              overlaysRef.current.push(marker);

              if (s.status === 'current' || s.status === 'approaching') {
                  marker.setAnimation(window.google.maps.Animation.BOUNCE);
                  const pulse = new window.google.maps.Marker({
                      position: { lat: s.lat, lng: s.lng },
                      map: mapObj,
                      icon: {
                          path: window.google.maps.SymbolPath.CIRCLE,
                          scale: 20, fillColor: "#3B82F6", fillOpacity: 0.2, strokeWeight: 0
                      },
                      zIndex: -1, clickable: false
                  });
                  overlaysRef.current.push(pulse);
              }
          });

          if (validPoints.length > 1) {
              const bounds = new window.google.maps.LatLngBounds();
              validPoints.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
              mapObj.fitBounds(bounds);
          }
      }
  }, [mapObj, mappedStations, mode, stations]); 

  // --- PREPARE DATA FOR CARD ---
  const nextStationDetails = useMemo(() => {
      if (!nextStationData || !route) return null;
      const stn = route.find(s => s.name === nextStationData.next_station);
      return {
          ...nextStationData,
          pf: stn ? stn.platform : '?',
          departure: stn ? (stn.sch_dep !== '-' ? stn.sch_dep : stn.sch_arr) : '-'
      };
  }, [nextStationData, route]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {/* GLOBAL STYLES & SWITCH CSS */}
      <style>{`
        .gmnoprint, .gm-style-cc { display: none !important; }
        
        /* Unified Search Input */
        .input-wrapper { display: flex; align-items: center; justify-content: center; gap: 15px; position: relative; }
        .input {
            border-style: none; height: 50px; width: 50px; padding: 10px; outline: none; border-radius: 50%;
            transition: 0.5s ease-in-out; background-color: #1557c0; box-shadow: 0px 0px 3px #1557c0;
            padding-right: 40px; color: #fff;
            font-family: sans-serif; font-size: 17px;
        }
        .input::placeholder { color: #8f8f8f; }
        .icon {
            display: flex; align-items: center; justify-content: center; position: absolute; right: 0px;
            cursor: pointer; width: 50px; height: 50px; outline: none; border-style: none; border-radius: 50%;
            pointer-events: painted; background-color: transparent; transition: 0.2s linear;
        }
        .icon:focus ~ .input, .input:focus {
            box-shadow: none; width: 280px; border-radius: 0px; background-color: transparent;
            border-bottom: 3px solid #1557c0; transition: all 500ms cubic-bezier(0, 0.11, 0.35, 2);
        }

        /* Theme Switch CSS */
        .theme-toggle-wrapper .switch {
            font-size: 13px; /* Slightly Bigger as requested */
            position: relative;
            display: inline-block;
            width: 4em;
            height: 2.2em;
            border-radius: 30px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .theme-toggle-wrapper .switch input { opacity: 0; width: 0; height: 0; }
        .theme-toggle-wrapper .slider {
            position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
            background-color: #2a2a2a; transition: 0.4s; border-radius: 30px; overflow: hidden;
        }
        .theme-toggle-wrapper .slider:before {
            position: absolute; content: ""; height: 1.2em; width: 1.2em;
            border-radius: 20px; left: 0.5em; bottom: 0.5em;
            transition: 0.4s; transition-timing-function: cubic-bezier(0.81, -0.04, 0.38, 1.5);
            box-shadow: inset 8px -4px 0px 0px #fff;
        }
        .theme-toggle-wrapper .switch input:checked + .slider { background-color: #00a6ff; }
        .theme-toggle-wrapper .switch input:checked + .slider:before {
            transform: translateX(1.8em);
            box-shadow: inset 15px -4px 0px 15px #ffcf48;
        }
        .theme-toggle-wrapper .star {
            background-color: #fff; border-radius: 50%; position: absolute; width: 5px; height: 5px; transition: all 0.4s;
        }
        .theme-toggle-wrapper .star_1 { left: 2.5em; top: 0.5em; }
        .theme-toggle-wrapper .star_2 { left: 2.2em; top: 1.2em; }
        .theme-toggle-wrapper .star_3 { left: 3em; top: 0.9em; }
        .theme-toggle-wrapper .switch input:checked ~ .slider .star { opacity: 0; }
        .theme-toggle-wrapper .cloud {
            width: 3.5em; position: absolute; bottom: -1.4em; left: -1.1em; opacity: 0; transition: all 0.4s;
        }
        .theme-toggle-wrapper .switch input:checked ~ .slider .cloud { opacity: 1; }

        /* Glass Card Styles */
        .glass-card-wrapper { perspective: 1000px; }
        .glass-card-wrapper .card {
            width: 240px; height: 90px; padding: 1rem;
            border-radius: 12px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
            transform: skewX(10deg); transition: all 0.4s ease;
            overflow: hidden; display: flex; flex-direction: column; justify-content: center;
        }
        .card-dark {
             background: rgba(30, 41, 59, 0.7);
             border: 1px solid rgba(255, 255, 255, 0.1);
             box-shadow: 0 20px 30px rgba(0, 0, 0, 0.4);
             color: white;
        }
        .card-light {
             background: rgba(255, 255, 255, 0.7);
             border: 1px solid rgba(0, 0, 0, 0.05);
             box-shadow: 0 20px 30px rgba(0, 0, 0, 0.1);
             color: #1e293b;
        }
        .glass-card-wrapper .card:hover {
            height: 160px; transform: skew(0deg) scale(1.05); z-index: 100;
        }
        .card-dark:hover { background: rgba(30, 41, 59, 0.95); }
        .card-light:hover { background: rgba(255, 255, 255, 0.95); }
        
        .glass-card-wrapper .content {
             display: flex; flex-direction: column; justify-content: center; height: 100%;
             transform: skewX(-10deg); transition: transform 0.4s ease;
        }
        .glass-card-wrapper .card:hover .content { transform: skewX(0deg); }
        
        .glass-card-wrapper .station-name {
            font-size: 1.25rem; font-weight: 900; margin: 0.2rem 0; line-height: 1.1;
            background: linear-gradient(to right, #60a5fa, #34d399); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .glass-card-wrapper .hover-details { max-height: 0; opacity: 0; transition: all 0.4s ease; overflow: hidden; }
        .glass-card-wrapper .card:hover .hover-details { max-height: 100px; opacity: 1; margin-top: 0.8rem; }
        .glass-card-wrapper .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px; }
        .glass-card-wrapper .stat { display: flex; flex-direction: column; }
        .glass-card-wrapper .label { font-size: 0.6rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 2px; }
        .glass-card-wrapper .value { font-size: 0.9rem; font-weight: bold; font-family: monospace; }
      `}</style>
      
      {isGeocoding && mode === 'TRACKING' && (
        <div className="absolute top-4 left-4 bg-slate-900/90 p-2 px-3 rounded-full shadow-lg border border-slate-700 flex items-center gap-2 z-10 animate-pulse text-white">
           <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
           <span className="text-xs font-medium">Plotting Route...</span>
        </div>
      )}

      {nextStationDetails && mode === 'TRACKING' && (
          <NextStationCard 
              nextStationName={nextStationDetails.next_station}
              eta={nextStationDetails.eta}
              pf={nextStationDetails.pf}
              departure={nextStationDetails.departure}
              isDarkMode={isDarkMode}
          />
      )}
    </div>
  );
};

export default function App({ onBack, voiceSearchQuery }) {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("BOARD"); 
  const [sheetState, setSheetState] = useState("hidden"); 
  const [activeStation, setActiveStation] = useState(null);
  const [stationData, setStationData] = useState(null);
  const [trackTrainNo, setTrackTrainNo] = useState(null);
  const [rawTrackData, setRawTrackData] = useState(null); 
  const [manualSearchNo, setManualSearchNo] = useState("");
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [mapZoom, setMapZoom] = useState(6);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default Dark Mode
  const trackStartTimeRef = useRef(0);
  const stationStartTimeRef = useRef(0);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u); 
      else signInAnonymously(auth).catch(console.error);
    });
    return () => unsubAuth();
  }, []);

  // Get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error.message);
          // Keep default center if geolocation fails
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!activeStation) return;
    setStationData(null);
    const stationRef = ref(db, 'stations_data/' + activeStation.code);
    const unsub = onValue(stationRef, (snap) => {
        const val = snap.val();
        if (!val) {
            setStationData(null);
            return;
        }
        if (val.loading_status === 'scanning') {
            setStationData(prev => ({ ...(prev || {}), loading_status: 'scanning', trains: null }));
        } else if (val.loading_status === 'success' || val.trains) {
            setStationData(val);
        }
    });
    return () => unsub();
  }, [activeStation]);

  useEffect(() => {
    if (!trackTrainNo) return;
    setRawTrackData(null);
    const trackRef = ref(db, 'tracking_data/' + trackTrainNo);
    const unsub = onValue(trackRef, (snap) => {
        const val = snap.val();
        if (!val) {
            setRawTrackData(null);
            return;
        }
        if (val.loading_status === 'tracking') {
            // Actively fetching fresh data, do not show previous old data!
            setRawTrackData(null);
        } else if (val.loading_status === 'success' || (val.route && val.route.length > 0)) {
            const routeArray = Array.isArray(val.route) ? val.route : (val.route ? Object.values(val.route) : []);
            setRawTrackData({ ...val, route: routeArray });
        }
    });
    return () => unsub();
  }, [trackTrainNo]); 

  // Voice search trigger - automatically search when voice command is received
  useEffect(() => {
    if (voiceSearchQuery && voiceSearchQuery.trim()) {
      console.log('🎤 Voice search triggered:', voiceSearchQuery);
      handleUnifiedSearch(voiceSearchQuery);
    }
  }, [voiceSearchQuery]); 

  const refreshStation = () => {
    if (!activeStation) return;
    const cmdStr = `${activeStation.code}|${activeStation.id}|${activeStation.name}`;
    setStationData(prev => ({ ...prev, loading_status: 'scanning', trains: null }));
    set(ref(db, 'stations_data/' + activeStation.code + '/loading_status'), 'scanning').catch(() => {});
    set(ref(db, 'cmd/get_station'), cmdStr).catch(console.error);
  };

  const handleTrackClick = (trainNo) => {
    if (!trainNo) return;
    setTrackTrainNo(trainNo);
    setView("TRACKING"); 
    setRawTrackData(null); 
    set(ref(db, 'tracking_data/' + trainNo + '/loading_status'), 'tracking').catch(() => {});
    set(ref(db, 'cmd/track_train'), trainNo).catch(console.error);
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (manualSearchNo.trim()) handleTrackClick(manualSearchNo.trim());
  };

  const handleStationSelect = (e) => {
    const stn = ALL_STATIONS.find(s => s.code === e.target.value);
    if (stn) {
        setActiveStation(stn);
        setMapCenter({ lat: stn.lat, lng: stn.lng });
        setMapZoom(14);
        setSheetState("expanded");
        refreshStation(); 
    }
  };
  
  const handleMapStationClick = (stn) => {
      setActiveStation(stn);
      setMapCenter({ lat: stn.lat, lng: stn.lng });
      setMapZoom(14);
      setSheetState("expanded");
      refreshStation();
  };

  const toggleSheet = () => {
      if (sheetState === 'expanded') setSheetState('minimized');
      else if (sheetState === 'minimized') setSheetState('expanded');
  };

  const goBackToHome = () => {
      setView("BOARD");
      setMapZoom(6);
      setSheetState("hidden");
      setActiveStation(null); 
  };

  const handleBackToDashboard = () => {
      if (onBack) {
          onBack();
      }
  };

  const toggleTheme = () => {
      setIsDarkMode(!isDarkMode);
  };

  // Unified Handler for the new Search UI
  const handleUnifiedSearch = (val) => {
      // Check if it's a train number (numeric)
      if (!isNaN(val) && val.trim().length > 0) {
          handleTrackClick(val);
      } else {
          // Try to find station by code first (exact match)
          let stn = ALL_STATIONS.find(s => s.code === val);
          
          // If not found by code, try searching by name (case-insensitive partial match)
          if (!stn) {
              const searchTerm = val.toLowerCase().trim();
              stn = ALL_STATIONS.find(s => 
                  s.name.toLowerCase().includes(searchTerm) || 
                  s.code.toLowerCase() === searchTerm
              );
          }
          
          if (stn) {
            setActiveStation(stn);
            setMapCenter({ lat: stn.lat, lng: stn.lng });
            setMapZoom(14);
            setSheetState("expanded");
            refreshStation();
          } else {
              console.warn('Station not found:', val);
          }
      }
  };
  
  const handleStationSelectRaw = (code) => handleUnifiedSearch(code);

  const displayedTrains = stationData ? filterUpcomingTrains(stationData.trains) : [];

  const renderTimelineWithInListDays = () => {
      if (!rawTrackData?.route) return null;
      const routeList = Array.isArray(rawTrackData.route) ? rawTrackData.route : Object.values(rawTrackData.route);
      if (routeList.length === 0) return null;
      
      let currentDay = 1;
      let previousTime = -1;
      const startDateStr = rawTrackData.start_date || rawTrackData.journey_date; 
      const totalStations = routeList.length;
      
      // Helper: Convert "10:50 PM" or "22:50" to minutes since midnight
      const parseTimeToMinutes = (timeStr) => {
          if (!timeStr || timeStr === '-') return -1;
          // Handle AM/PM format: "10:50 PM", "03:56 AM"
          const ampmMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (ampmMatch) {
              let h = parseInt(ampmMatch[1], 10);
              const m = parseInt(ampmMatch[2], 10);
              const period = ampmMatch[3].toUpperCase();
              if (period === 'PM' && h !== 12) h += 12;
              if (period === 'AM' && h === 12) h = 0;
              return h * 60 + m;
          }
          // Handle 24-hour format: "22:50"
          const match24 = timeStr.match(/(\d{1,2}):(\d{2})/);
          if (match24) {
              return parseInt(match24[1], 10) * 60 + parseInt(match24[2], 10);
          }
          return -1;
      };
      
      return routeList.map((stn, index) => {
          let dayBadge = null;
          
          const timeStr = stn.sch_dep !== '-' ? stn.sch_dep : stn.sch_arr;
          const currentTime = parseTimeToMinutes(timeStr);
          
          if (currentTime >= 0) {
              if (index === 0) {
                  dayBadge = { isSource: true, day: 1, date: getDateForDay(startDateStr, 1) };
              } else if (currentTime < previousTime) {
                  currentDay++;
                  dayBadge = { isSource: false, day: currentDay, date: getDateForDay(startDateStr, currentDay) };
              }
              previousTime = currentTime;
          }

          return (
              <TimelineItem 
                  key={index} 
                  station={stn} 
                  isLast={index === totalStations - 1}
                  dayBadge={dayBadge}
                  isFirstOfDay={false} 
                  isDarkMode={isDarkMode}
              />
          );
      });
  };

  return (
    <div className={`relative h-screen w-full font-sans overflow-hidden flex flex-col ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      {/* VIEW 1: HOME PAGE (BOARD) */}
      {view === "BOARD" && (
        <>
            <div className="absolute inset-0 z-0">
                <MapView 
                    center={mapCenter} 
                    zoom={mapZoom} 
                    mode="OVERVIEW"
                    stations={ALL_STATIONS}
                    onStationClick={handleMapStationClick}
                    isDarkMode={isDarkMode}
                />
            </div>
            <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-start justify-between pointer-events-auto">
                    {/* BACK BUTTON */}
                    <div className="pointer-events-auto">
                        <CustomBackButton onClick={handleBackToDashboard} />
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <UnifiedSearch 
                            onSearch={handleUnifiedSearch} 
                            onStationSelect={handleStationSelectRaw} 
                            stations={ALL_STATIONS}
                        />
                        <ThemeSwitch isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
                    </div>
                </div>
            </div>
            <div className={`fixed inset-x-0 bottom-0 z-20 transition-transform duration-500 flex flex-col ${sheetState === 'hidden' ? 'translate-y-full' : 'translate-y-0'}`} style={{ height: sheetState === 'minimized' ? 'auto' : '60vh' }}>
                <div className={`rounded-t-3xl flex flex-col h-full border-b-0 backdrop-blur-xl border-t ${isDarkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200 shadow-xl'}`}>
                    <div className={`w-full p-4 flex flex-col gap-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                        <div className="flex justify-between items-center w-full px-2" onClick={toggleSheet}>
                            <div className="flex flex-col flex-grow cursor-pointer">
                                <h2 className={`text-xl font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{activeStation?.name || "Select Station"} <span className={`text-xs px-2 rounded font-mono ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>{activeStation?.code}</span></h2>
                                <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Live Station Board</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={(e) => { e.stopPropagation(); refreshStation(); }} disabled={stationData?.loading_status === 'scanning'} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all">
                                    <RefreshCw size={14} className={stationData?.loading_status === 'scanning' ? 'animate-spin' : ''}/>
                                    {stationData?.loading_status === 'scanning' ? 'Scanning...' : 'Scan for Trains'}
                                </button>
                                <div onClick={toggleSheet} className={`p-2 rounded-full cursor-pointer ${isDarkMode ? 'bg-slate-800/50 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'}`}>
                                    {sheetState === 'expanded' ? <ChevronDown size={20}/> : <ChevronUp size={20}/>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`flex-grow overflow-y-auto custom-scrollbar p-4 ${sheetState === 'minimized' ? 'hidden' : 'block'}`}>
                        {(!stationData?.trains) ? <div className={`text-center p-8 opacity-50 flex flex-col items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-500'}`}><Train size={48} className="opacity-20"/><p>Ready to Scan</p></div> : 
                         <div className="grid gap-3">
                            {displayedTrains.length > 0 ? displayedTrains.map((t, i) => (
                                <div key={i} onClick={() => handleTrackClick(t.number)} className={`p-4 rounded-xl cursor-pointer transition-all border flex flex-col gap-3 group ${isDarkMode ? 'bg-slate-800/40 hover:bg-slate-700/50 border-white/5' : 'bg-white hover:bg-slate-50 border-slate-200 shadow-sm'}`}>
                                    <div className="flex justify-between items-center">
                                        <div className={`font-bold text-lg flex items-center gap-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                                            {t.number} <span className={`text-sm font-normal truncate max-w-[150px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.name}</span>
                                        </div>
                                        <div className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${t.status.includes('Late') ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-500'}`}>{t.status}</div>
                                    </div>
                                    <div className={`flex items-center justify-between p-2 rounded-lg border ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
                                        {t.currently_at ? (
                                            /* New layout: Show currently-at location */
                                            <>
                                            <div className="flex flex-col flex-1">
                                                <span className={`text-[10px] uppercase tracking-wide ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Currently At</span>
                                                <span className={`font-bold truncate ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>{t.currently_at}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <ArrowRight size={16} className={isDarkMode ? 'text-slate-500' : 'text-slate-400'} />
                                            </div>
                                            </>
                                        ) : (
                                            /* Legacy layout with times */
                                            <>
                                            <div className="flex flex-col"><span className={`text-[10px] uppercase tracking-wide ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Arrival</span><span className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{formatToAmPm(t.arrival)}</span></div>
                                            <div className="flex flex-col items-center">
                                                <div className="h-px w-8 bg-slate-400/30 my-1 relative"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-slate-400 rounded-full"></div></div>
                                                <div className={`text-xs font-bold px-2 py-0.5 rounded border ${t.platform === 'TBD' ? (isDarkMode ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-white text-slate-400 border-slate-300') : (isDarkMode ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-yellow-100 text-yellow-700 border-yellow-200')}`}>PF {t.platform === 'TBD' ? '?' : t.platform}</div>
                                            </div>
                                            <div className="flex flex-col text-right"><span className={`text-[10px] uppercase tracking-wide ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Departure</span><span className={`font-mono font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{formatToAmPm(t.departure)}</span></div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )) : <div className={`text-center p-8 opacity-50 ${isDarkMode ? 'text-white' : 'text-slate-500'}`}>No upcoming trains found.</div>}
                         </div>
                        }
                    </div>
                </div>
            </div>
        </>
      )}

      {/* VIEW 2: TRACKING PAGE (DEDICATED) */}
      {view === "TRACKING" && (
        <div className="flex flex-col md:flex-row h-full w-full animate-in fade-in">
             <div className={`w-full md:w-[400px] border-r flex flex-col z-30 shadow-2xl shrink-0 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className={`p-4 border-b backdrop-blur sticky top-0 z-10 ${isDarkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white/90'}`}>
                      <div className="mb-4">
                        <CustomBackButton onClick={goBackToHome} />
                      </div>
                      
                      <div className="flex justify-between items-center"><h1 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{trackTrainNo} <span className="text-emerald-500 text-xs px-2 border border-emerald-500/30 rounded bg-emerald-500/10">LIVE</span></h1><Train size={24} className="opacity-50"/></div>
                      <div className={`mt-4 p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                          <div className="text-xs opacity-50 uppercase">Current Location</div>
                          <div className={`font-bold truncate ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                              {rawTrackData?.current_location && typeof rawTrackData?.current_location === 'string' ? rawTrackData.current_location : "Locating..."}
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-12 gap-2 mt-6 px-2 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                          <div className="col-span-1"></div>
                          <div className="col-span-5 pl-2">Station</div>
                          <div className="col-span-3">Arrival</div>
                          <div className="col-span-3 text-right">Departure</div>
                      </div>
                  </div>
                  
                  <div className={`flex-grow overflow-y-auto custom-scrollbar p-0 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
                        {rawTrackData?.route ? (
                            <div className="pb-4 pt-2">
                                {renderTimelineWithInListDays()}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                <RefreshCw className="animate-spin mb-2"/>
                                <span>Loading Route...</span>
                            </div>
                        )}
                  </div>
             </div>
             <div className={`flex-grow relative h-[50vh] md:h-auto ${isDarkMode ? 'bg-slate-950' : 'bg-slate-200'}`}>
                 <MapView 
                    mode="TRACKING"
                    route={rawTrackData?.route} 
                    center={mapCenter}
                    zoom={mapZoom}
                    nextStationData={rawTrackData}
                    isDarkMode={isDarkMode}
                 />
             </div>
        </div>
      )}
    </div>
  );
}