import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import ThemeSwitch from './ThemeSwitch';
import BackButton from './BackButton';
import CockpitSwitch from './CockpitSwitch';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAhBhKMWuPQJefMr997-m_-zSVvtg_p8Js",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "etaforge-live.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "etaforge-live",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "etaforge-live.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "14242983734",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:14242983734:web:cda6c57463217ba2700d97"
};

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBta64CrHTAb8w0cTJV9eLl1PjecrQ5O2Q";

// Check if Firebase app already exists, if not initialize it
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// --- MAP STYLES ---
const MAP_STYLES = {
  dark: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ],
  light: [] // Default Google Maps style
};

// --- ICONS ---
const Icons = {
  Plane: () => <img src="/svg and animations/flight.svg" alt="Flight" style={{ width: '16px', height: '16px', display: 'inline-block' }} />,
  Building: () => <img src="/svg and animations/airport.svg" alt="Airport" style={{ width: '16px', height: '16px', display: 'inline-block' }} />,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Navigation: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>,
  Eye: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  Calendar: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>,
  ChevronLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>,
  Minus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>,
  Sun: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>,
  Moon: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
  ArrowLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
};

let CustomPopupOverlay;
let PlaneOverlay;
let googleMapsLoaded = false; // Global flag to prevent multiple loads

const GoogleMap = ({ activeData, mode, isCockpit, onMapLoad, theme, sidebarOpen }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const planeOverlayRef = useRef(null);
  const originMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const traveledPolylineRef = useRef(null);
  const remainingPolylineRef = useRef(null);
  const popupRef = useRef(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (mapInstanceRef.current && window.google) {
        window.google.maps.event.trigger(mapInstanceRef.current, 'resize');
    }
  }, [sidebarOpen]);

  useEffect(() => {
    if (scriptLoaded.current) return;
    
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      scriptLoaded.current = true;
      googleMapsLoaded = true;
      defineOverlayClasses();
      initMap();
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript && !googleMapsLoaded) {
      // Script is loading, wait for it
      existingScript.addEventListener('load', () => {
        scriptLoaded.current = true;
        googleMapsLoaded = true;
        defineOverlayClasses();
        initMap();
      });
      return;
    }

    // Only add script if it doesn't exist
    if (!googleMapsLoaded && !existingScript) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}`;
      script.async = true;
      script.onload = () => {
        scriptLoaded.current = true;
        googleMapsLoaded = true;
        defineOverlayClasses();
        initMap();
      };
      document.body.appendChild(script);
    }
  }, []);

  const defineOverlayClasses = () => {
    if (!CustomPopupOverlay) {
        CustomPopupOverlay = class extends window.google.maps.OverlayView {
            constructor(position, content) { super(); this.position = position; this.content = content; this.div = null; }
            onAdd() {
                this.div = document.createElement('div');
                this.div.style.position = 'absolute'; this.div.style.cursor = 'pointer'; this.div.innerHTML = this.content;
                this.getPanes().floatPane.appendChild(this.div);
                this.div.addEventListener('click', (e) => { e.stopPropagation(); this.setMap(null); });
            }
            draw() {
                const point = this.getProjection().fromLatLngToDivPixel(this.position);
                if (this.div) { this.div.style.left = point.x + 'px'; this.div.style.top = point.y + 'px'; this.div.style.transform = 'translate(-50%, -120%)'; }
            }
            onRemove() { if (this.div) { this.div.parentNode.removeChild(this.div); this.div = null; } }
        };
    }

    if (!PlaneOverlay) {
        PlaneOverlay = class extends window.google.maps.OverlayView {
            constructor(position, heading, onClick) {
                super();
                this.position = position;
                this.heading = heading;
                this.onClick = onClick;
                this.div = null;
            }
            onAdd() {
                this.div = document.createElement('div');
                this.div.style.position = 'absolute';
                this.div.style.cursor = 'pointer';
                this.div.innerHTML = `
                    <div class="relative flex items-center justify-center" style="transform: rotate(${this.heading}deg); width: 40px; height: 40px;">
                        <div class="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                        <div class="absolute inset-2 bg-blue-500 rounded-full opacity-40 animate-pulse"></div>
                        <img src="/svg and animations/flight.svg" class="relative z-10 w-full h-full drop-shadow-lg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));" />
                    </div>
                `;
                this.getPanes().overlayMouseTarget.appendChild(this.div);
                this.div.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if(this.onClick) this.onClick();
                });
            }
            draw() {
                const point = this.getProjection().fromLatLngToDivPixel(this.position);
                if (this.div) {
                    this.div.style.left = (point.x - 20) + 'px';
                    this.div.style.top = (point.y - 20) + 'px';
                }
            }
            onRemove() { if (this.div) { this.div.parentNode.removeChild(this.div); this.div = null; } }
            
            updatePosition(newPos, newHeading) {
                this.position = newPos;
                this.heading = newHeading;
                if(this.div) {
                    const container = this.div.firstElementChild;
                    if(container) container.style.transform = `rotate(${this.heading}deg)`;
                }
                this.draw();
            }
        };
    }
  };

  const initMap = () => {
    if (!mapRef.current) return;
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: 20, lng: 0 },
      zoom: 3,
      mapTypeId: 'roadmap', // Switch to roadmap to allow styling
      disableDefaultUI: true,
      zoomControl: false,
      gestureHandling: 'greedy',
      keyboardShortcuts: false,
      tilt: 0,
      backgroundColor: '#0f172a',
      styles: MAP_STYLES['dark'] // Initial dark style
    });
    if (onMapLoad) onMapLoad(mapInstanceRef.current);
  };

  // Update Map Theme & Data
  useEffect(() => {
    if (!mapInstanceRef.current || !scriptLoaded.current) return;
    const map = mapInstanceRef.current;

    // Apply Theme
    map.setOptions({ styles: MAP_STYLES[theme] });

    if(!activeData) return;

    // 1. Coordinates
    let lat, lng, heading = 0;
    if (mode === 'flight') {
      lat = Number(activeData.latitude); lng = Number(activeData.longitude); heading = Number(activeData.heading) || 0;
    } else {
      lat = Number(activeData.position?.latitude); lng = Number(activeData.position?.longitude);
    }

    if (isNaN(lat) || isNaN(lng)) return;
    const pos = { lat, lng };
    const googlePos = new window.google.maps.LatLng(lat, lng);

    // 2. View Logic
    if (isCockpit && mode === 'flight') {
      // Switch to Hybrid for Cockpit View regardless of theme for realism
      map.setMapTypeId('hybrid');
      map.setOptions({ center: pos, zoom: 16, tilt: 67.5, heading: heading });
    } else {
      // Switch back to Roadmap for standard view to respect theme
      map.setMapTypeId('roadmap');
      map.setOptions({ tilt: 0, heading: 0 });
      if (mode === 'flight' && activeData.origin?.coords && activeData.destination?.coords) {
         const bounds = new window.google.maps.LatLngBounds();
         bounds.extend(pos);
         const [olat, olng] = activeData.origin.coords;
         const [dlat, dlng] = activeData.destination.coords;
         if (!isNaN(olat)) bounds.extend({lat: Number(olat), lng: Number(olng)});
         if (!isNaN(dlat)) bounds.extend({lat: Number(dlat), lng: Number(dlng)});
         map.fitBounds(bounds, 80);
      } else if (mode === 'airport') {
         map.setCenter(pos);
         map.setZoom(14); 
      } else if (!isCockpit) {
         map.setCenter(pos);
         if(map.getZoom() < 8) map.setZoom(mode === 'flight' ? 8 : 13);
      }
    }

    // --- MARKER LOGIC ---
    if (mode === 'flight') {
        if (!planeOverlayRef.current) {
            const handlePlaneClick = () => {
                if (CustomPopupOverlay) {
                    if (popupRef.current) popupRef.current.setMap(null);
                    
                    const bg = theme === 'dark' ? 'rgba(15, 23, 42, 0.90)' : 'rgba(255, 255, 255, 0.95)';
                    const border = theme === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(203, 213, 225, 0.6)';
                    const textMain = theme === 'dark' ? 'white' : '#0f172a';
                    const textSub = theme === 'dark' ? '#cbd5e1' : '#475569';
                    const textLabel = theme === 'dark' ? '#94a3b8' : '#64748b';
                    
                    const content = `
                        <div style="background: ${bg}; backdrop-filter: blur(12px); border: 1px solid ${border}; border-radius: 12px; padding: 12px 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5); color: ${textMain}; font-family: 'Inter', sans-serif; min-width: 180px; pointer-events: auto;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid ${theme==='dark'?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'}; padding-bottom: 6px;">
                                <span style="font-weight: 800; font-size: 16px; color: #4ade80;">${activeData.number}</span>
                                <span style="font-size: 10px; font-weight: 700; background: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 2px 6px; border-radius: 4px;">LIVE</span>
                            </div>
                            <div style="font-size: 12px; color: ${textSub}; display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; align-items: center;">
                                <span style="color: ${textLabel}; font-weight: 600;">MODEL</span> <span style="text-align: right; font-family: monospace; color: ${theme==='dark'?'#f8fafc':'#334155'};">${activeData.aircraft || 'N/A'}</span>
                                <span style="color: ${textLabel}; font-weight: 600;">ALT</span> <span style="text-align: right; font-family: monospace; color: ${theme==='dark'?'#f8fafc':'#334155'};">${activeData.altitude} ft</span>
                                <span style="color: ${textLabel}; font-weight: 600;">SPD</span> <span style="text-align: right; font-family: monospace; color: ${theme==='dark'?'#f8fafc':'#334155'};">${activeData.speed} kts</span>
                                <span style="color: ${textLabel}; font-weight: 600;">HDG</span> <span style="text-align: right; font-family: monospace; color: ${theme==='dark'?'#f8fafc':'#334155'};">${activeData.heading}°</span>
                            </div>
                        </div>
                        <div style="width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid ${bg}; margin: 0 auto;"></div>
                    `;
                    const popup = new CustomPopupOverlay(googlePos, content);
                    popup.setMap(map);
                    popupRef.current = popup;
                }
            };
            
            if (PlaneOverlay) {
                planeOverlayRef.current = new PlaneOverlay(googlePos, heading, handlePlaneClick);
                planeOverlayRef.current.setMap(map);
            }
        } else {
            planeOverlayRef.current.updatePosition(googlePos, heading);
        }
    } else {
        if (planeOverlayRef.current) {
            planeOverlayRef.current.setMap(null);
            planeOverlayRef.current = null;
        }
    }

    if (markerRef.current) markerRef.current.setMap(null);
    if (originMarkerRef.current) originMarkerRef.current.setMap(null);
    if (destMarkerRef.current) destMarkerRef.current.setMap(null);

    const airportIconSVG = {
        url: '/svg and animations/airport.svg',
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 32)
    };

    if (mode === 'airport') {
        markerRef.current = new window.google.maps.Marker({
            position: pos, map: map, icon: airportIconSVG, title: activeData.name
        });
        
        // Add neon hover tooltip
        const airportInfoWindow = new window.google.maps.InfoWindow({
            content: `
                <div style="
                    background: ${theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
                    border: 2px solid #3b82f6;
                    border-radius: 8px;
                    padding: 8px 12px;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 8px 24px rgba(0,0,0,0.4);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                ">
                    <div style="font-weight: 700; font-size: 14px; color: ${theme === 'dark' ? '#fff' : '#1f2937'}; letter-spacing: 0.3px;">
                        ${activeData.name}
                    </div>
                </div>
            `,
            disableAutoPan: true
        });
        
        markerRef.current.addListener('mouseover', () => {
            airportInfoWindow.open(map, markerRef.current);
        });
        
        markerRef.current.addListener('mouseout', () => {
            airportInfoWindow.close();
        });
    }

    if (mode === 'flight') {
        const [olat, olng] = activeData.origin?.coords || [];
        const [dlat, dlng] = activeData.destination?.coords || [];
        
        const originIcon = {
            url: '/svg and animations/airport.svg',
            scaledSize: new window.google.maps.Size(28, 28),
            anchor: new window.google.maps.Point(14, 28)
        };
        
        const destIcon = {
            url: '/svg and animations/airport.svg',
            scaledSize: new window.google.maps.Size(28, 28),
            anchor: new window.google.maps.Point(14, 28)
        };

        if (!isNaN(olat)) {
            originMarkerRef.current = new window.google.maps.Marker({ 
                position: { lat: Number(olat), lng: Number(olng) }, 
                map: map, 
                icon: originIcon, 
                title: activeData.origin?.city 
            });
            
            // Add neon hover tooltip for origin
            const originInfoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="
                        background: ${theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
                        border: 2px solid #10b981;
                        border-radius: 8px;
                        padding: 8px 12px;
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                        box-shadow: 0 0 20px rgba(16, 185, 129, 0.6), 0 8px 24px rgba(0,0,0,0.4);
                        backdrop-filter: blur(12px);
                        -webkit-backdrop-filter: blur(12px);
                    ">
                        <div style="font-weight: 700; font-size: 14px; color: ${theme === 'dark' ? '#fff' : '#1f2937'}; letter-spacing: 0.3px;">
                            ${activeData.origin?.city} (${activeData.origin?.code})
                        </div>
                        <div style="font-size: 11px; color: #10b981; font-weight: 600; margin-top: 2px;">ORIGIN</div>
                    </div>
                `,
                disableAutoPan: true
            });
            
            originMarkerRef.current.addListener('mouseover', () => {
                originInfoWindow.open(map, originMarkerRef.current);
            });
            
            originMarkerRef.current.addListener('mouseout', () => {
                originInfoWindow.close();
            });
        }
        
        if (!isNaN(dlat)) {
            destMarkerRef.current = new window.google.maps.Marker({ 
                position: { lat: Number(dlat), lng: Number(dlng) }, 
                map: map, 
                icon: destIcon, 
                title: activeData.destination?.city 
            });
            
            // Add neon hover tooltip for destination
            const destInfoWindow = new window.google.maps.InfoWindow({
                content: `
                    <div style="
                        background: ${theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
                        border: 2px solid #ef4444;
                        border-radius: 8px;
                        padding: 8px 12px;
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                        box-shadow: 0 0 20px rgba(239, 68, 68, 0.6), 0 8px 24px rgba(0,0,0,0.4);
                        backdrop-filter: blur(12px);
                        -webkit-backdrop-filter: blur(12px);
                    ">
                        <div style="font-weight: 700; font-size: 14px; color: ${theme === 'dark' ? '#fff' : '#1f2937'}; letter-spacing: 0.3px;">
                            ${activeData.destination?.city} (${activeData.destination?.code})
                        </div>
                        <div style="font-size: 11px; color: #ef4444; font-weight: 600; margin-top: 2px;">DESTINATION</div>
                    </div>
                `,
                disableAutoPan: true
            });
            
            destMarkerRef.current.addListener('mouseover', () => {
                destInfoWindow.open(map, destMarkerRef.current);
            });
            
            destMarkerRef.current.addListener('mouseout', () => {
                destInfoWindow.close();
            });
        }
    }

    if (traveledPolylineRef.current) traveledPolylineRef.current.setMap(null);
    if (remainingPolylineRef.current) remainingPolylineRef.current.setMap(null);

    if (mode === 'flight' && activeData.origin?.coords && activeData.destination?.coords) {
        const [olat, olng] = activeData.origin.coords;
        const [dlat, dlng] = activeData.destination.coords;
        if (!isNaN(olat) && !isNaN(dlat)) {
            const originPos = { lat: Number(olat), lng: Number(olng) };
            const planePos = { lat: Number(lat), lng: Number(lng) };
            const destPos = { lat: Number(dlat), lng: Number(dlng) };

            traveledPolylineRef.current = new window.google.maps.Polyline({
                path: [originPos, planePos],
                geodesic: true,
                strokeColor: "#10b981", 
                strokeOpacity: 1.0,
                strokeWeight: 3,
                map: map
            });

            const lineSymbol = { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2 };
            remainingPolylineRef.current = new window.google.maps.Polyline({
                path: [planePos, destPos],
                geodesic: true,
                strokeColor: "#ef4444",
                strokeOpacity: 0, 
                strokeWeight: 2,
                icons: [{ icon: lineSymbol, offset: '0', repeat: '12px' }],
                map: map
            });
        }
    }
  }, [activeData, mode, isCockpit, theme]);

  return (
    <>
      <style>{`
        .gmnoprint, .gm-style-cc, .gm-control-active, .gm-fullscreen-control, a[href^="https://maps.google.com/maps"] { display: none !important; }
        img[src*="google_white"], .gm-style a img { display: none !important; }
      `}</style>
      <div ref={mapRef} className={`w-full h-full ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`} />
    </>
  );
};

export default function App({ onBack }) {
  const [mode, setMode] = useState('flight');
  const [airportTab, setAirportTab] = useState('departures');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [activeData, setActiveData] = useState(null);
  const [reqStatus, setReqStatus] = useState('Ready');
  const [user, setUser] = useState(null);
  const [isCockpit, setIsCockpit] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [theme, setTheme] = useState('dark'); 
  const mapInstanceRef = useRef(null);
  const heartbeatRef = useRef(null);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try { await signInWithCustomToken(auth, __initial_auth_token); } catch (e) { await signInAnonymously(auth); }
      } else { await signInAnonymously(auth); }
    };
    initAuth();
    onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!sessionStarted) return; 
    const docId = mode === 'flight' ? 'current_search' : 'current_airport';
    return onSnapshot(doc(db, 'etaforge_live_flights', docId), (s) => {
        if (s.exists()) {
            const data = s.data();
            const cleanSearch = searchQuery.trim().toUpperCase().replace(/[\s-]+/g, '');
            if (!cleanSearch) return;
            if (mode === 'flight') {
                const flightNum = (data.number || '').toUpperCase().replace(/[\s-]+/g, '');
                if (flightNum !== cleanSearch) return; // Do not show previous flight data!
            } else {
                const airportIata = (data.iata || '').toUpperCase();
                if (airportIata !== cleanSearch && !cleanSearch.includes(airportIata)) return;
            }
            setActiveData(data);
        }
    });
  }, [mode, sessionStarted, searchQuery]);

  useEffect(() => {
    return onSnapshot(doc(db, 'etaforge_requests', 'active_request'), (s) => {
      if (s.exists() && s.data().query === searchQuery.toUpperCase()) {
        const st = s.data().status;
        setReqStatus(st === 'completed' ? 'Live Data Active' : (st === 'processing' ? 'Processing...' : st));
      }
    });
  }, [searchQuery]);

  const triggerRequest = async (q, d) => {
      if(!q) return;
      try {
        await setDoc(doc(db, 'etaforge_requests', 'active_request'), {
            mode, 
            query: q, 
            date: d,
            status: 'pending', 
            timestamp: Date.now()
        });
      } catch(e) { console.error(e); }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim().toUpperCase();
    
    setSessionStarted(true); 
    setReqStatus('Sending Request...');
    setActiveData(null); 
    
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    
    await triggerRequest(q, searchDate);
    
    heartbeatRef.current = setInterval(() => {
        console.log("Heartbeat: Refreshing data...");
        triggerRequest(q, searchDate);
    }, 45000);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleGoBack = () => {
    // If onBack prop is provided (from main wrapper), use it to exit
    if (onBack) {
      onBack();
      return;
    }
    
    // Otherwise fallback to internal reset
    setSearchQuery('');
    setSearchDate('');
    setActiveData(null);
    setSessionStarted(false);
    setReqStatus('Ready');
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
  };

  const formatStatus = (s) => {
    s = (s || '').toLowerCase();
    let c = theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600';
    if(s.includes('landed')||s.includes('departed')||s.includes('arrived')) c = 'bg-green-500/20 text-green-600 border border-green-500/30';
    if(s.includes('delayed')||s.includes('cancelled')) c = 'bg-red-500/20 text-red-600 border border-red-500/30';
    if(s.includes('live')||s.includes('air')) c = 'bg-blue-500/20 text-blue-600 border border-blue-500/30';
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${c}`}>{s || 'Unknown'}</span>;
  };

  const handleZoomIn = () => { if (mapInstanceRef.current) mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1); };
  const handleZoomOut = () => { if (mapInstanceRef.current) mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1); };

  // --- THEME CLASSES ---
  const bgMain = theme === 'dark' ? 'bg-slate-900/95' : 'bg-white/95';
  const borderMain = theme === 'dark' ? 'border-slate-800' : 'border-slate-200';
  const textMain = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSub = theme === 'dark' ? 'text-slate-500' : 'text-slate-400';
  const inputBg = theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50';
  const cardBg = theme === 'dark' ? 'bg-slate-800' : 'bg-white border border-slate-200 shadow-sm';
  const cardBorder = theme === 'dark' ? 'border-slate-700' : 'border-slate-200';
  const itemHover = theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100';

  return (
    <div className={`flex h-screen w-full font-sans overflow-hidden ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} relative`}>
      
      {/* Mode Indicator Bar - Always Visible */}
      <div className={`absolute top-0 left-0 right-0 h-1 z-50 transition-colors duration-300 ${mode === 'flight' ? 'bg-green-500' : 'bg-blue-500'}`} />
      
      {/* Back Button - Always Visible */}
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={handleGoBack}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors shadow-xl ${theme === 'dark' ? 'bg-slate-900/90 text-white hover:bg-slate-800 border border-slate-700' : 'bg-white/90 text-slate-800 hover:bg-slate-100 border border-slate-300'} backdrop-blur-md`}
        >
          <Icons.ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </div>
      
      {/* Sidebar - Only render when open */}
      {sidebarOpen && (
      <div className={`flex flex-col ${bgMain} border-r ${borderMain} shadow-2xl z-20 backdrop-blur-md w-[450px] absolute left-0 top-0 bottom-0`}>
        <div className="w-full h-full flex flex-col">
            <div className={`p-4 border-b ${borderMain}`}>
              {/* Spacer for back button */}
              <div className="h-10"></div>
            </div>
            <div className={`flex items-center border-b ${borderMain}`}>
                <button onClick={() => { setMode('flight'); setActiveData(null); }} className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${mode === 'flight' ? (theme === 'dark' ? 'text-white border-b-2 border-green-500' : 'text-blue-600 border-b-2 border-blue-600') : textSub}`}>
                    <Icons.Plane /> Track Flight
                </button>
                <button onClick={() => { setMode('airport'); setActiveData(null); }} className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${mode === 'airport' ? (theme === 'dark' ? 'text-white border-b-2 border-green-500' : 'text-blue-600 border-b-2 border-blue-600') : textSub}`}>
                    <Icons.Building /> Airport Board
                </button>
                {/* Minimize Button */}
                <button 
                  onClick={() => setSidebarOpen(false)} 
                  className={`px-3 py-4 ${textSub} hover:text-white transition-colors`}
                  title="Minimize sidebar"
                >
                  <Icons.ChevronLeft />
                </button>
            </div>

            <div className={`p-6 border-b ${borderMain}`}>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder={mode === 'flight' ? "FLIGHT NO." : "AIRPORT"} className={`w-full ${inputBg} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'} rounded-xl py-4 pl-5 pr-4 text-lg font-bold ${textMain} placeholder-slate-500 focus:border-green-500 uppercase`} />
                    </div>
                    <div className="relative w-auto">
                        <input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className={`h-full ${inputBg} border ${theme === 'dark' ? 'border-slate-700' : 'border-slate-300'} rounded-xl px-4 py-2 ${textMain} font-mono text-sm focus:border-green-500 outline-none uppercase`} style={{ colorScheme: theme }} />
                    </div>
                    <button onClick={handleSearch} className="bg-green-600 hover:bg-green-500 text-white px-4 rounded-xl flex items-center justify-center"><Icons.Search /></button>
                </div>
                <div className={`mt-3 flex justify-between text-xs ${textSub} font-mono`}>
                    <span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${reqStatus.includes('Live') ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></span>{reqStatus}</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {!activeData ? (
                    <div className={`h-full flex flex-col items-center justify-center ${textSub} opacity-50`}><Icons.Navigation /><p className="mt-4 text-sm font-medium">Enter a query to start</p></div>
                ) : (
                    <>
                    {mode === 'flight' && (
                        <div className="space-y-6">
                            <div className={`${cardBg} p-6 rounded-2xl border ${cardBorder}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div><h2 className={`text-4xl font-black ${textMain} font-mono`}>{activeData.number}</h2><p className="text-sm font-bold text-green-500 uppercase tracking-widest">{activeData.airline}</p></div>
                                    {formatStatus(activeData.status)}
                                </div>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="text-left w-1/3">
                                        <div className={`text-[10px] font-bold ${textSub} uppercase`}>ORIGIN</div>
                                        <div className={`text-xl font-bold leading-tight ${textMain}`}>{activeData.origin?.code}</div>
                                        <div className={`text-xs ${textSub} truncate`}>{activeData.origin?.city}</div>
                                        <div className={`mt-2 text-xs font-mono ${textMain} ${theme==='dark'?'bg-slate-900':'bg-slate-100'} p-1 rounded px-2 inline-block`}>DEP: {activeData.origin?.time}</div>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center px-2 opacity-40"><Icons.Plane /><div className={`w-full h-px ${theme==='dark'?'bg-slate-500':'bg-slate-300'} border-t border-dashed border-slate-500`}></div><div className={`text-[9px] ${textSub} mt-1`}>{activeData.meta?.duration}</div></div>
                                    <div className="text-right w-1/3">
                                        <div className={`text-[10px] font-bold ${textSub} uppercase`}>DESTINATION</div>
                                        <div className={`text-xl font-bold leading-tight ${textMain}`}>{activeData.destination?.code}</div>
                                        <div className={`text-xs ${textSub} truncate`}>{activeData.destination?.city}</div>
                                        <div className={`mt-2 text-xs font-mono ${textMain} ${theme==='dark'?'bg-slate-900':'bg-slate-100'} p-1 rounded px-2 inline-block`}>ARR: {activeData.destination?.time}</div>
                                    </div>
                                </div>
                                <div className={`grid grid-cols-2 gap-4 ${theme==='dark'?'bg-slate-900/50':'bg-slate-50'} p-3 rounded-xl border ${cardBorder}`}>
                                    <div className={`text-center border-r ${theme==='dark'?'border-slate-700':'border-slate-300'}`}><div className={`text-[9px] ${textSub} uppercase`}>DEP GATE / TERM</div><div className={`font-mono font-bold ${textMain}`}>{activeData.origin?.gate || '-'} / {activeData.origin?.terminal || '-'}</div></div>
                                    <div className="text-center"><div className={`text-[9px] ${textSub} uppercase`}>ARR GATE / TERM</div><div className={`font-mono font-bold ${textMain}`}>{activeData.destination?.gate || '-'} / {activeData.destination?.terminal || '-'}</div></div>
                                </div>
                                <div className="mt-4 text-center"><span className={`text-[10px] ${textSub} uppercase tracking-widest`}>ESTIMATED TIME TO ARRIVAL</span><div className={`text-2xl font-black ${theme==='dark'?'text-green-400':'text-green-600'} font-mono tracking-tight`}>{activeData.meta?.eta}</div></div>
                            </div>

                            
                            {/* COCKPIT SWITCH */}
                            <div className="flex items-center justify-center mt-4">
                              <CockpitSwitch 
                                checked={isCockpit}
                                onChange={() => setIsCockpit(!isCockpit)}
                              />
                            </div>
                        </div>
                    )}
                    {mode === 'airport' && (
                        <div className="space-y-4">
                            <h2 className={`text-2xl font-bold ${textMain}`}>{activeData.name}</h2>
                            <div className={`flex ${theme==='dark'?'bg-slate-800':'bg-slate-200'} p-1 rounded-lg`}>
                                <button onClick={() => setAirportTab('departures')} className={`flex-1 py-2 text-xs font-bold rounded ${airportTab === 'departures' ? 'bg-blue-600 text-white' : `${textSub} hover:text-blue-500`}`}>DEPARTURES</button>
                                <button onClick={() => setAirportTab('arrivals')} className={`flex-1 py-2 text-xs font-bold rounded ${airportTab === 'arrivals' ? 'bg-blue-600 text-white' : `${textSub} hover:text-blue-500`}`}>ARRIVALS</button>
                            </div>
                            <div className="space-y-1">
                                {(activeData[airportTab] || []).map((item, idx) => (
                                    <div key={idx} className={`grid grid-cols-12 gap-2 ${theme==='dark'?'bg-slate-800/40':'bg-white'} p-3 rounded border ${cardBorder} ${itemHover} items-center`}>
                                        <div className={`col-span-2 font-mono font-bold text-sm ${textMain}`}>{item.time_real}</div>
                                        <div className="col-span-3 text-blue-500 font-bold text-sm">{item.flight}</div>
                                        <div className={`col-span-4 text-xs font-bold truncate ${textSub}`}>{airportTab==='departures'?item.destination:item.origin}</div>
                                        <div className="col-span-3 text-right">{formatStatus(item.status)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    </>
                )}
            </div>
        </div>
      </div>
      )}
      
      {/* Toggle Button - Only show when sidebar is closed */}
      {!sidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)} 
          className={`absolute z-30 transition-all ${theme==='dark'?'bg-slate-800 text-white border-slate-700':'bg-white text-slate-800 border-slate-300'} p-2 rounded-lg border shadow-xl hover:scale-110`} 
          style={{ left: '4px', top: '70px' }}
        >
          <Icons.ChevronRight />
        </button>
      )}
      
      <div className="flex-1 bg-black relative z-10 w-full">
        <GoogleMap 
          activeData={activeData} 
          mode={mode} 
          isCockpit={isCockpit} 
          theme={theme} 
          sidebarOpen={sidebarOpen}
          onMapLoad={(m) => mapInstanceRef.current = m} 
        />
        
        {/* THEME TOGGLE (TOP RIGHT) */}
        <div className="absolute top-4 right-4 z-50">
          <ThemeSwitch 
            checked={theme === 'dark'} 
            onChange={() => toggleTheme()} 
          />
        </div>

        <div className="absolute bottom-8 right-8 z-50 flex flex-col gap-2">
            <div className={`flex flex-col ${theme==='dark'?'bg-slate-900 border-slate-700':'bg-white border-slate-200'} border rounded-lg overflow-hidden shadow-xl w-12 self-end`}>
                <button onClick={handleZoomIn} className={`p-3 ${theme==='dark'?'hover:bg-slate-800 border-slate-700 text-white':'hover:bg-gray-100 border-slate-200 text-slate-900'} border-b flex items-center justify-center transition-colors`}><Icons.Plus /></button>
                <button onClick={handleZoomOut} className={`p-3 ${theme==='dark'?'hover:bg-slate-800 text-white':'hover:bg-gray-100 text-slate-900'} flex items-center justify-center transition-colors`}><Icons.Minus /></button>
            </div>
        </div>
      </div>
    </div>
  );
}
