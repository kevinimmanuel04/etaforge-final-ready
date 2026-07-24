import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  Bus, Navigation, Train, X, GripHorizontal, IndianRupee, ChevronDown, MapPin, Clock, ArrowLeft, Footprints, Zap
} from 'lucide-react';

// --- CONFIGURATION ---
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBta64CrHTAb8w0cTJV9eLl1PjecrQ5O2Q"; 
const BENGALURU_CENTER = { lat: 12.9716, lng: 77.5946 };
const BACKEND_URL = "http://localhost:3000";

// --- STATIC DATA ---
// --- DATA: METRO STATIONS ---
const METRO_STATIONS = {
  Purple: [
    { name: "Whitefield (Kadugodi)", lat: 12.9959, lng: 77.7621 },
    { name: "Hopefarm Channasandra", lat: 12.9820, lng: 77.7480 },
    { name: "Kadugodi Tree Park", lat: 12.9880, lng: 77.7550 },
    { name: "Pattandur Agrahara", lat: 12.9780, lng: 77.7400 },
    { name: "Nallurhalli", lat: 12.9730, lng: 77.7250 },
    { name: "Kundalahalli", lat: 12.9710, lng: 77.7150 },
    { name: "Seetharamapalya", lat: 12.9700, lng: 77.7050 },
    { name: "Hoodi", lat: 12.9720, lng: 77.6950 },
    { name: "Garudacharapalya", lat: 12.9750, lng: 77.6850 },
    { name: "Singayyanapalya", lat: 12.9800, lng: 77.6750 },
    { name: "Krishnarajapura (KR Pura)", lat: 12.9950, lng: 77.6650 },
    { name: "Benniganahalli", lat: 12.9900, lng: 77.6550 },
    { name: "Baiyappanahalli", lat: 12.9906, lng: 77.6527 },
    { name: "Swami Vivekananda Road", lat: 12.9850, lng: 77.6350 },
    { name: "Indiranagar", lat: 12.9784, lng: 77.6408 },
    { name: "Halasuru", lat: 12.9760, lng: 77.6250 },
    { name: "Trinity", lat: 12.9740, lng: 77.6180 },
    { name: "MG Road", lat: 12.9750, lng: 77.6090 },
    { name: "Cubbon Park", lat: 12.9810, lng: 77.5970 },
    { name: "Vidhana Soudha", lat: 12.9790, lng: 77.5920 },
    { name: "Sir M. Visvesvaraya", lat: 12.9760, lng: 77.5880 },
    { name: "Majestic", lat: 12.9757, lng: 77.5728 },
    { name: "City Railway Station", lat: 12.9781, lng: 77.5696 },
    { name: "Magadi Road", lat: 12.9760, lng: 77.5550 },
    { name: "Hosahalli", lat: 12.9740, lng: 77.5450 },
    { name: "Vijayanagar", lat: 12.9710, lng: 77.5350 },
    { name: "Attiguppe", lat: 12.9650, lng: 77.5280 },
    { name: "Deepanjali Nagar", lat: 12.9550, lng: 77.5250 },
    { name: "Mysuru Road", lat: 12.9460, lng: 77.5200 },
    { name: "Pantharapalya", lat: 12.9400, lng: 77.5100 },
    { name: "Rajarajeshwari Nagar", lat: 12.9300, lng: 77.5000 },
    { name: "Jnanabharathi", lat: 12.9250, lng: 77.4950 },
    { name: "Pattanagere", lat: 12.9200, lng: 77.4900 },
    { name: "Kengeri Bus Terminal", lat: 12.9150, lng: 77.4850 },
    { name: "Kengeri", lat: 12.9080, lng: 77.4780 },
    { name: "Challaghatta", lat: 12.9000, lng: 77.4700 }
  ],
  Green: [
    { name: "Madavara", lat: 13.0540, lng: 77.4900 }, 
    { name: "Nagasandra", lat: 13.0480, lng: 77.5000 },
    { name: "Dasarahalli", lat: 13.0430, lng: 77.5100 },
    { name: "Jalahalli", lat: 13.0380, lng: 77.5200 },
    { name: "Peenya Industry", lat: 13.0330, lng: 77.5300 },
    { name: "Peenya", lat: 13.0280, lng: 77.5400 },
    { name: "Goraguntepalya", lat: 13.0230, lng: 77.5500 },
    { name: "Yeshwanthpur", lat: 13.0180, lng: 77.5600 },
    { name: "Sandal Soap Factory", lat: 13.0130, lng: 77.5700 },
    { name: "Mahalakshmi", lat: 13.0080, lng: 77.5800 },
    { name: "Rajajinagara", lat: 13.0030, lng: 77.5900 },
    { name: "Kuvempu Road", lat: 12.9980, lng: 77.5800 },
    { name: "Srirampura", lat: 12.9930, lng: 77.5700 },
    { name: "Mantri Square Sampige Road", lat: 12.9880, lng: 77.5700 },
    { name: "Majestic", lat: 12.9757, lng: 77.5728 },
    { name: "Chickpete", lat: 12.9700, lng: 77.5750 },
    { name: "KR Market", lat: 12.9650, lng: 77.5750 },
    { name: "National College", lat: 12.9500, lng: 77.5750 },
    { name: "Lalbagh", lat: 12.9450, lng: 77.5750 },
    { name: "South End Circle", lat: 12.9400, lng: 77.5750 },
    { name: "Jayanagar", lat: 12.9300, lng: 77.5800 },
    { name: "Rashtreeya Vidyalaya Road", lat: 12.9200, lng: 77.5800 },
    { name: "Banashankari", lat: 12.9150, lng: 77.5750 },
    { name: "JP Nagar", lat: 12.9100, lng: 77.5750 },
    { name: "Yelachenahalli", lat: 12.9000, lng: 77.5750 },
    { name: "Konanakunte Cross", lat: 12.8900, lng: 77.5750 },
    { name: "Doddakallasandra", lat: 12.8800, lng: 77.5750 },
    { name: "Vajarahalli", lat: 12.8700, lng: 77.5750 },
    { name: "Thalaghattapura", lat: 12.8600, lng: 77.5750 },
    { name: "Silk Institute", lat: 12.8500, lng: 77.5750 }
  ],
  Yellow: [
      { name: "Rashtreeya Vidyalaya Road", lat: 12.9200, lng: 77.5800 },
      { name: "Jayadeva Hospital", lat: 12.9160, lng: 77.6000 },
      { name: "BTM Layout", lat: 12.9150, lng: 77.6100 },
      { name: "Central Silk Board", lat: 12.9170, lng: 77.6230 },
      { name: "Bommanahalli", lat: 12.9100, lng: 77.6300 },
      { name: "Hongasandra", lat: 12.9000, lng: 77.6350 },
      { name: "Kudlu Gate", lat: 12.8900, lng: 77.6400 },
      { name: "Singasandra", lat: 12.8800, lng: 77.6450 },
      { name: "Hosa Road", lat: 12.8700, lng: 77.6500 },
      { name: "Beratena Agrahara", lat: 12.8600, lng: 77.6550 },
      { name: "Electronic City", lat: 12.8500, lng: 77.6650 },
      { name: "Infosys Foundation Konappana Agrahara", lat: 12.8450, lng: 77.6700 },
      { name: "Huskur Road", lat: 12.8350, lng: 77.6750 },
      { name: "Biocon Hebbagodi", lat: 12.8250, lng: 77.6800 },
      { name: "Delta Electronics Bommasandra", lat: 12.8166, lng: 77.6914 }
  ]
};

const ALL_STATIONS_RAW = [...METRO_STATIONS.Purple, ...METRO_STATIONS.Green, ...METRO_STATIONS.Yellow];
const ALL_METRO_STATIONS = Array.from(new Map(ALL_STATIONS_RAW.map(s => [s.name, s])).values()).sort((a,b) => a.name.localeCompare(b.name));

// --- HELPERS ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
};
const getApproxDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
const deg2rad = (deg) => deg * (Math.PI / 180);



const calculateMetroFare = (dist) => {
    if (dist <= 2) return 10;
    if (dist <= 4) return 20;
    if (dist <= 6) return 30;
    if (dist <= 8) return 50; 
    if (dist <= 10) return 50;
    if (dist > 25) return 90;
    return Math.min(50 + Math.ceil((dist - 10)/2) * 10, 90); 
};
const calculateBusFare = (dist) => {
    const numDist = parseFloat(dist) || 10; 
    const stages = Math.ceil(numDist / 2);
    let fare = stages <= 1 ? 6 : stages === 2 ? 12 : stages === 3 ? 18 : 6 * stages;
    return Math.min(fare, 35);
};

// --- COMPONENTS ---
const GlassPanel = ({ children, className = "", onClick, isDarkMode }) => (
  <div onClick={onClick} className={`backdrop-blur-xl border shadow-2xl rounded-2xl transition-colors duration-300 ${isDarkMode ? 'bg-gray-900/95 border-gray-700 text-white shadow-black/20' : 'bg-white/95 border-gray-200 text-gray-900 shadow-xl'} ${className}`}>{children}</div>
);

const ThemeToggle = ({ isDarkMode, toggleTheme }) => (
    <div className="absolute top-4 right-4 z-50 pointer-events-auto">
        <style>{`
          .switch { font-size: 17px; position: relative; display: inline-block; width: 4em; height: 2.2em; border-radius: 30px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
          .switch input { opacity: 0; width: 0; height: 0; }
          .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #2a2a2a; transition: 0.4s; border-radius: 30px; overflow: hidden; }
          .slider:before { position: absolute; content: ""; height: 1.2em; width: 1.2em; border-radius: 20px; left: 0.5em; bottom: 0.5em; transition: 0.4s; transition-timing-function: cubic-bezier(0.81, -0.04, 0.38, 1.5); box-shadow: inset 8px -4px 0px 0px #fff; }
          .switch input:checked + .slider { background-color: #00a6ff; }
          .switch input:checked + .slider:before { transform: translateX(1.8em); box-shadow: inset 15px -4px 0px 15px #ffcf48; }
          .star { background-color: #fff; border-radius: 50%; position: absolute; width: 5px; transition: all 0.4s; height: 5px; }
          .star_1 { left: 2.5em; top: 0.5em; }
          .star_2 { left: 2.2em; top: 1.2em; }
          .star_3 { left: 3em; top: 0.9em; }
          .switch input:checked ~ .slider .star { opacity: 0; }
          .cloud { width: 3.5em; position: absolute; bottom: -1.4em; left: -1.1em; opacity: 0; transition: all 0.4s; }
          .switch input:checked ~ .slider .cloud { opacity: 1; }
        `}</style>
        <label className="switch">
            <input checked={!isDarkMode} onChange={toggleTheme} type="checkbox" />
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

const ModeSwitcher = ({ currentMode, onSwitch, isDarkMode }) => (
    <div className="pointer-events-auto flex items-center justify-center">
        <style>{`
          .tabs { display: flex; position: relative; background-color: ${isDarkMode ? '#1f2937' : '#fff'}; box-shadow: 0 0 1px 0 rgba(24, 94, 224, 0.15), 0 6px 12px 0 rgba(24, 94, 224, 0.15); padding: 0.5rem; border-radius: 99px; }
          .tabs * { z-index: 2; }
          .tab-container input[type="radio"] { display: none; }
          .tab { display: flex; align-items: center; justify-content: center; height: 35px; width: 70px; font-size: 0.8rem; color: ${isDarkMode ? '#fff' : '#000'}; font-weight: 600; border-radius: 99px; cursor: pointer; transition: color 0.15s ease-in; text-transform: uppercase; }
          .tab-container input[type="radio"]:checked + label { color: #185ee0; }
          .tab-container input[id="radio-1"]:checked ~ .glider { transform: translateX(0); }
          .tab-container input[id="radio-2"]:checked ~ .glider { transform: translateX(100%); }
          .tab-container input[id="radio-3"]:checked ~ .glider { transform: translateX(200%); }
          .glider { position: absolute; display: flex; height: 35px; width: 70px; background-color: #e6eef9; z-index: 1; border-radius: 99px; transition: 0.25s ease-out; }
        `}</style>
        <div className="tab-container">
            <div className="tabs">
                <input type="radio" id="radio-1" name="tabs" checked={currentMode === 'bus-view'} onChange={() => onSwitch('bus-view')} />
                <label className="tab" htmlFor="radio-1">BUS</label>
                <input type="radio" id="radio-2" name="tabs" checked={currentMode === 'metro-view'} onChange={() => onSwitch('metro-view')} />
                <label className="tab" htmlFor="radio-2">METRO</label>
                <input type="radio" id="radio-3" name="tabs" checked={currentMode === 'hybrid-view'} onChange={() => onSwitch('hybrid-view')} />
                <label className="tab" htmlFor="radio-3">HYBRID</label>
                <span className="glider" />
            </div>
        </div>
    </div>
);

// --- STATIC MOCK DATA FOR HYBRID ROUTE (FAILSAFE) ---
const DEFAULT_HYBRID_ROUTE = {
    segments: [
        { type: 'walk', from: 'Your Location', to: 'Majestic', time: 15, dist: '1.2', path: [{lat: 12.9756, lng: 77.5728}, {lat: 12.9756, lng: 77.5728}] },
        { type: 'metro', from: 'Majestic', to: 'Whitefield (Kadugodi)', time: 35, dist: 18, fare: 35, line: 'Purple' },
        { type: 'walk', from: 'Whitefield (Kadugodi)', to: 'ITPL', time: 10, dist: '0.8', path: [{lat: 12.9959, lng: 77.7621}, {lat: 12.9859, lng: 77.7516}] }
    ],
    totalTime: 60,
    totalFare: 35,
    startLoc: { lat: 12.9756, lng: 77.5728 },
    endLoc: { lat: 12.9859, lng: 77.7516 },
    startStation: { lat: 12.9756, lng: 77.5728, name: "Majestic" },
    endStation: { lat: 12.9959, lng: 77.7621, name: "Whitefield (Kadugodi)" }
};

const TransportApp = () => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [google, setGoogle] = useState(null);
    const [directionsService, setDirectionsService] = useState(null);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);
    const [placesService, setPlacesService] = useState(null);

    // App State
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [view, setView] = useState('input'); 
    
    // Config
    const [detectedRouteNo, setDetectedRouteNo] = useState("Unknown");

    // Simulation
    const [inputs, setInputs] = useState({ start: 'Majestic', end: 'Whitefield' });
    const [routeData, setRouteData] = useState(null);
    const [busStops, setBusStops] = useState([]);
    const [journeyBuses, setJourneyBuses] = useState([]);
    const journeyBusesRef = useRef([]);
    const [selectedBus, setSelectedBus] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Metro State
    const [selectedStartStation, setSelectedStartStation] = useState(null);
    const [selectedEndStation, setSelectedEndStation] = useState(null);
    const [metroStats, setMetroStats] = useState({ dist: 0, fare: 0, time: 0 });
    const [activeMetroLines, setActiveMetroLines] = useState(null); 
    const [hybridRoute, setHybridRoute] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    // Backend
    const [backendData, setBackendData] = useState({ signals: [], stops: [], routeNumbers: [], routeStops: {}, routesList: [] });
    // Ref for Live Data to avoid re-renders in loop
    const liveDataRef = useRef({ signals: [], buses: [], metros: [] });
    const markerInstances = useRef({});
    const polylineInstances = useRef([]);
    const hybridPolyRefs = useRef([]);
    const dragControls = useDragControls();

    // ... (map styles omitted) ...

    // --- HYBRID ROUTE LOGIC ---
    // ... (calculateHybridRoute omitted) ...
    
    // Draw the Hybrid Path (Walking + Metro)
    const drawHybridElements = () => {
         if (!map || !google) return;
         
         // 1. Clear previous hybrid lines
         if (hybridPolyRefs.current.length > 0) {
             hybridPolyRefs.current.forEach(p => p.setMap(null));
             hybridPolyRefs.current = [];
         }
         
         if (!hybridRoute) return;
         
         // 2. Walking Paths (Dotted / Dashed Line)
         const lineSymbol = {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            scale: 3,
            strokeColor: '#0ea5e9' // Sky Blue
         };
         
         // Segment 1: Start -> Station
         const walkPoly1 = new google.maps.Polyline({
             path: hybridRoute.segments[0].path || [hybridRoute.startLoc, hybridRoute.startStation], 
             map: map, 
             strokeColor: '#0ea5e9',
             strokeOpacity: 0.8, 
             strokeWeight: 6,
             icons: [{ icon: lineSymbol, offset: '0', repeat: '20px' }],
             zIndex: 999 
         });
         hybridPolyRefs.current.push(walkPoly1);
         
         // Segment 3: Station -> End
         const walkPoly2 = new google.maps.Polyline({
             path: hybridRoute.segments[2].path || [hybridRoute.endStation, hybridRoute.endLoc], 
             map: map, 
             strokeColor: '#0ea5e9',
             strokeOpacity: 0.8, 
             strokeWeight: 6,
             icons: [{ icon: lineSymbol, offset: '0', repeat: '20px' }],
             zIndex: 999 
         });
         hybridPolyRefs.current.push(walkPoly2);
         
         // 3. Markers (Start/End)
         const startMk = new google.maps.Marker({ 
             position: hybridRoute.startLoc, map: map, title: "Your Location", 
             icon: { path: google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: "#0ea5e9", fillOpacity: 1, strokeColor: "white", strokeWeight: 2 } 
         });
         const endMk = new google.maps.Marker({ 
             position: hybridRoute.endLoc, map: map, title: "Destination", 
             icon: { path: google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: "#ef4444", fillOpacity: 1, strokeColor: "white", strokeWeight: 2 } 
         });
         
         markerInstances.current['hybrid-start'] = startMk;
         markerInstances.current['hybrid-end'] = endMk;
    };
    const darkMapStyle = [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] }, // Hide POIs
        { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] } // Hide default transit icons
    ];
    const lightMapStyle = [
         { featureType: "poi", stylers: [{ visibility: "off" }] },
         { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] }
    ];

    // --- INIT ---
    useEffect(() => {
        const fetchStatic = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/static`);
                const data = await res.json();
                let stopsArray = [];
                if (Array.isArray(data.stops)) stopsArray = data.stops;
                else if (data.stops) stopsArray = Object.values(data.stops);
                
                setBackendData(prev => ({ 
                    ...prev, 
                    signals: data.signals, 
                    stops: stopsArray, 
                    routeNumbers: data.routeNumbers || [],
                    routeStops: data.routeStops || {},
                    routesList: data.routesList || [],
                    metroLines: data.metroLines || []
                }));
            } catch(e) { console.error(e); }
        };
        fetchStatic();
        
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `.gmnoprint a, .gmnoprint span, .gm-style-cc { display: none; } .gmnoprint div { background: none !important; } img[src*="google_white"] { display: none; } img[src*="google_on_white"] { display: none; } .gm-bundled-control .gmnoprint { display: block; }`;
        document.head.appendChild(style);

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
        script.async = true;
        script.onload = () => {
            const g = window.google;
            setGoogle(g);
            const m = new g.maps.Map(mapRef.current, {
                center: BENGALURU_CENTER, zoom: 13, disableDefaultUI: true, styles: darkMapStyle, gestureHandling: 'greedy', zoomControl: false, scrollwheel: true
            });
            setMap(m);
            setDirectionsService(new g.maps.DirectionsService());
            setDirectionsRenderer(new g.maps.DirectionsRenderer({ map: m, suppressMarkers: true, polylineOptions: { strokeColor: "#3b82f6", strokeWeight: 6, strokeOpacity: 0.8 } }));
            setPlacesService(new g.maps.places.PlacesService(m));
        };
        document.body.appendChild(script);

        // Get User Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
                    setUserLocation(loc);
                    console.log("User Location Detected:", loc);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    // Fallback to Majestic or keep null (will use default in calc)
                }, 
                { enableHighAccuracy: true }
            );
        }
    }, []);

    useEffect(() => { if (map) map.setOptions({ styles: isDarkMode ? darkMapStyle : lightMapStyle }); }, [isDarkMode, map]);

    // --- LOGIC: FIND REAL STOPS ALONG PATH ---
    const findStopsAlongRoute = (pathPoints) => {
        if (!backendData.stops.length) return [];
        if (!google) return [];
        const polyline = new google.maps.Polyline({ path: pathPoints });
        
        const matchedStops = backendData.stops.filter(stop => {
            const pos = new google.maps.LatLng(stop.lat, stop.lon);
            return google.maps.geometry.poly.isLocationOnEdge(pos, polyline, 0.0005); // ~50m tolerance
        });
        
        const stopsWithIdx = matchedStops.map(s => {
            let minD = Infinity;
            let idx = 0;
            for(let i=0; i<pathPoints.length; i+=Math.ceil(pathPoints.length/50)) { 
                 const d = getApproxDistanceMeters(s.lat, s.lon, pathPoints[i].lat(), pathPoints[i].lng());
                 if (d < minD) { minD = d; idx = i; }
            }
            return { ...s, idx };
        });
        
        return stopsWithIdx.sort((a,b) => a.idx - b.idx);
    };

    // --- LOGIC: FIND BUS STOP NAME BY LOCATION (GOOGLE PLACES) ---
    const findNearestBusStationName = (location) => {
        return new Promise((resolve) => {
            if(!placesService) resolve(null);
            
            const request = {
                location: location,
                radius: '500', // 500m radius
                type: ['bus_station']
            };

            placesService.nearbySearch(request, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                    resolve(results[0].name); // Return best match name
                } else {
                    resolve(null);
                }
            });
        });
    };

    // --- LOGIC: FIND ROUTE BY NAME ---
    const findRouteByName = async (startLoc, endLoc) => {
        // Wrapper to add timeout to promises
        const withTimeout = (promise, ms) => {
            return Promise.race([
                promise,
                new Promise(resolve => setTimeout(() => resolve(null), ms))
            ]);
        };

        // 1. Get Google Maps Bus Station Names (Parallel & Timeout limited)
        // We limit lookup to 2.5s max to prevent UI freeze
        const [startResults, endResults] = await Promise.all([
            withTimeout(findNearestBusStationName(startLoc), 2500),
            withTimeout(findNearestBusStationName(endLoc), 2500)
        ]);

        const startStation = startResults || inputs.start;
        const endStation = endResults || inputs.end;
        
        console.log(`Matching Route for: ${startStation} -> ${endStation}`);

        // 2. Fuzzy Match against backend routes
        const startTokens = tokenize(startStation);
        const endTokens = tokenize(endStation);
        
        const candidates = backendData.routesList.filter(r => {
             const nameVal = r.longName.toLowerCase();
             const hasStart = startTokens.some(t => nameVal.includes(t));
             const hasEnd = endTokens.some(t => nameVal.includes(t));
             return hasStart && hasEnd;
        });
        
        if (candidates.length > 0) {
            return candidates[0].id; 
        }
        
        return null; 
    };
    
    const tokenize = (str) => {
        return str.toLowerCase().split(/[\s,-]+/).filter(w => w.length > 3 && w !== 'station' && w !== 'bus' && w !== 'stand');
    };

    const cleanRouteId = (id) => {
        if(!id) return id;
        if (backendData.routeNumbers.includes(id)) return id;
        const match = id.match(/([0-9]+[A-Z]+|[0-9]+)/);
        if (match) return match[0];
        return id;
    };

    // --- SIMULATION LOOP ---
    useEffect(() => {
        if (!map || !google) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/live`);
                const data = await res.json();
                liveDataRef.current = data; 
            } catch (e) {}

            // Physics Loop
            if (journeyBusesRef.current.length > 0) {
                 const signals = liveDataRef.current.signals || [];
                 journeyBusesRef.current.forEach(bus => {
                     const path = bus.fullPath;
                     if (!path || path.length < 2) return;
                     
                     // Signal Check
                     let stopped = false;
                     if (signals.length > 0 && backendData.signals.length > 0) {
                         const currentPos = path[Math.floor(bus.pathIndex)];
                         for(let sig of backendData.signals) { 
                             const liveSig = signals.find(s => s.id === sig.id);
                             if (liveSig && liveSig.phase === 'red') {
                                 const dist = getApproxDistanceMeters(currentPos.lat(), currentPos.lng(), sig.lat, sig.lon);
                                 if (dist < 40) { stopped = true; break; }
                             }
                         }
                     }

                     if (!stopped) {
                         bus.pathIndex += bus.speed;
                         if (bus.pathIndex >= path.length - 1) bus.pathIndex = 0; 
                     }
                     if (busStops.length > 0) {
                        const next = busStops.find(s => s.idx > bus.pathIndex);
                        bus.nextStopName = next ? next.name : busStops[0].name; 
                     }
                 });
            }
            drawEntities();
        }, 100); 
        return () => clearInterval(interval);
    }, [map, view, busStops]); 

    // --- HELPERS: METRO RECOMMENDATION ---
    const getNearestMetro = (lat, lng) => {
        let nearest = ALL_METRO_STATIONS[0];
        let minDist = Infinity;
        ALL_METRO_STATIONS.forEach(st => {
            const d = calculateDistance(lat, lng, st.lat, st.lng);
            if (d < minDist) { minDist = d; nearest = st; }
        });
        return { station: nearest, dist: minDist };
    };
    
    const updateMetroStats = (start, end) => {
        if(!start || !end) return;
        const dist = calculateDistance(start.lat, start.lng, end.lat, end.lng);
        const trackDist = dist * 1.3; // Approx track distance vs bird-flight
        const fare = calculateMetroFare(trackDist);
        const time = Math.ceil((trackDist / 35) * 60); // 35km/h avg speed
        setMetroStats({ dist: trackDist.toFixed(1), fare, time });
    };

    const recommendMetroStations = (startLat, startLng, endLat, endLng) => {
        if (!startLat || !endLat) return;
        const start = getNearestMetro(startLat, startLng);
        const end = getNearestMetro(endLat, endLng);
        
        setSelectedStartStation(start.station);
        setSelectedEndStation(end.station);
        updateMetroStats(start.station, end.station);

        // Optional: Filter lines? For now show all.
        // setActiveMetroLines(...)
    };

    const getNextStationName = (metro) => {
        if (!metro || !metro.lineId) return "Next Station";
        const lineKey = metro.lineId.toLowerCase().includes('purple') ? 'Purple' : 
                        (metro.lineId.toLowerCase().includes('green') ? 'Green' : 'Yellow');
        const stations = METRO_STATIONS[lineKey];
        if (!stations) return "Station";
        
        // Find closest
        let minDist = Infinity;
        let idx = 0;
        stations.forEach((s, i) => {
            const d = calculateDistance(metro.lat, metro.lon, s.lat, s.lng);
            if (d < minDist) { minDist = d; idx = i; }
        });
        
        // Next index
        // direction: 1 or -1. If undefined, assume 1.
        const dir = metro.direction || 1; 
        const nextIdx = idx + dir;
        
        if (nextIdx >= 0 && nextIdx < stations.length) return stations[nextIdx].name;
        // If at end, return current or bounce? 
        return stations[idx].name; 
    };
    // --- HYBRID ROUTE LOGIC ---
    const calculateHybridRoute = async (startName, endName) => {
        console.log("📍 Calculating Hybrid Route (Attempting Real + Fail-Safe)...", startName, "->", endName);

        // --- FAIL-SAFE SIMULATION DATA ---
        // If anything fails, we return THIS route so the UI is never blank.
        const fallbackRoute = {
            segments: [
                { type: 'walk', from: 'Your Location (Simulated)', to: 'Majestic Metro', time: 15, dist: '1.2', path: [{lat: 12.9756, lng: 77.5728}, {lat: 12.9756, lng: 77.5728}] }, // Placeholder path
                { type: 'metro', from: 'Majestic', to: 'Whitefield (Kadugodi)', time: 25, dist: 12, fare: 35, line: 'Purple' },
                { type: 'walk', from: 'Whitefield (Kadugodi)', to: 'ITPL', time: 10, dist: '0.8', path: [{lat: 12.9901, lng: 77.7610}, {lat: 12.9859, lng: 77.7516}] }
            ],
            totalTime: 50,
            totalFare: 35,
            startLoc: userLocation || { lat: 12.9756, lng: 77.5728 },
            endLoc: { lat: 12.9859, lng: 77.7516 }, // ITPL
            startStation: { lat: 12.9756, lng: 77.5728, name: "Majestic" },
            endStation: { lat: 12.9901, lng: 77.7610, name: "Whitefield (Kadugodi)" }
        };

        try {
            if (!backendData.metroLines || backendData.metroLines.length === 0) {
                console.warn("⚠️ Backend data missing. Using Simulation.");
                setHybridRoute(fallbackRoute);
                return;
            }
            
            let startLoc = userLocation || { lat: 12.9756, lng: 77.5728 };
            let endLoc = null;
            
            // Destination Logic
            const normalize = (s) => s.toLowerCase().replace(/\s+/g, '').replace(/[()]/g, '');
            const targetStation = ALL_METRO_STATIONS.find(s => normalize(s.name).includes(normalize(endName)) || normalize(endName).includes(normalize(s.name)));
            
            if (targetStation) endLoc = { lat: targetStation.lat, lng: targetStation.lng };
            else if (busStops.length > 0) {
                 const targetStop = busStops.find(s => normalize(s.name).includes(normalize(endName)));
                 if(targetStop) endLoc = { lat: targetStop.lat, lng: targetStop.lon };
            }
            
            if (!endLoc) { 
                console.warn("⚠️ Destination not found. Using Simulation."); 
                setHybridRoute(fallbackRoute); 
                return; 
            }
            
            // Find Nearest Stations
            const findNearestStation = (loc) => {
                let nearest = null; let minD = Infinity;
                ALL_METRO_STATIONS.forEach(s => {
                    const d = calculateDistance(loc.lat, loc.lng, s.lat, s.lng);
                    if (d < minD) { minD = d; nearest = s; }
                });
                return { station: nearest, dist: minD };
            };
    
            const startNode = findNearestStation(startLoc);
            const endNode = findNearestStation(endLoc);
            
            // --- ROUTING HELPERS ---
            const getDirectPath = (p1, p2) => [p1, p2];
            const getDirectionsPath = (origin, dest) => new Promise(resolve => {
                if (!directionsService) { resolve(null); return; }
                directionsService.route({
                    origin: origin, destination: dest, travelMode: 'WALKING'
                }, (res, status) => {
                    if (status === 'OK' && res.routes && res.routes[0]) resolve(res.routes[0]);
                    else resolve(null);
                });
            });
    
            // 3. FETCH PATHS (Try Real -> Fallback to Direct)
            let walk1 = null, walk2 = null;
            if (directionsService) {
                try {
                    [walk1, walk2] = await Promise.all([
                        getDirectionsPath(startLoc, { lat: startNode.station.lat, lng: startNode.station.lon }),
                        getDirectionsPath({ lat: endNode.station.lat, lng: endNode.station.lon }, endLoc)
                    ]);
                } catch (e) { console.error("Route Fetch Error (Non-Fatal):", e); }
            }
    
            // 4. CONSTRUCT DATA
            const walk1Time = walk1 ? Math.ceil(walk1.legs[0].duration.value / 60) : Math.ceil((startNode.dist * 1000) / 80);
            const walk1Dist = walk1 ? (walk1.legs[0].distance.value / 1000).toFixed(1) : startNode.dist.toFixed(1);
            const walk1Path = walk1 ? walk1.overview_path : getDirectPath({lat: startLoc.lat, lng: startLoc.lng}, {lat: startNode.station.lat, lng: startNode.station.lon});
            
            const walk2Time = walk2 ? Math.ceil(walk2.legs[0].duration.value / 60) : Math.ceil((endNode.dist * 1000) / 80);
            const walk2Dist = walk2 ? (walk2.legs[0].distance.value / 1000).toFixed(1) : endNode.dist.toFixed(1);
            const walk2Path = walk2 ? walk2.overview_path : getDirectPath({lat: endNode.station.lat, lng: endNode.station.lon}, {lat: endLoc.lat, lng: endLoc.lng});
            
            const route = {
                segments: [
                    { type: 'walk', from: 'Your Location', to: startNode.station.name, time: walk1Time, dist: walk1Dist, path: walk1Path },
                    { type: 'metro', from: startNode.station.name, to: endNode.station.name, time: 25, dist: 12, fare: 35, line: 'Purple' }, 
                    { type: 'walk', from: endNode.station.name, to: endName, time: walk2Time, dist: walk2Dist, path: walk2Path }
                ],
                totalTime: walk1Time + 25 + walk2Time,
                totalFare: 35,
                startLoc, endLoc, startStation: startNode.station, endStation: endNode.station
            };
            
            console.log("✅ Hybrid Route Calculated Successfully:", route);
            setHybridRoute(route);

        } catch (err) {
            console.error("❌ CRITICAL ERROR in Hybrid Route. Fallback to Simulation.", err);
            setHybridRoute(fallbackRoute);
        }
    };
    

    

    const drawMetroElements = () => {
        if (!map || !google) return;
        
        // 1. Draw Static Metro Lines (Polylines)
        // 1. Draw Static Metro Lines (Polylines) & Stations
        if (polylineInstances.current.length === 0) {
             const linesToDraw = backendData.metroLines && backendData.metroLines.length > 0 
                ? backendData.metroLines 
                : ['Purple', 'Green', 'Yellow'].map(k => ({id: k, polyline: METRO_STATIONS[k].map(s => [s.lng, s.lat]), color: k==='Purple'?'#9333ea':(k==='Green'?'#16a34a':'#eab308'), stations: METRO_STATIONS[k]}));

             linesToDraw.forEach(line => {
                // FORCE: Use Station Coordinates for Polyline 
                let path = [];
                if (line.stations && line.stations.length > 0) {
                     path = line.stations.map(s => ({ lat: s.lat, lng: s.lon }));
                } else if (line.polyline) {
                     path = line.polyline.map(p => ({ lat: p[1], lng: p[0] }));
                }

                if (path.length > 0) {
                    const polyline = new google.maps.Polyline({
                        path: path, geodesic: true, strokeColor: line.color, strokeOpacity: 1.0, strokeWeight: 6, map: map
                    });
                    polylineInstances.current.push(polyline);
                }
                
                // Draw Stations for this line from backend data to ensure alignment
                if (line.stations) {
                    line.stations.forEach(s => {
                         let marker = markerInstances.current[`st-${s.name}`];
                         if (!marker) {
                             marker = new google.maps.Marker({
                                position: { lat: s.lat, lng: s.lon }, map: map,
                                icon: { path: google.maps.SymbolPath.CIRCLE, scale: 3, fillColor: "#fff", fillOpacity: 1, strokeColor: "#000", strokeWeight: 1 },
                                title: s.name, zIndex: 5
                            });
                            markerInstances.current[`st-${s.name}`] = marker;
                         } else { marker.setMap(map); }
                    });
                }
             });
        }
        
        // Removed global ALL_METRO_STATIONS loop to avoid duplicates/misalignment
        /*
        ALL_METRO_STATIONS.forEach((s, i) => { ... });
        */
    };

    const drawEntities = () => {
        if (!map || !google) return;
        const g = window.google;
        const liveData = liveDataRef.current;
        
        if (view === 'metro-view' || view === 'hybrid-view') {
            // Hide Bus Elements
            if (directionsRenderer) directionsRenderer.setMap(null); 
            
            // STRICT CLEANUP: Hide anything that is NOT a metro or metro station or hybrid element
            Object.keys(markerInstances.current).forEach(k => {
                const isMetro = k.startsWith('metro-');
                const isStation = k.startsWith('st-');
                const isHybrid = k.startsWith('hybrid-');
                if (!isMetro && !isStation && !isHybrid && markerInstances.current[k]) {
                    markerInstances.current[k].setMap(null);
                }
            });
            
            if (view === 'metro-view') drawMetroElements();
            if (view === 'hybrid-view') {
                 drawMetroElements(); 
                 // Only draw if not already drawn to avoid flickering? 
                 // Actually drawHybridElements handles clearing, so calling it every frame is expensive but ensures visibility.
                 // Better: Check if lines exist.
                 if (hybridPolyRefs.current.length === 0) drawHybridElements();
            }
            
        } else {
             // BUS VIEW: Hide Metro & Hybrid Elements
             if (polylineInstances.current.length > 0) {
                 polylineInstances.current.forEach(p => p.setMap(null));
                 polylineInstances.current = [];
             }
             // Clear Hybrid Polylines
             if (hybridPolyRefs.current.length > 0) {
                 hybridPolyRefs.current.forEach(p => p.setMap(null));
                 hybridPolyRefs.current = [];
             }
             
             Object.keys(markerInstances.current).forEach(k => {
                if (k.startsWith('st-') && markerInstances.current[k]) markerInstances.current[k].setMap(null); 
                if (k.startsWith('metro-') && markerInstances.current[k]) markerInstances.current[k].setMap(null); 
                if (k.startsWith('hybrid-') && markerInstances.current[k]) markerInstances.current[k].setMap(null);
             });
             if (directionsRenderer && routeData) directionsRenderer.setMap(map); 
        }

        // --- 2. SIGNALS (Bus View Only) ---
        if (view === 'bus-view') {
            if (liveData.signals) {
                liveData.signals.forEach(sig => {
                    const staticSig = backendData.signals.find(s => s.id === sig.id);
                    if (!staticSig) return;
                    const color = sig.phase === 'green' ? '#22c55e' : (sig.phase === 'yellow' ? '#eab308' : '#ef4444');
                    let marker = markerInstances.current[`sig-${sig.id}`];
                    if (!marker) {
                        marker = new g.maps.Marker({
                            position: { lat: staticSig.lat, lng: staticSig.lon }, map: map,
                            icon: { path: g.maps.SymbolPath.CIRCLE, scale: 3, fillColor: color, fillOpacity: 0.8, strokeColor: color, strokeWeight: 1 },
                            zIndex: 10
                        });
                        markerInstances.current[`sig-${sig.id}`] = marker;
                    } else {
                        marker.setMap(map);
                        const icon = marker.getIcon();
                        if (icon.fillColor !== color) { icon.fillColor = color; icon.strokeColor = color; marker.setIcon(icon); }
                    }
                });
            }
        }
        
        // --- 3. BUS STOPS (Journey View Only) ---
        const showGlobalBuses = (view !== 'bus-view' || journeyBusesRef.current.length === 0);
        if (!showGlobalBuses && busStops.length > 0) {
            busStops.forEach(st => {
                 let marker = markerInstances.current[`stop-${st.id || st.name}`];
                 if(!marker) {
                     marker = new g.maps.Marker({
                         position: { lat: st.lat, lng: st.lon }, map: map,
                         icon: { path: g.maps.SymbolPath.CIRCLE, scale: 3, fillColor: '#ffffff', fillOpacity: 1, strokeColor: '#3b82f6', strokeWeight: 2 },
                         title: st.name, zIndex: 50
                     });
                     // CLICK LISTENER REMOVED (User request: No white box)
                     // marker.addListener('click', () => { new g.maps.InfoWindow({ content: `<div style="color:black; font-weight:bold">${st.name}</div>` }).open(map, marker); });
                     markerInstances.current[`stop-${st.id || st.name}`] = marker;
                 } else { marker.setMap(map); }
            });
        } else {
            Object.keys(markerInstances.current).forEach(key => {
                if(key.startsWith('stop-') && markerInstances.current[key]) markerInstances.current[key].setMap(null);
            });
        }

        // --- 4. LIVE BUSES (Bus View Only) ---
        if (view === 'bus-view') {
            const journeyActive = journeyBusesRef.current.length > 0;
            if (journeyActive) {
                // Hide global buses first
                liveData.buses.forEach(b => { if(markerInstances.current[b.id]) markerInstances.current[b.id].setMap(null); });
                journeyBusesRef.current.forEach(bus => {
                     // ... Journey Bus Logic ...
                     const path = bus.fullPath;
                     const idx = Math.floor(bus.pathIndex);
                     const nextIdx = Math.min(idx + 1, path.length - 1);
                     const p1 = path[idx]; const p2 = path[nextIdx];
                     const ratio = bus.pathIndex - idx;
                     const lat = p1.lat() + (p2.lat() - p1.lat()) * ratio;
                     const lng = p1.lng() + (p2.lng() - p1.lng()) * ratio;
                     const pos = new g.maps.LatLng(lat, lng);
                     let marker = markerInstances.current[bus.id];
                     if (!marker) {
                         marker = new g.maps.Marker({
                             position: pos, map: map,
                             icon: { path: g.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 4, fillColor: "#1d4ed8", fillOpacity: 1, strokeColor: "white", strokeWeight: 1, rotation: 0 },
                             title: bus.routeNo, zIndex: 100
                         });
                         marker.addListener('click', () => {
                             const distRem = (path.length - bus.pathIndex) * 10;
                             const etaMins = distRem / 500; 
                             setSelectedBus({ id: bus.routeNo, subId: bus.id, nextStopName: bus.nextStopName || "Next Stop", etaText: getFormattedEta(etaMins), type: 'bus', distRem });
                         });
                         markerInstances.current[bus.id] = marker;
                     } else {
                         marker.setMap(map); marker.setPosition(pos);
                         const heading = g.maps.geometry.spherical.computeHeading(p1, p2);
                         const icon = marker.getIcon();
                         icon.rotation = heading;
                         marker.setIcon(icon);
                     }
                });
            } else {
                liveData.buses.forEach(bus => {
                    const pos = new g.maps.LatLng(bus.lat, bus.lon);
                    let marker = markerInstances.current[bus.id];
                    if (!marker) {
                        marker = new g.maps.Marker({
                            position: pos, map: map,
                            icon: { path: g.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3, fillColor: "#1d4ed8", fillOpacity: 0.8, strokeColor: "white", strokeWeight: 1, rotation: 0 },
                            title: bus.id, zIndex: 50
                        });
                        markerInstances.current[bus.id] = marker;
                    } else { marker.setMap(map); marker.setPosition(pos); }
                });
            }
        }

        // --- 5. LIVE METROS (Metro/Hybrid View Only) ---
        if (view === 'metro-view') {
             liveData.metros.forEach(metro => {
                 const pos = new g.maps.LatLng(metro.lat, metro.lon);
                 let marker = markerInstances.current[metro.id];
                 if (!marker) {
                     marker = new g.maps.Marker({
                         position: pos, map: map,
                         icon: { path: g.maps.SymbolPath.CIRCLE, scale: 5, fillColor: metro.color || '#9333ea', fillOpacity: 1, strokeColor: "white", strokeWeight: 2 },
                         zIndex: 101, title: metro.id
                     });
                     marker.addListener('click', () => {
                         const nextStation = getNextStationName(metro);
                         setSelectedBus({ id: metro.id, nextStopName: nextStation, etaText: "On Time", type: 'metro' });
                     });
                     markerInstances.current[metro.id] = marker;
                 } else { marker.setMap(map); marker.setPosition(pos); }
            });
        }
        
        if (view === 'hybrid-view') {
            drawHybridElements();
        }
    };

    // Draw Hybrid Elements when route updates
    useEffect(() => {
        if (view === 'hybrid-view' && hybridRoute) {
            drawHybridElements();
        }
    }, [hybridRoute, view]);

    // Auto-calculate hybrid route on Switch for Demo
    // Auto-calculate hybrid route on Switch for Demo
    useEffect(() => {
        if (view === 'hybrid-view') {
            // FORCE DEFAULT IMMEDIATELY so UI never blanks out
            if (!hybridRoute) {
                console.log("⚠️ Forcing Default Hybrid Route for UI Visibility");
                setHybridRoute(DEFAULT_HYBRID_ROUTE);
                // Then try to fetch real data
                calculateHybridRoute('Your Location', 'Whitefield (Kadugodi)');
            }
        }
    }, [view]);
    
    // ACTION
    const handleCalculateRoute = () => {
        if (!directionsService || !inputs.start || !inputs.end) return;
        const request = { origin: inputs.start, destination: inputs.end, travelMode: 'TRANSIT', transitOptions: { modes: ['BUS'] } };

        directionsService.route(request, async (result, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(result);
                const leg = result.routes[0].legs[0];
                const rData = {
                    duration: leg.duration.text,
                    durationValue: leg.duration.value, 
                    distance: leg.distance.text,
                    startAddress: leg.start_address,
                    endAddress: leg.end_address,
                    startLoc: { lat: leg.start_location.lat(), lng: leg.start_location.lng() },
                    endLoc: { lat: leg.end_location.lat(), lng: leg.end_location.lng() },
                };
                setRouteData(rData);
                
                const fullPath = [];
                leg.steps.forEach(s => { if (s.path) fullPath.push(...s.path); else if(s.lat_lngs) fullPath.push(...s.lat_lngs); });
                
                let realStops = findStopsAlongRoute(fullPath);
                if (realStops.length < 2) {
                    realStops = [
                         { name: inputs.start + " Bus Stand", idx: 0 },
                         { name: inputs.end + " Stop", idx: fullPath.length-1 }
                    ];
                }
                setBusStops(realStops);

                // --- NEW STRATEGY: Name-Based Lookup ---
                const namedRouteId = await findRouteByName(leg.start_location, leg.end_location);
                let routeNo = cleanRouteId(namedRouteId) || "335E"; 
                setDetectedRouteNo(cleanRouteId(namedRouteId) || "Simulated (No Match)");

                // --- FILTER STOPS BY ROUTE ---
                // If we found a valid backend route, filter the geometry-matched stops 
                // to only show the ones that actually belong to this route.
                if (namedRouteId && backendData.routeStops[namedRouteId]) {
                    const validStopIds = new Set(backendData.routeStops[namedRouteId]);
                    // Intersection of Geometry Matches AND Route Membership
                    const filteredStops = realStops.filter(s => validStopIds.has(s.id));
                    
                    // Only apply if we have a decent number of stops (avoid over-filtering if data is sparse)
                    if (filteredStops.length > 2) {
                        realStops = filteredStops;
                    }
                }
                setBusStops(realStops);

                const newBuses = [];
                for(let i=0; i<4; i++) {
                    newBuses.push({
                        id: `KA-0${Math.floor(Math.random()*9)}-F-${1000+Math.floor(Math.random()*900)}`, 
                        routeNo: routeNo,
                        fullPath: fullPath,
                        pathIndex: Math.floor((fullPath.length / 4) * i),
                        speed: 0.5, 
                        nextStopName: realStops[1] ? realStops[1].name : realStops[0].name
                    });
                }
                journeyBusesRef.current = newBuses;
                setJourneyBuses(newBuses);
                
                // Trigger Metro Recommendations if coordinates exist
                if (leg && leg.start_location && leg.end_location) {
                    recommendMetroStations(leg.start_location.lat(), leg.start_location.lng(), leg.end_location.lat(), leg.end_location.lng());
                }

                setView('bus-view');
            } else { alert("Could not find route."); }
        });
    };
    
    const getFormattedEta = (mins) => {
        const d = new Date(currentTime.getTime() + mins*60000);
        return `${d.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'})} (${Math.ceil(mins)} mins)`;
    };

    return (
     <div className={`relative w-full h-screen overflow-hidden font-sans transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />
            <div ref={mapRef} className="absolute inset-0 z-0" />

            {view === 'input' && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <GlassPanel isDarkMode={isDarkMode} className="p-6 w-96 space-y-4">
                        <h2 className="text-xl font-bold flex gap-2"><Navigation className="text-blue-500" /> Plan Journey</h2>
                        <div className="space-y-3">
                            <input value={inputs.start} onChange={(e) => setInputs({...inputs, start: e.target.value})} className={`w-full p-3 rounded-lg border ${isDarkMode?'bg-gray-800 border-gray-700 text-white':'bg-white border-gray-300 text-gray-900'}`} placeholder="Start Location" />
                            <input value={inputs.end} onChange={(e) => setInputs({...inputs, end: e.target.value})} className={`w-full p-3 rounded-lg border ${isDarkMode?'bg-gray-800 border-gray-700 text-white':'bg-white border-gray-300 text-gray-900'}`} placeholder="Destination" />
                        </div>
                        <button onClick={handleCalculateRoute} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex justify-center gap-2 shadow-lg transition-all"><Bus /> Find Transport</button>
                    </GlassPanel>
                </div>
            )}

            {(view !== 'input') && (
                <>
                    <div className="absolute top-4 left-4 z-50 pointer-events-auto">
                        <button 
                            className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} text-center w-32 h-10 rounded-xl relative text-sm font-semibold group shadow-lg transition-colors duration-300`} 
                            type="button"
                            onClick={() => {
                                setView('input');
                                setJourneyBuses([]); journeyBusesRef.current = [];
                                setHybridRoute(null); // Clear hybrid route to force recalc next time
                                // Clear stop markers
                                Object.keys(markerInstances.current).forEach(key => {
                                    if(key.startsWith('stop-') && markerInstances.current[key]) markerInstances.current[key].setMap(null);
                                });
                                if(directionsRenderer) directionsRenderer.setDirections({routes: []});
                            }}
                        >
                            <div className="bg-green-400 rounded-lg h-8 w-8 flex items-center justify-center absolute left-1 top-[4px] group-hover:w-[120px] z-10 duration-500 overflow-hidden">
                                <ArrowLeft size={20} color={isDarkMode ? "#fff" : "#000"} />
                            </div>
                            <p className="translate-x-3">Go Back</p>
                        </button>
                    </div>

                    <div className="absolute top-4 left-0 right-0 z-30 flex justify-center pointer-events-none">
                        <ModeSwitcher currentMode={view} onSwitch={(m) => { setView(m); setSelectedBus(null); if(m !== 'hybrid-view') setHybridRoute(null); }} isDarkMode={isDarkMode} />
                    </div>
                    
                    <AnimatePresence>
                        {(view === 'bus-view' || view === 'metro-view') && (
                        <motion.div drag dragMomentum={false} initial={{ x: 20, y: 100 }} className="absolute top-24 left-4 z-30 pointer-events-auto">
                            <GlassPanel isDarkMode={isDarkMode} className="p-0 overflow-hidden w-80 shadow-2xl border-2 border-opacity-50">
                                {view === 'bus-view' ? (
                                    <>
                                        <div className="w-full h-10 bg-blue-600 flex items-center justify-between px-4 cursor-move" onPointerDown={(e) => dragControls.start(e)}>
                                            <div className="flex items-center gap-2 text-white"><Bus className="w-4 h-4" /> <span className="font-bold text-sm">Bus Route Details</span></div>
                                            <GripHorizontal className="w-4 h-4 text-white/70" />
                                        </div>
                                        <div className="p-5 space-y-4">
                                            <div className="relative pl-4 border-l-2 border-dashed border-gray-400 space-y-4">
                                                <div>
                                                    <p className="text-xs uppercase tracking-wider opacity-60 font-bold mb-1">Origin</p>
                                                    <p className="font-bold text-lg leading-none">{busStops[0]?.name || inputs.start}</p>
                                                    <p className="text-xs text-blue-500 font-mono mt-1 font-bold flex items-center gap-1"><Clock className="w-3 h-3"/>ETA: {getFormattedEta(5)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase tracking-wider opacity-60 font-bold mb-1">Destination</p>
                                                    <p className="font-bold text-lg leading-none">{busStops[busStops.length-1]?.name || inputs.end}</p>
                                                    <p className="text-xs text-blue-500 font-mono mt-1 font-bold flex items-center gap-1"><Clock className="w-3 h-3"/>ETA: {getFormattedEta(45)}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="pt-4 border-t border-gray-500/20 flex justify-between items-center">
                                                 <div>
                                                     <span className="text-sm font-medium opacity-80 block">Route No</span>
                                                     <span className="font-bold text-lg">500-D</span>
                                                 </div>
                                                 <div className="text-right">
                                                     <span className="text-sm font-medium opacity-80 block">Fare</span>
                                                     <span className="text-2xl font-bold text-green-500 flex items-center justify-end"><IndianRupee className="w-5 h-5" /> 25</span>
                                                 </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-full h-10 bg-purple-600 flex items-center justify-between px-4 cursor-move" onPointerDown={(e) => dragControls.start(e)}>
                                            <div className="flex items-center gap-2 text-white"><Train className="w-4 h-4" /> <span className="font-bold text-sm">Metro Planner</span></div>
                                            <GripHorizontal className="w-4 h-4 text-white/70" />
                                        </div>
                                        <div className="p-5 space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <label className="text-xs uppercase tracking-wider opacity-60 font-bold">From Station</label>
                                                    <span className="text-[10px] text-blue-500 font-mono font-bold">ETA: {getFormattedEta(4)}</span>
                                                </div>
                                                <div className="relative">
                                                    <select className={`w-full p-2.5 rounded-lg border outline-none appearance-none font-medium ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-300'}`} 
                                                        value={selectedStartStation?.name || ''} 
                                                        onChange={(e) => {
                                                            const st = ALL_METRO_STATIONS.find(s => s.name === e.target.value);
                                                            setSelectedStartStation(st);
                                                            updateMetroStats(st, selectedEndStation);
                                                        }}
                                                    >
                                                        {ALL_METRO_STATIONS.map((s, i) => <option key={`${s.name}_${i}`} value={s.name}>{s.name}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 opacity-50 pointer-events-none" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <label className="text-xs uppercase tracking-wider opacity-60 font-bold">To Station</label>
                                                    <span className="text-[10px] text-blue-500 font-mono font-bold">ETA: {getFormattedEta(4 + metroStats.time)}</span>
                                                </div>
                                                <div className="relative">
                                                    <select className={`w-full p-2.5 rounded-lg border outline-none appearance-none font-medium ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                                                        value={selectedEndStation?.name || ''}
                                                        onChange={(e) => {
                                                            const st = ALL_METRO_STATIONS.find(s => s.name === e.target.value);
                                                            setSelectedEndStation(st);
                                                            updateMetroStats(selectedStartStation, st);
                                                        }}
                                                    >
                                                        {ALL_METRO_STATIONS.map((s, i) => <option key={`${s.name}_${i}`} value={s.name}>{s.name}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 opacity-50 pointer-events-none" />
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-gray-500/20 flex justify-between items-center">
                                                <div>
                                                    <span className="text-sm font-medium opacity-80 block">Total Fare</span>
                                                    <span className="text-xs opacity-50">{metroStats.dist} km • ~{metroStats.time} mins</span>
                                                </div>
                                                <span className="text-2xl font-bold text-green-500 flex items-center"><IndianRupee className="w-5 h-5" /> {metroStats.fare}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </GlassPanel>
                        </motion.div>
                        )}
                        
                        {selectedBus && (
                            <motion.div initial={{ scale: 0.8, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: 20 }} className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                                <GlassPanel isDarkMode={isDarkMode} className="p-4 flex items-center gap-4 min-w-[280px] border-l-4 border-l-blue-500 shadow-2xl">
                                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                                        {selectedBus.type === 'bus' ? <Bus className="w-6 h-6 text-blue-600 dark:text-blue-400" /> : <Train className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                           <p className="text-xs uppercase font-bold opacity-50 mb-0.5">{selectedBus.subId || selectedBus.id}</p>
                                           <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 rounded">{selectedBus.id}</span>
                                        </div>
                                        <p className="font-bold text-lg leading-tight mb-1">{selectedBus.nextStopName}</p>
                                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">ETA: {selectedBus.etaText}</p>
                                    </div>
                                    <button onClick={() => setSelectedBus(null)} className="ml-auto p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"><X className="w-5 h-5 opacity-50" /></button>
                                </GlassPanel>
                            </motion.div>
                        )}
                        
                        {/* HYBRID ASSISTANT PANEL */}
                        {view === 'hybrid-view' && hybridRoute && (
                            <motion.div drag dragMomentum={false} initial={{ x: 20, y: 100 }} className="absolute top-24 left-4 z-30 pointer-events-auto">
                                <GlassPanel isDarkMode={isDarkMode} className="p-0 overflow-hidden w-80 shadow-2xl border-2 border-opacity-50">
                                    <div className="w-full h-10 bg-emerald-600 flex items-center justify-between px-4 cursor-move" onPointerDown={(e) => dragControls.start(e)}>
                                        <div className="flex items-center gap-2 text-white"><MapPin className="w-4 h-4" /> <span className="font-bold text-sm">Smart Assistant</span></div>
                                        <GripHorizontal className="w-4 h-4 text-white/70" />
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex justify-between items-end border-b pb-2 border-gray-500/20">
                                            <div>
                                                <p className="text-xs uppercase opacity-60 font-bold">Total Time</p>
                                                <p className="text-xl font-bold">{hybridRoute.totalTime} min</p>
                                            </div>
                                            <div className="text-right">
                                                 <p className="text-xs uppercase opacity-60 font-bold">Cost</p>
                                                 <p className="text-xl font-bold text-green-500">₹{hybridRoute.totalFare}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                            {hybridRoute.segments.map((seg, i) => (
                                                <div key={i} className="flex gap-3 items-start relative">
                                                    {/* Connector Line */}
                                                    {i < hybridRoute.segments.length - 1 && <div className="absolute left-[11px] top-7 bottom-[-12px] w-0.5 bg-gray-300 dark:bg-gray-700"></div>}
                                                    
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${seg.type==='walk'?'bg-gray-200 text-gray-600':'bg-purple-100 text-purple-600'}`}>
                                                        {seg.type==='walk' ? <div className="w-2 h-2 bg-gray-500 rounded-full"/> : <Train className="w-3.5 h-3.5"/>}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-sm">{seg.type==='walk' ? `Walk` : `Metro (${seg.line})`}</p>
                                                        <p className="text-xs opacity-70">{seg.from} <span className="opacity-50">➔</span> {seg.to}</p>
                                                        <p className="text-[10px] opacity-50 font-mono mt-0.5">{seg.time} min • {seg.dist} km</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </GlassPanel>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </>
            )}
    </div>
    );
};

export default TransportApp;
