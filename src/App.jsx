import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import {
  Navigation,
  Map as MapIcon,
  Train,
  Siren,
  Search,
  Sun,
  Moon,
  CloudRain,
  MapPin,
  Move,
  X,
  ArrowRightCircle,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CornerUpRight,
  Zap,
  Layers,
  Calendar,
  Bus,
  Trash2,
  Clock,
  LocateFixed,
  LogOut,
  Eye,
  AlertTriangle,
  CheckCircle,
  Loader,
  Flag,
  TrainFront,
  Save,
  Edit3,
  Activity,
  Send,
  MessageSquare,
  Mic,
  MicOff,
  Sparkles,
  ArrowLeft,
  Square,
  Copy,
  Plane,
} from "lucide-react";

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";

import TrainsPageComponent from "./TrainsPage";
import TransportPageComponent from "./TransportPage";
import VideoTransition from "./components/VideoTransition";
import { DateTimePicker } from "./components/DateTimePicker";
import AirTransitPage from "../airport/src/App";

// --- CONFIGURATION ---
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyBta64CrHTAb8w0cTJV9eLl1PjecrQ5O2Q";
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyBGjcB5Fy6Y_rQ4g-2JRMqj89IbjdgRmGs";
const BENGALURU_CENTER = { lat: 12.9716, lng: 77.5946 };

// --- VOICE CONFIGURATION ---
const ELEVEN_LABS_API_KEY = import.meta.env.VITE_ELEVEN_LABS_API_KEY || "sk_3b6cfb5b2c3ad91321cfbb408a99988fe6b09ffa96d96b12";
const ELEVEN_LABS_VOICE_ID = "cgSgspJ2msm6clMCkdW9"; // Jessica's Voice ID

// --- FIREBASE SETUP ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAhBhKMWuPQJefMr997-m_-zSVvtg_p8Js",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "etaforge-live.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://etaforge-live-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "etaforge-live",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "etaforge-live.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "14242983734",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:14242983734:web:cda6c57463217ba2700d97",
};

const appId = typeof __app_id !== "undefined" ? __app_id : "etaforge-live-main";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- CSS FOR THEME SWITCH & TOOLTIP BUTTONS & LOADER ---
const globalStyles = `
  /* Theme Switch */
  .switch {
    font-size: 17px;
    position: relative;
    display: inline-block;
    width: 3.5em;
    height: 2em;
    border-radius: 30px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  .switch input { opacity: 0; width: 0; height: 0; }
  .slider {
    position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
    background-color: #2a2a2a; transition: 0.4s; border-radius: 30px; overflow: hidden;
  }
  .slider:before {
    position: absolute; content: ""; height: 1.2em; width: 1.2em; border-radius: 20px;
    left: 0.3em; bottom: 0.4em; transition: 0.4s;
    transition-timing-function: cubic-bezier(0.81, -0.04, 0.38, 1.5);
    box-shadow: inset 8px -4px 0px 0px #fff;
  }
  .switch input:checked + .slider { background-color: #00a6ff; }
  .switch input:checked + .slider:before { transform: translateX(1.5em); box-shadow: inset 15px -4px 0px 15px #ffcf48; }
  .star { background-color: #fff; border-radius: 50%; position: absolute; width: 4px; transition: all 0.4s; height: 4px; }
  .star_1 { left: 2.5em; top: 0.5em; }
  .star_2 { left: 2.2em; top: 1.2em; }
  .star_3 { left: 3em; top: 0.9em; }
  .switch input:checked ~ .slider .star { opacity: 0; }
  .cloud { width: 3.5em; position: absolute; bottom: -1.4em; left: -1.1em; opacity: 0; transition: all 0.4s; }
  .switch input:checked ~ .slider .cloud { opacity: 1; }

  /* Tooltip / Styled Control Buttons */
  ul.example-2 {
    list-style: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 0.8rem;
    padding: 0;
    margin: 0;
  }
  .example-2 .icon-content {
    position: relative;
    z-index: 50;
  }
  .example-2 .icon-content .tooltip {
    position: absolute;
    top: 50%;
    right: 60px; /* Left of button */
    left: auto;
    transform: translateY(-50%);
    color: #fff;
    padding: 6px 10px;
    border-radius: 5px;
    opacity: 0;
    visibility: hidden;
    font-size: 14px;
    transition: all 0.3s ease;
    white-space: nowrap;
    pointer-events: none;
    background-color: #333;
    font-weight: bold;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  .example-2 .icon-content:hover .tooltip {
    opacity: 1;
    visibility: visible;
    right: 70px;
  }
  .example-2 .icon-content button {
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    color: #4d4d4d;
    background-color: #fff;
    transition: all 0.3s ease-in-out;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  /* Dark mode adaptation for buttons via parent class */
  .dark .example-2 .icon-content button {
    background-color: #1a1a1a;
    color: #e5e5e5;
    border: 1px solid rgba(255,255,255,0.2);
  }

  .example-2 .icon-content button:hover {
    box-shadow: 3px 2px 45px 0px rgb(0 0 0 / 12%);
    color: white !important;
  }
  
  .example-2 .icon-content button svg {
    position: relative;
    z-index: 1;
    width: 24px;
    height: 24px;
  }
  
  .example-2 .icon-content button .filled {
    position: absolute;
    top: auto;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 0;
    background-color: #000;
    transition: all 0.3s ease-in-out;
  }
  .example-2 .icon-content button:hover .filled {
    height: 100%;
  }

  /* Specific Colors for Features */
  .example-2 .icon-content[data-type="layers"] .filled,
  .example-2 .icon-content[data-type="layers"] .tooltip {
    background-color: #8b5cf6; /* Purple */
  }
  
  .example-2 .icon-content[data-type="traffic"] .filled,
  .example-2 .icon-content[data-type="traffic"] .tooltip {
    background-color: #eab308; /* Yellow */
  }

  /* --- CUSTOM LOADER ANIMATIONS --- */
  .loader {
    animation: rotate 1s infinite;
    height: 50px;
    width: 50px;
  }

  .loader:before,
  .loader:after {
    border-radius: 50%;
    content: '';
    display: block;
    height: 20px;
    width: 20px;
  }

  .loader:before {
    animation: ball1 1s infinite;
    background-color: #cb2025;
    box-shadow: 30px 0 0 #f8b334;
    margin-bottom: 10px;
  }

  .loader:after {
    animation: ball2 1s infinite;
    background-color: #00a096;
    box-shadow: 30px 0 0 #97bf0d;
  }

  @keyframes rotate {
    0% { -webkit-transform: rotate(0deg) scale(0.8); -moz-transform: rotate(0deg) scale(0.8); transform: rotate(0deg) scale(0.8); }
    50% { -webkit-transform: rotate(360deg) scale(1.2); -moz-transform: rotate(360deg) scale(1.2); transform: rotate(360deg) scale(1.2); }
    100% { -webkit-transform: rotate(720deg) scale(0.8); -moz-transform: rotate(720deg) scale(0.8); transform: rotate(720deg) scale(0.8); }
  }

  @keyframes ball1 {
    0% { box-shadow: 30px 0 0 #f8b334; }
    50% { box-shadow: 0 0 0 #f8b334; margin-bottom: 0; -webkit-transform: translate(15px,15px); -moz-transform: translate(15px, 15px); transform: translate(15px, 15px); }
    100% { box-shadow: 30px 0 0 #f8b334; margin-bottom: 10px; }
  }

  @keyframes ball2 {
    0% { box-shadow: 30px 0 0 #97bf0d; }
    50% { box-shadow: 0 0 0 #97bf0d; margin-top: -20px; -webkit-transform: translate(15px,15px); -moz-transform: translate(15px, 15px); transform: translate(15px, 15px); }
    100% { box-shadow: 30px 0 0 #97bf0d; margin-top: 0; }
  }

  /* --- NEW WEATHER CARD STYLES --- */
  .cardm {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: scale(0.65); /* SCALED DOWN */
    transform-origin: bottom right;
    margin-bottom: 1rem;
  }

  .card {
    position: absolute;
    width: 250px;
    height: 130px;
    border-radius: 25px;
    background: #1e1e1e;
    color: #ffffff;
    z-index: 2;
    transition: 0.4s ease-in-out;
    bottom: 0;
    right: 0;
  }
  
  /* Light mode override for card base */
  .light-mode-card {
    background: #ffffff !important;
    color: #333 !important;
    border: 1px solid #e5e7eb;
  }

  .weather {
    position: relative;
    margin: 1em;
  }

  .main {
    font-size: 2em;
    position: relative;
    top: -3em;
    left: 4.3em;
    font-weight: bold;
  }

  .mainsub {
    position: relative;
    top: -10.2em;
    left: 14em;
    font-size: 0.6em;
    font-weight: 500;
  }

  .card2 {
    position: absolute;
    display: flex;
    flex-direction: row;
    width: 240px;
    height: 130px;
    border-radius: 35px;
    background: #2d2d2d;
    z-index: -1;
    transition: 0.4s ease-in-out;
    bottom: 0;
    right: 5px;
  }
  
  /* Light mode override for card2 */
  .light-mode-card2 {
    background: #f3f4f6 !important;
    border: 1px solid #e5e7eb;
  }

  .card:hover {
    background-color: #3a3a3a;
    cursor: pointer;
  }
  
  .light-mode-card:hover {
    background-color: #f9fafb !important;
  }

  .card:hover + .card2 {
    height: 300px;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
  }

  .card:hover + .card2 .lower {
    top: 20.2em;
  }

  .upper {
    display: flex;
    flex-direction: row;
    position: relative;
    color: #ffffff;
    left: 1.8em;
    top: 0.5em;
    gap: 4em;
  }
  
  .light-mode-text {
    color: #333 !important;
  }

  .humiditytext {
    position: relative;
    left: 3.6em;
    top: 2.7em;
    font-size: 0.6em;
  }

  .airtext {
    position: relative;
    left: 3.8em;
    top: 2.7em;
    font-size: 0.6em;
  }

  .lower {
    display: flex;
    flex-direction: row;
    position: absolute;
    text-align: center;
    color: #ffffff;
    left: 3em;
    top: 1em;
    margin-top: 0.7em;
    font-size: 0.7em;
    transition: 0.4s ease-in-out;
  }

  .aqi {
    margin-right: 3.25em;
  }

  .realfeel {
    margin-right: 1.8em;
  }

  .card3 {
    position: absolute;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: 240px;
    height: 30px;
    top: 4.7em;
    left: -2.4em;
    font-size: 1.24em;
    border-bottom-left-radius: 35px;
    border-bottom-right-radius: 35px;
    background: #2ecc71;
    color: #1e1e1e;
    transition: 0.4s ease-in-out;
    font-weight: bold;
  }
`;

// --- AUDIO UTILS FOR GEMINI/ELEVENLABS ---
// Convert base64 to audio buffer
const base64ToArrayBuffer = (base64) => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Convert PCM16 to WAV for browser playback
const pcmToWav = (pcmData, sampleRate = 24000) => {
  const buffer = new ArrayBuffer(44 + pcmData.byteLength);
  const view = new DataView(buffer);
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + pcmData.byteLength, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, pcmData.byteLength, true);
  const pcmView = new Uint8Array(pcmData);
  const wavView = new Uint8Array(buffer, 44);
  wavView.set(pcmView);
  return buffer;
};

// --- NEW CUSTOM LOADER COMPONENT (FIXED SCALING) ---
const CustomLoader = ({ scale = 1, className = "" }) => {
  return (
    <div
      className={className}
      style={{
        width: `${50 * scale}px`,
        height: `${50 * scale}px`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible", // Ensure animation doesn't get clipped
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          width: "50px",
          height: "50px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="loader" />
      </div>
    </div>
  );
};

// --- NEW THEME SWITCH COMPONENT ---
const ThemeSwitch = ({ isDarkMode, setIsDarkMode }) => {
  return (
    <div className="flex items-center justify-center p-1 mt-2">
      <label className="switch">
        <input
          checked={!isDarkMode}
          onChange={() => setIsDarkMode(!isDarkMode)}
          id="checkbox"
          type="checkbox"
        />
        <span className="slider">
          <div className="star star_1" />
          <div className="star star_2" />
          <div className="star star_3" />
          <svg viewBox="0 0 16 16" className="cloud_1 cloud">
            <path
              transform="matrix(.77976 0 0 .78395-299.99-418.63)"
              fill="#fff"
              d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925"
            />
          </svg>
        </span>
      </label>
    </div>
  );
};

// --- ELEGANT SMALL BACK BUTTON ---
const CustomBackButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white dark:bg-black/90 backdrop-blur-md text-center w-32 rounded-2xl h-10 relative text-black dark:text-white text-sm font-bold group border border-gray-200 dark:border-white/20 shadow-xl transition-all"
      type="button"
    >
      <div className="bg-green-500 rounded-xl h-8 w-8 flex items-center justify-center absolute left-1 top-[3px] group-hover:w-[120px] z-10 duration-500 transition-all">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1024 1024"
          height="16px"
          width="16px"
        >
          <path
            d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"
            fill="currentColor"
            className="text-white"
          />
          <path
            d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
            fill="currentColor"
            className="text-white"
          />
        </svg>
      </div>
      <p className="translate-x-3 group-hover:text-white transition-colors duration-300 z-20 relative">
        Go Back
      </p>
    </button>
  );
};

// --- NEW ARIA CHAT BUTTON ---
const AriaChatButton = ({ onClick, isActive, isThinking }) => {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className="p-2 bg-white dark:bg-black/80 rounded-full shadow-lg border border-gray-200 dark:border-white/10"
      >
        <svg
          strokeLinejoin="round"
          strokeLinecap="round"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          height={40}
          width={40}
          xmlns="http://www.w3.org/2000/svg"
          className={`w-8 h-8 hover:scale-110 duration-200 hover:stroke-blue-500 text-gray-700 dark:text-white ${isThinking ? "animate-pulse text-yellow-500" : isActive ? "animate-pulse text-green-500" : ""}`}
          fill="none"
        >
          <path fill="none" d="M0 0h24v24H0z" stroke="none" />
          <path d="M8 9h8" />
          <path d="M8 13h6" />
          <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z" />
        </svg>
      </button>
      <span className="absolute -top-12 right-0 w-max z-20 origin-right scale-0 px-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 text-sm font-bold text-gray-800 dark:text-white shadow-md transition-all duration-300 ease-in-out group-hover:scale-100">
        {isThinking ? "Thinking..." : "Talk to Aria"}
      </span>
    </div>
  );
};

// --- EXPANDING WEATHER CARD (REPLACED) ---
const WeatherCard = ({ data, onClick, isLoading, isDarkMode }) => {
  // Safe defaults
  const temp = data?.temp ? data.temp.replace(/\D/g, "") + "°C" : "24°C";
  const condition = data?.condition || "Clear";
  const extra = data?.prediction || "Sunny day";
  const location = "Bengaluru, IN"; // Default context

  return (
    <div className="cardm">
      <div
        className={`card ${!isDarkMode ? "light-mode-card" : ""}`}
        onClick={onClick}
      >
        <svg
          xmlSpace="preserve"
          viewBox="0 0 100 100"
          height="100px"
          width="100px"
          y="0px"
          x="0px"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          xmlns="http://www.w3.org/2000/svg"
          id="Layer_1"
          version="1.1"
          className="weather"
        >
          <image
            href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAMg0lEQVR42u2de5AcVb3HP7/unZ19Tt4vQsgGwpIABoREEVJqlFyLwgclEsmliFZULIWgqFHxlZKioBRKIVzBRwEmKUFQsQollhCzAW9xrzxKi/IiybVAgVjktdlkd3Z3errPzz+6Z3d2d2a3Z7bnsaF/VVvdc/qc032+nz3nd87p7tMQW2yxxRZbbLHFFltsscVWXZNaX0Ap1ruLeQ1ZlqN0CsxXQ6vCdFHaMKBCnxp6BNKqvCHKXs/mpfYPcaDW1x7W6haIdtGQdVlllDUoa1RZJTANBRQ02A79ZuTvEXEMPcBzCrvF0NUyj+dkDW6ty1jI6gqIbsEafBdrxLAB5TJRUqq5g1AWjLz0eWHH1fBrhO1te9kj38bUuuw5qwsg+hRzHJdNKB9HWTRCVIgaxoi0anhNlPvV5q7UVRyutRY1BaK7mOfYfEaVG0RJjREVKgpjRJghrXCv7XBb6zW8XitNagJEn6bZyfB14EsoyYKiQvVg5MVTwyDCbak2bpV1DFRbm6oDyXbxflW2IiwpKFYNYeTSql9jXka4ftoneaya+lQNiHbRloUfAlcNFbpeYYw8vj2T5dp519F3wgAZfIozLcPDKGdNJRh+HEGVvWp03cxreaHSWlmVPkHmSa4Sw/NTFQYKAmdYIv/bcxdXTmkgThebMGwXpWmqwsi7tmaDPHB0K1+cckBUkcwebkHYKsE5pjgM1K8pAnL70Tvk5ikFxHmKmwVuHL/QUwvGiHjC1498X26qhHaRO3VnD58FfnDCwhiRVj8/8wvcWbdAMk9xJR4/O5GaKcZJq4pRox+dvZlf1h2QzB85C5dnBFreDDCG4hnSanTV7K/ytyh0jMSH6NM0i8sDbzoY/rFWRB7ev8Uve10AyTr8AFjxpoMRHBc4O9kkd0Sh5aSbrGwXFys88WaFkR+m6Hvn3Mjuyeg5qRqif6VRlbtiGP5WPLln350kawYke4gvIyyLYQyFd844xucno2nZTZZ2MduBf6C0xjCGf6vS2+hpx/Rv012OrmXXEEf5XAxjbLkF2rOWXF+urmXVEN1JKpPkHwIzYhhjy61Kt6S1Y85t9JaqbVk1JJPk0zGM4uVGmUkz15SjbVlARNkYwxi/3MbIxqoAcXbxNmBZDGP8cotw5sFv8NaKA1Hl6hjGBOXOlcnI1RUHAnw4hhG6TB+pKJDBx1mOclIMI2SZYNHBzZxeMSCW/9BzDKOEMhnhPRUD4ilrYhillQmVygEROD+GUUKZ/HKdV6LG4Ux3khy0SItixzDCwQjO7fUOamvnXWTC6NwQFoijdJ5oMFTBM+B54Hr+vprhtLZAgwV2sF8qDBREsdsaOQ14MVIgatOJOTFgeB44LgxmIeP6+9qQwmqbj900C+Nm8PqP4Pa8RkIMjTYkbWiyIWEFzUoIGENhhjOiB2KYV46g9QTDMzDoQH8W0hlILnonqbM/QvuSd5Gc2xlclw5tvUya/tefp+eF39L9wsMkeg/RloTWhF9jQsFQEJgbVudSgLTn/jOmIgzH9SEcH4TGJZfQsXYLLQvOGboW1WEQGgRKooXWJatp6VjN/Eu+xZFntnP4iVsY6DvK9GZIWhPDCPbbw+ocupclSttUhZFx4Wg/HDMzmHfZTzltwyM0LzgHo4qqjtkW+qOhiVnvuIZTv/Ac5tRLOdzn5xvG+YuR6IEQAJlqMJwARjpxMh0bdzFjxUd94U0g9qitMeNDsltnccqGHTRd9CUO94HjjQ8jKHcqrMyhmywUo8XazTqF4XpwbADS9nw6P9VFYtpCX9g8PzHcPdWiWw1OkL+d+76vcUDh2P/czsym4XMKY8utSg5bdEAM9MkUgqEK/Rk47jSyeMMOEqkARnAxhbfFAYzdwpz/+Ar/OriPA3sfxQQ90ITl+5akBQnbb4JENfSdw9BARINXuqYIjKwLvRmYtfortC6+EBNELARiuMYUBzC25vjnn3flPWj2+9CQxO09QLb7ddL7nuT4iztpOPQSqSQ0SfjX4cL3spTjBfvfdQgDhX4HnOYOFl/0uTE1I7/JogiQ8Zqw3LkVBSsByQZQsKctxE4tJNnxNli7md4Xf8/h391KqvulwciBAP+aKjA84481Zq3ehDQ0YcxE4g43QwVhjYgzftx88K3L19J8+rsZ+NvO5dz/mVAih+5l2creeobhGb+ZGggGfY7XxLS3rCvajQ3T1R2KU6RHpkaHemzFem5YDTSd+YFrX3719W+G0Tn85GIXDekjpEVprCcYWdcfffdmICPttHZ+kOZFF9A0/2yaTjo/lH8Y20wN/5cX9zfF8y1YA1XVGF1/+qmLH4oECED6F7wILK8HGCaYBunphwHTzIwLb2D2hdcjiZZI/MPE/mY434nzGwLWi5ddunTp0oPFNC7Fh4DyDLC8HmCkB/0xRiYxn1PWP0zTgnP9eKaYGCP9QRHBxvclBfxEuPyG8m1Xy/4msKmYxCXdoFKlq55g9GuKxR97jKYF54b3D6NH5CX4hxF+okyfZIxufG7//qIv95R2T92wu9Y+IxM47X4HTvrAVhpnLi3NQU8yzlDcMoCqGlBa2vozayMB0rKe1zDsqxUMx4WBjD+pl1ywkvbll1UIgCkap5S4RWuJmtWRAAn0e6hWXdusO3xDacbKT6CEEWxYuErVpJLzM7owMiCey3YTzM9VE4bjQtYDT8E1QvOpF088YztRsxJhU1YKJA9mRQZk+gb+LvCnasJQHb7vbTywk9OxW2aV1/bnb0MCndA/lArJmIi6vYEZ5SeWckG1YKgJaobn97KslplDhR5KN6o7Ot64YXR3tJrjkSDf/ZHVEIBUPzvU8M9qwEDB5Hd7Fbz+7iq1/aaE/Ezoc2JMV6RA5NNkVfleNWDkH/cMiII32EO2vyevWQknhhYQbtIOutQ4xhxvSdp7IgUCkGrlJ2p4o9IwCJosVR+GJYBR0v//xKiCTjzRN65/qBIko/xXZ2dn0YfmygYi6xhAubHSMPLDBB+IKvT+5YFoBZsAZGiHP845jZpD6iS/O56uk3pPPfUJtqHsqTSM3I2x3LNQtgX9r/yR/r//oTLNymRqSXGQrmKuWrnytGMVAyKCWobrVMlWtGYEWyuYm24Mnoc69OgNOMf2V6ftDw3JjG2mjDGq3qZVK1Y8MZGmk158pv0a/g/DTZV88NkK0iVsH07C8muL23uQAw9ciXPkleC/0JQgrikBgJkEJHNc4EOrzl3xwzB62pMFAnDr+fz3YJu8Q+C0qGHkjuWe6jDG723ZEozc092k//oIVnIaibnLQCw/fRnjkqFxwiTHGsFpXcXca3uJK1aed9bzYbWMbAGz3ruZ6yF/JvfKW0QwgnKSzT0UrdA76IMxxp/1NUG8humLaV52KY0dF2G3z8NumY0R8L99MFbkXN6BhAXEHT2QDOKavHwEYxpbe0VIo7IfNa8qPK6O9ejb3372G6XqGOkSf8fu5gJjZBf5S25EACP3e8AZfn0g7QSCBeFZb1Ra8tJSJH/GuYa8sBH7eWGiDExP6sXnPcTTUWkY+SKYPVu52CCP5e69RwUDBTe4bZsbJKYdv5YQNGWu58PyCog5ZmxDuOsqBEMBC7JtSb38/Af5TZT6VWSp8e47uRqVbYBEBSMXJzfri/pN1WBQO3Iv2pRUM8qEgcEkbd14zs/ZFrV2FVv7vfsO/lON/FQgERWMXNqs5985zD/uun4NMqPOUS6MgmH+L8dCP3Xug2yvhG4VXYz/6O28V0V+jdIeFYxcmAmew3K9AmmjgjEqrUAadN0ZO9hZKc0q/nWEQ7exSlR+JbAoKhij47jesIMvmv8kYajymuvp5ct+xrOV1Ksqn6s4dguzsrZsE7g0Shih0kYBw/Bby9OPn7yDI5XWqnofdFGk+ztsViM3wfBnjuocxqCqfmPR/Xwvbx7ixACSswO3sNRS2SrKJfUMw8BuT/S6JfdGs2J1WKvZV9oO3swVovJdlI56gqGGVxDdvOg+flULXWr72bwfkThygPXGyI3o8KJoOcGqDONlNfqdAwnuX/ljsrXSpD4+LLkF65ByOSobFdaKYlcDhiqeGB5X0ftOXsgj9fDFz7oAkm8Hv8YCI6wXI1eoslKgIUoYanBVeRb0F67Dg0u2UfIEYCWt7oDk2+EtpLL9vBOR9+B/nHgZyuxSYKjhELBX4FlFdycdnpxzX+nLt1bL6hpIIXv1BmY2QqdRTgZaBdpM8PluC/rU0Af0eR77Ncu+U+4tb4Xp2GKLLbbYYosttthiiy222GKLLbbYYottfPs3GPtpnh9ZV0oAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjMtMDItMTdUMDg6MDM6MDcrMDA6MDBPnKiVAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIzLTAyLTE3VDA4OjAzOjA3KzAwOjAwPsEQKQAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyMy0wMi0xN1QwODowMzowNyswMDowMGnUMfYAAAAASUVORK5CYII="
            y={0}
            x={0}
            height={100}
            width={100}
            id="image0"
          />
        </svg>
        <div className="main">{isLoading ? "--" : temp}</div>
        <div className="mainsub">{location}</div>
      </div>
      <div className={`card2 ${!isDarkMode ? "light-mode-card2" : ""}`}>
        <div className={`upper ${!isDarkMode ? "light-mode-text" : ""}`}>
          <div className="humidity">
            <div className="humiditytext">
              Humidity
              <br />
              30%
            </div>
            <svg
              className="humiditysvg"
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="30px"
              height="30px"
              viewBox="0 0 30 30"
              xmlSpace="preserve"
            >
              <image
                id="image0"
                width={30}
                height={30}
                x={0}
                y={0}
                href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAABGdBTUEAALGPC/xhBQAAACBjSFJN
          AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABiVBMVEUAAAAAAP9NerV/f39O
          e7ZQfLZVf6pRfbfL5fdRfbZIbbZmmcxols5nl85OebSPsteLrdVSfLZxl89ok9FqlM5ahsBdicNa
          hsFcicRhjcdWgbpahsFfi8ZbhsFijsmErOWLt+9xndZcicJahsFahsFdicN5n81xjcZqlNRpls1q
          lNBfn99pls9nkcxXgrpZgrtik81OebWNsdeMrtZOebRNerVZg7pwmMhNebRKdLRNerZNebHZ8v9o
          lM9jj8rV7v3W7v1ch7+Ktu6Lt/CEsep7p+Cz1PO+3fqJte5/q+V+quOUvvLY8f+TvfKpzvapzfaq
          z/aRvPGdxfSVv/LX8P/W8P+32fnK5vyMuPCmzPXW8P6ny/WWv/KOufGawvO22PjJ5vzB4PrU7v6i
          yPSz1fiYwfKOufDD4funzPXF4vvE4vuOuvHV7/7U7/7G4/uNufCx1Pew0/ev0veu0feQu/G01viP
          ufF/q+SCrud+quSItO2kyvWjyfVijslrltFmkcyEqtZgjMf///8NXQssAAAAPHRSTlMAAZgCW+EG
          y+jMBxRaRXHC2H8bX0ry/vrhyvnw0PDHR0Be/e/4/f4SDDNiEFVb0eI5iMHCho7NwI0YOBdy59Cm
          AAAAAWJLR0SCi7P/RAAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+cCEBITAJMBs+kAAAFb
          SURBVCjPY2CAAUYmZgY8gIWVBY8sGzsHJxc2CW4eXiDJx28jIAjiCgnzgoV5ebiBpIiomK2duISk
          lL2Ng6O0jIwsmCsnIW5nKyYqwiDv5AwELq5uNjY27h6enh5grpcLiHKSZ1BwBgNvH6C0j68zKlCA
          SfvZgIA/LukAsHQAVDgwCE06OAQoGxoMlQ4Lj0CVdo6MsomKhrJjfGwi0aSdY+NiYcx4G5sEdGkk
          kGhjk4RHOjnEJgWPtLNvKprL07CpgktHpEfgk/a3ycAnnWmThRDMxpDOscmFi6Xl5aNLF+QUwqWL
          bIoxogQBSpJskkpwS5cC4yYFp3RZElA6qQwh7VFeAWZXVFYByWpwxNcAueUeQGlFJWUZCZXauloV
          CRllVdt6NbB0QyOIq6TIoK4BSrWaWpogSltHVw8srW8A4mqoY6R6QyOgrLEJztxiamZuZsGGOztZ
          WlnD2QBCYbJl9Cx9XAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMy0wMi0xN1QwODowNDoyMiswMDowML1dmzYAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjMtMDItMTdUMDg6MDQ6MjIrMDA6MDDMACOKAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDIzLTAyLTE3VDA4OjA0OjIyKzAwOjAwmxUCVQAAAABJRU5ErkJggg=="
              />
            </svg>
          </div>
          <div className="air">
            <div className="airtext">
              Wind
              <br />8 Km/h
            </div>
            <svg
              xmlSpace="preserve"
              viewBox="0 0 30 30"
              height="30px"
              width="30px"
              y="0px"
              x="0px"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              xmlns="http://www.w3.org/2000/svg"
              id="Layer_1"
              version="1.1"
              className="airsvg"
            >
              <image
                href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAMAAAAM7l6QAAAABGdBTUEAALGPC/xhBQAAACBjSFJN
            AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABaFBMVEUAAAAA//8ilfIhlfMg
            lvIglfMglvIeku8cjf8glvMhlfIflvMhlfIhlvIglvMhl/MglvIglfIglPEfmfIhlfIglvQfn/8g
            lfIglvIhlfMglfIglvMhl/AhlfIcm/AAf/8qlOkglPYglvIZmf8zmf8hlfIglfIXi+cilPMhlvMg
            lfQhlvMglvIhlfIgl/MglvMhlvMhlfMhlvIfl+8hlvMhlfMglvMglvI/f/8hlvMilvMelvAglfIg
            lvMhlvIglPIglvIhlfIkkfUglfMglfMhlvMhlvMilvMjlfEglvMhlfIhlfMglfIflvEnnOshlvIf
            lPEflfIek/QglvIglvMhlfIime4jlPAglvMglvEhlvMhl/MglfMglfMhlvIak/Edk/UhlvIglfMg
            l/IglvIglfIilPIhlvMhlfMhk/Eqqv8glvIglfMcl/UhlfMhlvIhlvMhlfIglfIhlfIgl/QflPQh
            lvP///+FIn/GAAAAdnRSTlMAAVKu1MmNIQmy91ig/Z5s0fo3KP5dCL27Lvm0NvwSAgwf+woFv7oL
            Q0RGa9L1Vtndx4sgme3FZgTIFiI/hvZld3sch8Tv7kI683nV6DgN4GBQMsycjw8k6nWqRW3cUxMa
            5dpnfLU87N8mBrxXG5jnibjLoi8YaHuXCQAAAAFiS0dEd0Zk+dcAAAAJcEhZcwAACxMAAAsTAQCa
            nBgAAAAHdElNRQfnAhEIBBbLW8PtAAABJ0lEQVQoz62RZ1fCMBSG46atomBR1IJ7g+KotKKgxYl7
            4Z6493x/v6T0QKMtn/p8ec/Nk5Pc5BLiHCWlZeUVlVU21sWBwgvWuho1bqG2Dh6vla0X4ctGQyP8
            VrqpuUVPCQGXlQ+26tEGtBfpX0JHp73t6kYPs9Db159nYDAEj8RoNxjCQ+xxvuFIgZHRMcemQMi4
            iP+I8kRU0TUHG9RJqpWYFVPTcahKsc/jkSAzfgNuVvvjk5gj84W7FhZZvYRl4o0apFawGmT0GsKm
            an0DmzS31O3cQgo75t27SNLYQyRNc/8AhzkROzrOPjCEE1poMk7Pzi8Sl7gyxp5B/Fq4Aa//A7m9
            y7V6/2Ac+/hEy8CzUb68ysDbezp/rZL5+Pz6NvWh/TgwzV+1HV523WQ81AAAACV0RVh0ZGF0ZTpj
            cmVhdGUAMjAyMy0wMi0xN1QwODowNDoyMiswMDowML1dmzYAAAAldEVYdGRhdGU6bW9kaWZ5ADIw
            MjMtMDItMTdUMDg6MDQ6MjIrMDA6MDDMACOKAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDIzLTAy
            LTE3VDA1OjA0OjIyKzAwOjAwmxUCVQAAAABJRU5ErkJggg=="
                y={0}
                x={0}
                height={30}
                width={30}
                id="image0"
              />
            </svg>
          </div>
        </div>
        <div className={`lower ${!isDarkMode ? "light-mode-text" : ""}`}>
          <div className="aqi">
            <svg
              xmlSpace="preserve"
              viewBox="0 0 20 20"
              height="20px"
              width="20px"
              y="0px"
              x="0px"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              xmlns="http://www.w3.org/2000/svg"
              id="Layer_1"
              version="1.1"
              className="aqisvg"
            >
              <image
                href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAABGdBTUEAALGPC/xhBQAAACBjSFJN
          AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABBVBMVEUAAABL4f9O5v9P5f9Q
          5f9R5/8AZsxB0vYAd9EAeNQAd9MeoOM1w/EYmuIZm+IXnOIAAP8AccYmrOgYmuAWneEA//8AdtQZ
          m+JP5f8ZmeUAf89L3vwcoOQYmeIAddEAeNUrseocjeIAd9QAeNMxu+4kqucZmuEYm+IWmeI5xfIf
          n99P3/9Q5v9Q5v9G2Pk0wPA+zfZN4v5L3/w+zfUyve8iqOcrs+s9zPVM4f1N4v1E1vklrOki
          p+cmrOhH2fpP5f5F1/kstewqs+tO4/4nruott+0or+pL3vxE1flK3vxA0fcjqecrtOxO5P4yvvAs
          tOw6yPNA0Pc7yfQ4xfI3xPL////cI4U2AAAALnRSTlMAEXF3ZWsFeC3S26iVh7MsAQnAVCIBZ7Ft
          ChBv6GonVZQJs4yLxtPNLY8IEHuINVg0ZAAAAAFiS0dEVgoN6YkAAAAJcEhZcwAACxMAAAsTAQCa
          nBgAAAAHdElNRQfnAhIFCRn0J5yMAAAAq0lEQVQY02NgIAkwMjFDARMjXJBFDw5Y4IKsCEFWmBgb
          u56+gaERsiAHJxe3nrGJqZm5haWeFQ8vHz9QUEAQqt3a1MbWTkhYRBRmprG9A5qZYuJ6jk62ziYu
          QEEJSaiglDRIjaOpraubu4wsupM8PL2g2gXk5BX0vH18LYwgZiqCLOJQUlbR0/Nz9LcNCAwKVlVT
          10DRbh1iGqqphc+b2ANEW0cXCnS0SQt0ALCcIug70CWhAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIz
          LTAyLTE4VDA1OjA5OjI1KzAwOjAwRMIpTAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMy0wMi0xOFQw
          NTowOToyNSswMDowMDWfkfAAAAAodEVYdGRhdGU6dGltZXN0YW1wADIwMjMtMDItMThUMDU6MDk6
          MjUrMDA6MDBiirAvAAAAAElFTkSuQmCC"
                y={0}
                x={0}
                height={20}
                width={20}
                id="image0"
              />
            </svg>
            <div className="aqitext">
              AQI
              <br />
              30
            </div>
          </div>
          <div className="realfeel">
            <svg
              xmlSpace="preserve"
              viewBox="0 0 20 20"
              height="20px"
              width="20px"
              y="0px"
              x="0px"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              xmlns="http://www.w3.org/2000/svg"
              id="Layer_1"
              version="1.1"
              className="rfsvg"
            >
              <image
                href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAABGdBTUEAALGPC/xhBQAAACBjSFJN
          AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABuVBMVEUAAAAAAAAECQkIDg4E
          BAQAAAAAAAAFBQUHDAwIDg4MFBUNFRUKCgoPGhxGenw/b3FDdXcmRUYJDAwJDw9Pi40LFBQNFhYM
          FhYPGhsMExUKEhIPGhoKEhQMExMOGhoMExMPGhoKFBQLExMNFxcKEhILFBQKExMKExQLEhILERMK
          EREHDQ1SkJMuUlMABAQAAAASHh9FeXtAcXI8aWszWlwvU1M4Y2QjPT4NGBoAAAAAAAAAAAAAAAAA
          AAAAAAAAAAAAABYmZtWlplKgoVlsbRsvsF0zM9uwsVuwcNsvb9ecU53czF0bStgbkdqt7dntbhp
          tbVxaCf5uxD+vxD7vBBTUilYlZdtwMNms7Zdc1P8vRDYpBR5b0imsKy0wcFzhoZdkpRldEx6cU3W
          5eWLnJxdm51otrlZdl67kBWxvbmUo6RmfHxajo9ouLpqt7mJdiN8YxnH1dWVpaVfn6Jgl41OUUKv
          u7pWe3xwxsldn6KmtLTO3NxUf4BswMN0ys1gpaedrKzT4uJjd3dsvcBqubxXg4Vgd3hthYVid3dh
          dnZof39shYVkf4BVeXpqt7pksbJjr7Jdo6X////f0mPcAAAAQXRSTlMABGh/a1xUZIqPo7BH2vv4
          /vJQgvyxwLLCpqXBsafBqcKutcCwuamtop+SgPzwOQzg/f728fD166Zla1o/PiEmFs+XjUIAAAAB
          YktHRJKWBO8gAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5wISBQ8aO3RqsAAAAQlJREFU
          GNNjYMAOGJmYmVlY2djYmZk5OLm4ecBivHyOTs7O/ALOTo6Oji6ugkJAQWERNxTgLgoUFEMVc/MQ
          BwpKuLl5enn7+PpBBf0lwYIBgUHBwSGhYeFgwQgpoKC0W2RUcHB0TGxcfAJYuwxYMDE4OCgpGQhS
          UoGCabJAQTm39KDgjEyQYHJWdo5brjxQUMEtLz+ooDAZAoqKXRXBgm4lpWXJMFBeoQQUVHZzq6yC
          i1XX1KoABVXr3OobYGKNTc0takBBdVc3t9a29vaOzq7unt4+t34NoKDmBFRvTtQCCmrroArq6gEF
          9Q0MnY2MTUxNzYxBwNwCHMj6llbWNrZ29jZg4IAjKhgAAWdbVO4nzP4AAAAldEVYdGRhdGU6Y3Jl
          YXRlADIwMjMtMDItMThUMDU6MTU6MjYrMDA6MDCumAyfAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIz
          LTAyLTE4VDA1OjE1OjI2KzAwOjAw38W0IwAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyMy0wMi0x
          OFQwNToxNToyNiswMDowMIjQlfwAAAAASUVORK5CYII="
                y={0}
                x={0}
                height={20}
                width={20}
                id="image0"
              />
            </svg>
            <div className="realfeeltext">
              Real Feel
              <br />
              {temp}
            </div>
          </div>
          <div className="pressure">
            <svg
              xmlSpace="preserve"
              viewBox="0 0 20 20"
              height="20px"
              width="20px"
              y="0px"
              x="0px"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              xmlns="http://www.w3.org/2000/svg"
              id="Layer_1"
              version="1.1"
              className="pressuresvg"
            >
              <image
                href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAAABGdBTUEAALGPC/xhBQAAACBjSFJN
          AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABNVBMVEUAAAAAr8EArMAAqsAA
          rMEBrMEBrMAAq8AArb8AqsIBrMEgtMa53+S53+QetMYArMEArMEAqrsArMA9scFegp4Cqr8Ao8gA
          rMEErMHn6+wTobgArMAArMBCvc1sco8Aq8EArMFSqrmNWn1Dvs4Aq8EErcLo7O0SorgArMAAq8A8
          sMBie5gCqr8BrMEftMa23eO33uQcs8YAq8AArMAAq8EAq8Mtdn9DW2OvvcSwvcSrucJ3
          kZyvvcWvv8OruMJ6kZ55kJ2rusAArMHFzdLH0NS5xMru7u7l5+jm6Ojp3eDd4OK2ubvAhZL4G0en
          rK1YYWV3foHu7e39Mlns7OwzXWQxW2Tl5+f6VHSssLKpra/9MVnc4OL1m6y5xcvv09kxcX5FWmR4
          kJywvsWsusL///80ikJBAAAARHRSTlMAHUotv/j5vSw/9cvd3MrzPg/q4+rqDnXk+/NzucP3t873
          /cJ05Przcunj8en0y93cyz28/vu7K1RASpWb/YBAhvP3hpKCbb4AAAABYktHRGYs1NklAAAACXBI
          WXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5wISBRAIBZcVZgAAAM1JREFUGNNjYMAHGJmYGNGEmFlc
          WNlc2DmQxTi5uHlc3Xj5+AUQYoJCwu4enl4e3iKiYnBBcQlJHw8PD18/fylpuKCMLFAoIDAoOERO
          Hi6ooOjuERoWHuERqaSAUKkMVBkV7REcg6RSRVUtFijsEeevroGwXVMrHiSYoK2DsJ1BQFdP38PD
          wJDfCNn1HMYmpqYmZuZoHrVITLTACBDLpCRLJK6VNRDY2CYn29qAWFZgQbsUIEhNBoJUEMsOLGhv
          BwQOjk5Ojs4glj0DCQAAJCUofMKIT9cAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjMtMDItMThUMDU6
          MTY6MDgrMDA6MDBXtcu8AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIzLTAyLTE4VDA1OjE1OjA4KzAw
          OjAwJuhzAAAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyMy0wMi0xOFQwNToxNjowOCswMDowMHH9
          Ut8AAAAASUVORK5CYII="
                y={0}
                x={0}
                height={20}
                width={20}
                id="image0"
              />
            </svg>
            <div className="pressuretext">
              Pressure
              <br />
              1012 mbar
            </div>
          </div>
          <div className="card3">{condition}</div>
        </div>
      </div>
    </div>
  );
};

/* --- VOICE HOOK --- */
const useConversation = ({ onMessage, clientTools }) => {
  const [status, setStatus] = useState("disconnected");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false); // New state for API latency visual
  const recognition = useRef(null);
  const audioRef = useRef(null);
  const abortControllerRef = useRef(null); // Ref for AbortController

  const startSession = async () => {
    if (status === "connected") return;
    setStatus("connected");

    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new Speech();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = "en-US";

      recognition.current.onstart = () => console.log("Voice: Listening...");

      recognition.current.onresult = (event) => {
        const text = event.results[0][0].transcript;
        onMessage({ source: "user", message: text });
        processMockResponse(text);
      };

      recognition.current.onend = () => {
        if (!isSpeaking) setStatus("disconnected");
      };

      try {
        recognition.current.start();
      } catch (e) {
        console.error("Mic start failed", e);
        setStatus("disconnected");
      }
    }
  };

  const endSession = async () => {
    setStatus("disconnected");
    if (recognition.current) recognition.current.stop();
  };

  const cancelSpeech = () => {
    // Abort any ongoing fetch requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Stop audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    // Stop browser synthesis
    window.speechSynthesis.cancel();

    setIsSpeaking(false);
    setIsThinking(false);
  };

  const processMockResponse = async (text) => {
    // Create new AbortController for this request sequence
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const lower = text.toLowerCase();
    let response = "";

    if (lower.includes("search for")) {
      const query = text.replace(/search for/i, "").trim();
      clientTools.set_search_query({ query });
      response = `Searching for ${query}.`;
    } else if (
      lower.includes("calculate route") ||
      lower.includes("plan trip") ||
      lower.includes("predict eta")
    ) {
      clientTools.predict_eta();
      response =
        "Calculating the smartest route based on current traffic flow.";
    } else if (
      (lower.includes("navigation") || lower.includes("start nav")) &&
      clientTools.navigate_page
    ) {
      clientTools.navigate_page({ page: "navigation" });
      response = "Starting navigation mode.";
    } else if (
      (lower.includes("map") ||
        lower.includes("home") ||
        lower.includes("dashboard")) &&
      clientTools.navigate_page
    ) {
      clientTools.navigate_page({ page: "dashboard" });
      response = "Going to dashboard.";
    } else if (lower.includes("train") || lower.includes("schedule")) {
      // Extract train number or station name from the command
      let searchQuery = "";

      // Try to extract train number (digits)
      const trainNumberMatch = text.match(/(\d{4,5})/); // Match 4-5 digit train numbers
      if (trainNumberMatch) {
        searchQuery = trainNumberMatch[1];
        console.log("🚂 Extracted train number:", searchQuery);
      } else {
        // Extract station name - remove common words
        const cleanText = text
          .replace(/show me|schedules for|schedules of|at|station|train/gi, "")
          .trim();
        searchQuery = cleanText;
        console.log("🚉 Extracted station name:", searchQuery);
      }

      // Set the search query and navigate
      if (searchQuery && clientTools.search_train_by_number) {
        clientTools.search_train_by_number({ train_number: searchQuery });
        response = searchQuery.match(/^\d+$/)
          ? `Searching for train ${searchQuery}.`
          : `Showing schedules for ${searchQuery} station.`;
      } else {
        clientTools.get_train_status();
        response = "Opening trains schedule.";
      }
    } else if (
      lower.includes("open transport") ||
      lower.includes("transport page") ||
      lower.includes("show transport")
    ) {
      if (clientTools.navigate_page) {
        clientTools.navigate_page({ page: "transport" });
        response = "Opening transport navigation.";
      }
    } else if (lower.includes("weather")) {
      clientTools.get_weather();
      response = "Checking the live weather forecast.";
    } else if (
      lower.includes("emergency") ||
      lower.includes("ambulance") ||
      lower.includes("help")
    ) {
      clientTools.get_ambulance_eta();
      response = "Emergency mode activated. Ambulance dispatched.";
    } else if (
      lower.includes("set source") ||
      lower.includes("source as") ||
      lower.includes("source to")
    ) {
      const locationMatch = text.match(
        /(?:set source|source)(?:\s+as|\s+to|\s+is)?\s+(.+)/i,
      );
      if (locationMatch && clientTools.set_source_location) {
        const locationName = locationMatch[1].trim();
        response = clientTools.set_source_location({
          location_name: locationName,
        });
      } else {
        response = "Please specify a location for the source.";
      }
    } else if (
      lower.includes("set destination") ||
      lower.includes("destination as") ||
      lower.includes("destination to")
    ) {
      const locationMatch = text.match(
        /(?:set destination|destination)(?:\s+as|\s+to|\s+is)?\s+(.+)/i,
      );
      if (locationMatch && clientTools.set_destination_location) {
        const locationName = locationMatch[1].trim();
        response = clientTools.set_destination_location({
          location_name: locationName,
        });
      } else {
        response = "Please specify a location for the destination.";
      }
    } else if (lower.includes("go to airport") || lower.includes("airport page") || lower.includes("open airport")) {
      if (clientTools.navigate_page) {
        clientTools.navigate_page({ page: "airport" });
        response = "Opening airport page. You can track flights and view airport boards here.";
      }
    } else if (lower.includes("enable ar") || lower.includes("start ar")) {
      clientTools.set_ar_mode({ enabled: true });
      response = "AR mode enabled.";
    } else if (lower.includes("disable ar") || lower.includes("stop ar")) {
      clientTools.set_ar_mode({ enabled: false });
      response = "AR mode disabled.";
    }

    if (!response) {
      try {
        setIsThinking(true);
        // Updated prompt to enforce brevity for speed
        const prompt = `You are Aria, an advanced Indian AI for Transport & Medical Emergency. User location is Bengaluru/India.
User input: "${text}".
INSTRUCTIONS:
1. IF MEDICAL EMERGENCY:
   - Provide highly detailed, step-by-step first aid tips optimized for Indian conditions.
   - Format this response into TWO parts separated by "---":
     Part 1 (Before "---"): A brief spoken summary under 15 words to keep voice synthesis fast (e.g., "The ambulance is on the way. I have loaded first-aid steps on your screen.").
     Part 2 (After "---"): A detailed, bulleted first-aid instructions list for the screen using **bold headers** for each step.
2. GENERAL:
   - Keep response under 15 words without "---".`;

        const genRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
            signal: signal, // Pass signal to fetch
          },
        );

        if (signal.aborted) return; // Exit if aborted

        const data = await genRes.json();
        response =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          "I couldn't process that.";
      } catch (e) {
        if (e.name === "AbortError") {
          console.log("Gemini request aborted");
          return;
        }
        response = "I'm having trouble connecting right now.";
      }
    }

    if (signal.aborted) return; // Exit if aborted

    let displayMessage = response;
    let speechText = response;

    if (response.includes("---")) {
      const parts = response.split("---");
      speechText = parts[0].trim();
      displayMessage = parts[1].trim();
    } else if (response.includes("**")) {
      // Extract only bold headings to speak them concisely
      const boldItems = [];
      const matches = response.matchAll(/\*\*([\s\S]*?)\*\*/g);
      for (const match of matches) {
        boldItems.push(match[1]);
      }
      if (boldItems.length > 0) {
        speechText = "The ambulance is on the way. Key actions: " + boldItems.join(". ") + ".";
      }
    }

    setIsSpeaking(true);
    onMessage({ source: "ai", message: displayMessage });

    // Clean text for speech
    speechText = speechText.replace(/[\*#_\[\]]/g, "").replace(/\n/g, ". ");

    await playAudioData(speechText, signal);
    if (!signal.aborted) setIsThinking(false);
  };

  // --- AUDIO PLAYBACK LOGIC ---
  const playAudioData = async (text, signal) => {
    // Stop any previous audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // OPTION 1: Use ElevenLabs if Key is provided
    if (ELEVEN_LABS_API_KEY) {
      try {
        console.log("Attempting ElevenLabs TTS...");
        // Use Turbo v2.5 for lowest latency & MP3_22050_32 for smallest size
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_LABS_VOICE_ID}?optimize_streaming_latency=4&output_format=mp3_22050_32`,
          {
            method: "POST",
            headers: {
              "xi-api-key": ELEVEN_LABS_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: text,
              model_id: "eleven_turbo_v2_5", // Fastest model
              voice_settings: { stability: 0.1, similarity_boost: 0.1 }, // Lower stability for speed
            }),
            signal: signal,
          },
        );

        if (signal && signal.aborted) return;

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`ElevenLabs API Error: ${response.status} ${errorText}`);
          // Fallthrough to Gemini if ElevenLabs fails (e.g. quota limit)
        } else {
          const blob = await response.blob();
          const audio = new Audio(URL.createObjectURL(blob));
          audioRef.current = audio;
          audio.onended = () => {
            setIsSpeaking(false);
            setStatus("disconnected");
          };
          audio.onerror = (e) => {
            console.error("Audio playback error", e);
            setIsSpeaking(false);
            setStatus("disconnected");
          };
          await audio.play();
          return;
        }
      } catch (e) {
        if (e.name === "AbortError") return;
        console.warn("ElevenLabs Failed, falling back to Gemini", e);
      }
    }

    // OPTION 2: Use Gemini TTS (High Quality, No Key Needed for Preview)
    try {
      console.log("Attempting Gemini TTS...");
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: text }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
              },
            },
          }),
          signal: signal,
        },
      );

      if (signal && signal.aborted) return;

      if (!response.ok) throw new Error("Gemini API Error");

      const data = await response.json();
      const base64Audio =
        data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const arrayBuffer = base64ToArrayBuffer(base64Audio);
        // Wrap raw PCM in WAV header so browsers can play it natively
        const wavBuffer = pcmToWav(arrayBuffer);
        const blob = new Blob([wavBuffer], { type: "audio/wav" });
        const audio = new Audio(URL.createObjectURL(blob));
        audioRef.current = audio;
        audio.onended = () => {
          setIsSpeaking(false);
          setStatus("disconnected");
        };
        await audio.play();
        return;
      }
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("Gemini TTS Failed", e);
    }

    // OPTION 3: Browser Fallback
    if (!signal || !signal.aborted) {
      console.log("Falling back to Browser TTS");
      const u = new SpeechSynthesisUtterance(text);
      u.onend = () => {
        setIsSpeaking(false);
        setStatus("disconnected");
      };
      window.speechSynthesis.speak(u);
    }
  };

  const handleTextSubmit = (text) => {
    onMessage({ source: "user", message: text });
    processMockResponse(text);
  };

  return {
    status,
    isSpeaking,
    isThinking,
    startSession,
    endSession,
    handleTextSubmit,
    cancelSpeech,
  };
};

// --- HELPER COMPONENTS ---
const GlassPanel = ({ children, className = "", onClick, onPointerDown }) => (
  <div
    onPointerDown={onPointerDown}
    onClick={onClick}
    className={`backdrop-blur-xl bg-white/90 dark:bg-black/80 border border-white/20 dark:border-white/10 shadow-2xl rounded-2xl ${className}`}
  >
    {children}
  </div>
);

const NavButton = ({ icon: Icon, label, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all ${active ? "bg-black/5 dark:bg-white/10 scale-105" : "hover:bg-black/5 hover:dark:bg-white/10"}`}
  >
    <Icon
      className={`w-6 h-6 mb-1 ${active ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300 opacity-80"}`}
    />
    <span
      className={`text-[10px] font-bold ${active ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-300 opacity-80"}`}
    >
      {label}
    </span>
  </button>
);

const WeatherOverlay = ({ condition }) => {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const duration =
      typeof condition === "string" && condition.includes("cloud")
        ? 5000
        : 4000;
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [condition]);

  if (!visible) return null;
  const conditionStr =
    (typeof condition === "string" ? condition : condition?.condition) || "";
  const lowerCond = conditionStr.toLowerCase();

  const isRain = lowerCond.includes("rain") || lowerCond.includes("drizzle");
  const isClear = lowerCond.includes("clear") || lowerCond.includes("sun");
  const isThunder =
    lowerCond.includes("thunder") || lowerCond.includes("storm");
  const isCloudy =
    lowerCond.includes("cloud") ||
    lowerCond.includes("overcast") ||
    lowerCond.includes("mist") ||
    lowerCond.includes("haze");

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`absolute inset-0 ${isThunder ? "bg-black/60" : "bg-black/20"} backdrop-blur-sm`}
      />
      {isClear && (
        <>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-400/40 rounded-full blur-[80px]"
          />
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`ray-${i}`}
              initial={{ opacity: 0, rotate: i * 30, scaleY: 0.5 }}
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scaleY: [1, 1.2, 1],
                rotate: i * 30 + 10,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
              className="absolute top-0 left-1/2 w-20 h-[120vh] -ml-10 origin-top bg-gradient-to-b from-yellow-200/20 to-transparent"
              style={{ transformOrigin: "top center" }}
            />
          ))}
        </>
      )}
      {isRain &&
        [...Array(100)].map((_, i) => (
          <motion.div
            key={`rain-${i}`}
            initial={{
              y: -100,
              x: Math.random() * window.innerWidth,
              opacity: 0,
            }}
            animate={{ y: window.innerHeight + 100, opacity: 0.7 }}
            transition={{
              duration: 0.5 + Math.random() * 0.5,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 2,
            }}
            className="absolute w-0.5 h-6 bg-blue-300/80 shadow-[0_0_5px_rgba(147,197,253,0.5)]"
          />
        ))}
      {isThunder && (
        <>
          {[...Array(80)].map((_, i) => (
            <motion.div
              key={`stormrain-${i}`}
              initial={{ y: -100, x: Math.random() * window.innerWidth }}
              animate={{ y: window.innerHeight + 100 }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random(),
              }}
              className="absolute w-0.5 h-10 bg-gray-400/50"
            />
          ))}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0, 0.4, 0] }}
            transition={{
              duration: 0.4,
              repeat: Infinity,
              repeatDelay: 3 + Math.random() * 2,
            }}
            className="absolute inset-0 bg-white/30 mix-blend-overlay"
          />
          <motion.div
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 4 }}
            className="absolute top-0 left-1/2 -ml-32 w-64 h-full pointer-events-none"
          >
            {" "}
            <svg
              viewBox="0 0 100 200"
              className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
            >
              {" "}
              <path
                d="M50,0 L20,80 L60,80 L30,160 L90,60 L50,60 Z"
                fill="white"
              />{" "}
            </svg>{" "}
          </motion.div>
        </>
      )}
      {isCloudy && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`cloud-${i}`}
              initial={{
                x: i % 2 === 0 ? -300 : window.innerWidth + 300,
                y: Math.random() * (window.innerHeight / 2),
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                x: i % 2 === 0 ? window.innerWidth + 300 : -300,
                opacity: [0, 0.9, 0],
                scale: 1.2,
              }}
              transition={{
                duration: 15,
                ease: "linear",
                repeat: Infinity,
                delay: i * 2,
              }}
              className="absolute w-[600px] h-[300px] bg-white/30 rounded-[100%] blur-[80px]"
            />
          ))}
          <div className="absolute inset-0 bg-gray-500/10 mix-blend-multiply" />
        </>
      )}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="z-20 bg-black/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex flex-col items-center shadow-2xl"
      >
        <div className="text-5xl mb-2 filter drop-shadow-lg">
          {isRain || isThunder ? "⛈️" : isClear ? "☀️" : "☁️"}
        </div>
        <div className="text-3xl font-bold text-white tracking-tighter filter drop-shadow-md">
          {condition?.temp || "28°C"}
        </div>
        <div className="text-sm text-blue-100 font-medium uppercase tracking-widest">
          {condition?.condition || "Mist"}
        </div>
      </motion.div>
    </div>
  );
};

// --- CONSTANTS ---
const RAILWAY_STATIONS = [
  { name: "KSR Bengaluru (SBC)", code: "SBC", lat: 12.9781, lng: 77.5696 },
  {
    name: "Yesvantpur Junction (YPR)",
    code: "YPR",
    lat: 13.0237,
    lng: 77.5503,
  },
  { name: "SMVT Bengaluru (SMVT)", code: "SMVB", lat: 12.9868, lng: 77.6534 },
  { name: "Whitefield (WFD)", code: "WFD", lat: 12.9698, lng: 77.7499 },
  { name: "Cantonment (BNC)", code: "BNC", lat: 12.9936, lng: 77.598 },
  { name: "Kengeri (KGI)", code: "KGI", lat: 12.9069, lng: 77.4764 },
  { name: "Krishnarajapuram (KJM)", code: "KJM", lat: 13.0005, lng: 77.6757 },
];
const MOCK_HOSPITALS = [
  {
    name: "Manipal Hospital (Simulated)",
    lat: 12.9592,
    lng: 77.6432,
    dist: "1.2 km",
  },
  {
    name: "Apollo Hospital (Simulated)",
    lat: 12.9692,
    lng: 77.5973,
    dist: "3.5 km",
  },
];
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
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
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
];

// --- FORMATTED MESSAGE RENDERER ---
const renderFormattedMessage = (text) => {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="space-y-2 font-sans leading-relaxed text-xs sm:text-sm">
      {lines.map((line, idx) => {
        let cleanLine = line.trim();
        if (!cleanLine) return <div key={idx} className="h-1.5" />;

        // Check if it is a list or bullet point
        const isBullet = cleanLine.startsWith("-") || cleanLine.startsWith("*");
        if (isBullet) {
          cleanLine = cleanLine.substring(1).trim();
        }

        // Replace bold **text** with standard JSX <strong> tags
        const parts = cleanLine.split(/\*\*([\s\S]*?)\*\*/g);
        const renderedText = parts.map((part, pIdx) => {
          if (pIdx % 2 === 1) {
            return (
              <strong key={pIdx} className="font-extrabold text-red-400 dark:text-red-400">
                {part}
              </strong>
            );
          }
          return part;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 text-gray-300 ml-1">
              <span className="text-red-500 mt-1 select-none text-[8px] sm:text-[10px]">🔴</span>
              <span className="flex-1 text-gray-200">{renderedText}</span>
            </div>
          );
        }

        // If it starts with a number (e.g. "1. ")
        const numMatch = cleanLine.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          const num = numMatch[1];
          const rest = numMatch[2];
          const restParts = rest.split(/\*\*([\s\S]*?)\*\*/g).map((part, pIdx) => {
            if (pIdx % 2 === 1) {
              return (
                <strong key={pIdx} className="font-extrabold text-red-400 dark:text-red-400">
                  {part}
                </strong>
              );
            }
            return part;
          });
          return (
            <div key={idx} className="flex items-start gap-2 text-gray-200 mt-1">
              <span className="flex items-center justify-center bg-red-600/20 text-red-400 border border-red-500/30 rounded-full w-4.5 h-4.5 text-[9px] sm:text-[11px] font-bold shrink-0 mt-0.5">
                {num}
              </span>
              <span className="flex-1 text-gray-100">{restParts}</span>
            </div>
          );
        }

        return (
          <div key={idx} className="text-gray-200">
            {renderedText}
          </div>
        );
      })}
    </div>
  );
};

// --- SUB-COMPONENTS ---
const VoiceAssistant = ({
  setSearchQuery,
  setArEnabled,
  setInputs,
  isEmergency,
  ambulanceEta,
  setShowEmergencySystem,
  setViewMode,
  setVoiceTrainQuery,
  calculateRoute,
  fetchRealtimeWeather,
  triggerSession,
  handleAddToSource,
  handleAddToDestination,
  placesService,
  google,
  userLocation,
  showStatus,
}) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [conversationText, setConversationText] = useState([]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  const conversation = useConversation({
    onMessage: (message) => setConversationText((prev) => [...prev, message]),
    clientTools: {
      set_search_query: ({ query }) => {
        setSearchQuery(query);
        return `Okay, searching for ${query}.`;
      },
      set_ar_mode: ({ enabled }) => {
        setArEnabled(enabled);
        return `AR Mode ${enabled ? "enabled" : "disabled"}.`;
      },
      predict_eta: () => {
        if (typeof calculateRoute === "function") calculateRoute();
        return "Calculating the best route based on current traffic.";
      },
      get_train_status: () => {
        setViewMode("trains");
        return "Opening trains schedule.";
      },
      search_train_by_number: ({ train_number }) => {
        setViewMode("trains");
        setVoiceTrainQuery(train_number); // Pass train number to TrainsPage
        return `Searching for train ${train_number}.`;
      },
      search_train_station: ({ station_name }) => {
        setViewMode("trains");
        setVoiceTrainQuery(station_name); // Pass station name to TrainsPage
        return `Showing schedules for ${station_name} station.`;
      },
      get_weather: () => {
        fetchRealtimeWeather();
        return "Checking the live weather forecast.";
      },
      get_ambulance_eta: () => {
        setShowEmergencySystem(true);
        return `Emergency protocol initiated. Ambulance is ${ambulanceEta} mins away. Green corridor active.`;
      },
      navigate_page: ({ page }) => {
        setViewMode(page);
        return `Opening ${page} view.`;
      },
      set_source_location: ({ location_name }) => {
        console.log("🎯 set_source_location called with:", location_name);

        // Set the source input
        setInputs((prev) => ({ ...prev, start: location_name }));

        // Geocode and create marker immediately
        if (placesService && google) {
          const request = {
            query: location_name,
            locationBias: userLocation || { lat: 12.9716, lng: 77.5946 },
            fields: ["name", "geometry", "formatted_address", "place_id"],
          };

          placesService.findPlaceFromQuery(request, (results, status) => {
            console.log("📍 Places API response for source:", status, results);
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              results &&
              results[0]
            ) {
              const place = results[0];
              const location = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };
              console.log("✅ Creating source marker at:", location);
              handleAddToSource(place, location);
              if (showStatus)
                showStatus(`Source marker placed at ${place.name}`, "success");
            } else {
              console.error("❌ Failed to find source location:", status);
            }
          });
        }

        return `Okay, source set to ${location_name}.`;
      },
      set_destination_location: ({ location_name }) => {
        console.log("🎯 set_destination_location called with:", location_name);

        // Set the destination input
        setInputs((prev) => ({ ...prev, end: location_name }));

        // Geocode and create marker immediately
        if (placesService && google) {
          const request = {
            query: location_name,
            locationBias: userLocation || { lat: 12.9716, lng: 77.5946 },
            fields: ["name", "geometry", "formatted_address", "place_id"],
          };

          placesService.findPlaceFromQuery(request, (results, status) => {
            console.log(
              "📍 Places API response for destination:",
              status,
              results,
            );
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              results &&
              results[0]
            ) {
              const place = results[0];
              const location = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };
              console.log("✅ Creating destination marker at:", location);
              handleAddToDestination(place, location);
              if (showStatus)
                showStatus(
                  `Destination marker placed at ${place.name}`,
                  "success",
                );
            } else {
              console.error("❌ Failed to find destination location:", status);
            }
          });
        }

        return `Okay, destination set to ${location_name}. Would you like me to calculate the route?`;
      },
    },
  });

  const {
    status,
    isSpeaking,
    isThinking,
    startSession,
    endSession,
    handleTextSubmit,
    cancelSpeech,
  } = conversation;

  useEffect(() => {
    if (triggerSession > 0) {
      setChatOpen(true);
      startSession();
    }
  }, [triggerSession]);

  useEffect(() => {
    if (isEmergency) {
      setChatOpen(true);
      setConversationText([]);
      startSession();
    }
  }, [isEmergency]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationText]);

  const handleMicClick = () => {
    if (isSpeaking) {
      cancelSpeech();
    } else if (status === "connected") {
      endSession();
    } else {
      startSession();
    }
  };

  const onSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleTextSubmit(inputText);
    setInputText("");
  };

  if (isEmergency && chatOpen) {
    return (
      <motion.div
        drag
        dragMomentum={false}
        className="fixed bottom-4 right-4 w-[90vw] md:w-96 h-[500px] bg-gray-950 border border-red-500/60 rounded-2xl shadow-2xl flex flex-col z-[9999] font-sans overflow-hidden"
      >
        <div className="bg-red-600 p-4 flex justify-between items-center text-white shadow-lg cursor-move">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 animate-pulse" />
            <div>
              <h3 className="font-bold text-sm">Aria Medical AI</h3>
              <p className="text-[11px] opacity-90">ETA: {ambulanceEta} mins</p>
            </div>
          </div>
          <button
            onClick={() => setChatOpen(false)}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 bg-gray-900 p-4 overflow-y-auto space-y-4 cursor-default">
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-200 p-3 rounded-2xl rounded-tl-none border border-gray-700 text-sm max-w-[85%]">
              I'm Aria. Help is on the way. Tell me: Is there heavy bleeding,
              burns, or chest pain?
            </div>
          </div>
          {conversationText.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.source === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.source === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-gray-800 text-gray-200 rounded-tl-none"}`}
              >
                {msg.source === "ai" ? renderFormattedMessage(msg.message) : msg.message}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-gray-950 border-t border-gray-800 cursor-default">
          <form onSubmit={onSend} className="flex gap-2">
            <button
              type="button"
              onClick={handleMicClick}
              className={`p-3 rounded-full ${isSpeaking ? "bg-red-600" : status === "connected" ? "bg-red-500 text-white" : "bg-gray-700 text-gray-400"}`}
            >
              {isSpeaking ? (
                <Square className="w-5 h-5 fill-white text-white" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type emergency..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-full px-4 text-sm text-white"
            />
            <button
              type="submit"
              className="p-3 bg-blue-600 rounded-full text-white"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed bottom-10 right-24 z-[100] flex flex-col items-end gap-2 cursor-grab active:cursor-grabbing"
    >
      {status === "connected" && !isEmergency && (
        <div className="bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full mb-2 text-xs font-medium border border-white/10 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>{" "}
          {isSpeaking ? "Aria Speaking..." : "Listening..."}
        </div>
      )}

      {/* NEW ARIA CHAT BUTTON */}
      <AriaChatButton
        onClick={() => setChatOpen(!chatOpen)}
        isActive={status === "connected"}
        isThinking={isThinking}
      />

      {chatOpen && !isEmergency && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute bottom-16 right-0 w-80 h-96 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="p-3 bg-gray-800 flex justify-between items-center border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" /> Aria Assistant
            </h3>
            <button onClick={() => setChatOpen(false)}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            <div className="flex justify-start">
              <div className="bg-gray-800 p-2 rounded-lg rounded-tl-none text-xs text-gray-300">
                Hi! I can help with navigation, weather, or medical questions.
              </div>
            </div>
            {conversationText.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.source === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`p-2 rounded-lg text-xs max-w-[85%] ${msg.source === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-gray-800 text-gray-300 rounded-tl-none"}`}
                >
                  {msg.source === "ai" ? renderFormattedMessage(msg.message) : msg.message}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-2 border-t border-white/5 bg-gray-800">
            <form onSubmit={onSend} className="flex gap-2">
              <button
                type="button"
                onClick={handleMicClick}
                className={`p-2 rounded-full ${isSpeaking ? "bg-red-600" : status === "connected" ? "bg-red-500 text-white" : "bg-gray-700 text-gray-400"}`}
              >
                {isSpeaking ? (
                  <Square className="w-4 h-4 fill-white text-white" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
              <input
                className="flex-1 bg-gray-900 rounded-full px-3 text-xs text-white border border-gray-700 outline-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Aria..."
              />
              <button
                type="submit"
                className="p-3 bg-blue-600 rounded-full text-white"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const EmergencySystem = ({
  userLocation,
  currentAddress,
  onClose,
  isVisible,
  onEmergencyStart,
  authUser,
  onUpdateLocation,
  placesService,
}) => {
  const [step, setStep] = useState("idle");
  const [nearestHospital, setNearestHospital] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editedAddress, setEditedAddress] = useState(currentAddress);

  useEffect(() => {
    if (isVisible && step === "idle") setStep("verify");
    setEditedAddress(currentAddress);
  }, [isVisible, currentAddress]);

  // -- RESTORED GEMINI HOSPITAL SEARCH LOGIC --
  const findHospitalWithGemini = async () => {
    const keyToUse = apiKey;
    const prompt = `I am at Lat: ${userLocation.lat}, Lng: ${userLocation.lng}. Address: "${editedAddress || currentAddress}". Identify the single NEAREST operational major hospital. Return ONLY a JSON object: {"name": string, "lat": number, "lng": number}. No markdown explanation.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${keyToUse}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          }),
        },
      );

      if (!response.ok) throw new Error("Gemini API Error");
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty response");

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      return JSON.parse(jsonMatch[0].trim());
    } catch (error) {
      console.warn("Gemini Search Failed (Switching to Simulation):", error);
      throw error;
    }
  };

  const handleConfirmEmergency = async () => {
    if (!userLocation) return;
    setIsSearching(true);

    // Use Gemini for REAL data first
    try {
      const hospitalData = await findHospitalWithGemini();

      // REAL DATA SUCCESS
      const realLoc = { lat: hospitalData.lat, lng: hospitalData.lng };
      setNearestHospital({
        name: hospitalData.name,
        lat: realLoc.lat,
        lng: realLoc.lng,
        dist: "Nearby",
      });
      triggerEmergency(realLoc, hospitalData.name);
    } catch (error) {
      // Fallback only if Gemini fails
      useSimulatedHospital();
    }
  };

  const useSimulatedHospital = () => {
    // Small delay just to show "searching" UI briefly so user knows something happened
    setTimeout(() => {
      setNearestHospital(MOCK_HOSPITALS[0]);
      triggerEmergency(
        { lat: MOCK_HOSPITALS[0].lat, lng: MOCK_HOSPITALS[0].lng },
        MOCK_HOSPITALS[0].name,
      );
    }, 1000);
  };

  const triggerEmergency = async (destLoc, hospitalName) => {
    if (onEmergencyStart)
      onEmergencyStart({
        origin: userLocation,
        destination: destLoc,
        hospitalName: hospitalName,
      });

    try {
      const collectionPath = `artifacts/${appId}/public/data/emergency_alerts`;
      const payload = {
        userId: authUser ? authUser.uid : `anon-${Date.now()}`,
        status: "ACTIVE",
        timestamp: serverTimestamp(),
        location: userLocation,
        address: editedAddress || "Unknown Location",
        nearestHospital: hospitalName,
        type: "MEDICAL_EMERGENCY",
      };
      if (authUser) {
        await addDoc(collection(db, ...collectionPath.split("/")), payload);
      }
    } catch (e) {
      console.error("Firebase Write Failed:", e);
    }

    setIsSearching(false);
    setStep("active");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end sm:justify-center items-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
          />
          {step === "verify" && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="relative w-full max-w-md bg-[#1a1a1a] border border-red-500/30 rounded-2xl p-6 shadow-2xl pointer-events-auto"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                  <MapPin className="text-red-500 w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Confirm Emergency Location
                  </h2>
                </div>
                <div className="w-full bg-white/5 rounded-xl p-4 text-left border border-white/10">
                  {isEditingLocation ? (
                    <div className="flex gap-2">
                      <input
                        className="bg-black/50 border border-blue-500 rounded p-1 text-white w-full"
                        value={editedAddress}
                        onChange={(e) => setEditedAddress(e.target.value)}
                      />
                      <button
                        onClick={() => {
                          setIsEditingLocation(false);
                          if (onUpdateLocation) onUpdateLocation(editedAddress);
                        }}
                      >
                        <Save className="text-green-500" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-bold">{editedAddress}</p>
                      </div>
                      <button onClick={() => setIsEditingLocation(true)}>
                        <Edit3 className="text-blue-400 w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={onClose}
                    className="py-3 bg-white/10 rounded-xl text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmEmergency}
                    className="py-3 bg-red-600 rounded-xl text-white font-bold flex justify-center items-center gap-2"
                  >
                    {/* CUSTOM LOADER USED HERE */}
                    {isSearching ? (
                      <CustomLoader scale={0.4} />
                    ) : (
                      "YES, HELP ME"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          {step === "active" && (
            <motion.div className="relative w-full max-w-lg bg-black/90 border border-red-500 rounded-2xl p-6 shadow-2xl pointer-events-auto">
              <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Siren className="text-red-500 animate-spin" /> AMBULANCE
                DISPATCHED
              </h1>
              <div className="space-y-2 text-gray-300 text-sm">
                <p>Green corridor enabled.</p>
                <p>Nearest Hospital: {nearestHospital?.name}</p>
                <p>Driver: Rajesh Kumar (KA-05-EM-2024)</p>
              </div>
              <div className="mt-4 bg-red-900/20 p-3 rounded border border-red-500/30">
                <p className="text-red-300 font-bold text-xs uppercase mb-1">
                  Aria First Aid Tip:
                </p>
                <p className="text-white text-sm">
                  Stay calm. Call India's Emergency Response Service at <strong>108</strong> immediately. If bleeding, apply firm pressure. Keep airway clear. Do not move patient if neck/spinal injury suspected.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-6 w-full py-3 bg-white/10 rounded-lg text-white"
              >
                Minimize (Tracking Active)
              </button>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

const DashboardPage = ({
  showPlanner,
  setShowPlanner,
  searchQuery,
  handleSearchInput,
  setSearchQuery,
  setSuggestions,
  suggestions,
  showSuggestions,
  handleSelectSuggestion,
  eta,
  distance,
  isEmergencyActive,
  showEmergencySystem,
  setShowEmergencySystem,
  inputs,
  setInputs,
  attemptLocationFetch,
  isLoadingLocation,
  calculateRoute,
  handleClear,
  fetchRealtimeWeather,
  isFetchingWeather,
  showWeather,
  weatherData,
  setShowWeather,
  mapType,
  setMapType,
  isTrafficOn,
  setIsTrafficOn,
  isDarkMode,
  setIsDarkMode,
  google,
  map,
  startVoiceSession,
  commuteInsight,
  isFetchingInsight,
  fetchCommuteInsight,
}) => {
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedSourceMarker, setSelectedSourceMarker] = useState(null);
  const [selectedDestMarker, setSelectedDestMarker] = useState(null);
  const [customInfoWindow, setCustomInfoWindow] = useState(null);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    if (searchQuery && searchQuery.length > 3 && !showSuggestions && !eta) {
      handleSearchInput({ target: { value: searchQuery } });
    }
  }, [searchQuery]);

  // Add map click listener for enhanced place selection
  useEffect(() => {
    if (!map || !google) return;

    // Disable default double-click zoom to prevent conflicts
    map.setOptions({ disableDoubleClickZoom: true });

    const clickListener = map.addListener("click", (event) => {
      // Close previous info window
      if (customInfoWindow) customInfoWindow.close();

      // Check if a place was clicked (has placeId)
      if (event.placeId) {
        event.stop(); // Prevent default info window

        const service = new google.maps.places.PlacesService(map);
        service.getDetails({ placeId: event.placeId }, (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            showEnhancedInfoWindow(place, place.geometry.location);
          }
        });
      }
    });

    return () => {
      google.maps.event.removeListener(clickListener);
      map.setOptions({ disableDoubleClickZoom: false });
    };
  }, [map, google, customInfoWindow, isDarkMode]);

  const showEnhancedInfoWindow = (place, location) => {
    const infoWindow = new google.maps.InfoWindow({
      content: `
                <style>
                    .gm-style .gm-style-iw-c { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
                    .gm-style .gm-style-iw-d { overflow: visible !important; }
                    .gm-style .gm-style-iw-t::after { display: none !important; }
                </style>
                <div style="
                    background: ${isDarkMode ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)"};
                    border: 2px solid #3b82f6;
                    border-radius: 16px;
                    padding: 16px;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(59, 130, 246, 0.3);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    min-width: 280px;
                ">
                    <div style="font-weight: 700; font-size: 16px; color: ${isDarkMode ? "#fff" : "#1f2937"}; margin-bottom: 8px;">
                        ${place.name}
                    </div>
                    <div style="font-size: 13px; color: ${isDarkMode ? "#9ca3af" : "#6b7280"}; margin-bottom: 16px;">
                        ${place.formatted_address || place.vicinity || ""}
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button id="add-to-source" style="
                            flex: 1;
                            padding: 10px 16px;
                            background: linear-gradient(135deg, #10b981, #059669);
                            color: white;
                            border: none;
                            border-radius: 10px;
                            font-weight: 600;
                            font-size: 13px;
                            cursor: pointer;
                            transition: all 0.2s;
                            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            Add to Source
                        </button>
                        <button id="add-to-dest" style="
                            flex: 1;
                            padding: 10px 16px;
                            background: linear-gradient(135deg, #3b82f6, #2563eb);
                            color: white;
                            border: none;
                            border-radius: 10px;
                            font-weight: 600;
                            font-size: 13px;
                            cursor: pointer;
                            transition: all 0.2s;
                            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            Add to Destination
                        </button>
                    </div>
                </div>
            `,
      position: location,
    });

    infoWindow.open(map);
    setCustomInfoWindow(infoWindow);

    // Add button click listeners after a short delay to ensure DOM is ready
    setTimeout(() => {
      const sourceBtn = document.getElementById("add-to-source");
      const destBtn = document.getElementById("add-to-dest");

      if (sourceBtn) {
        sourceBtn.addEventListener("click", () => {
          handleAddToSource(place, location);
          infoWindow.close();
        });
      }

      if (destBtn) {
        destBtn.addEventListener("click", () => {
          handleAddToDestination(place, location);
          infoWindow.close();
        });
      }
    }, 100);
  };

  const handleAddToSource = (place, location) => {
    // Clear previous source marker
    if (selectedSourceMarker) selectedSourceMarker.setMap(null);

    // Create new source marker (green)
    const marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "#10b981",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 3,
      },
      label: {
        text: "S",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "14px",
      },
      zIndex: 1000,
    });

    // Add hover effect to source marker
    const hoverInfoWindow = new google.maps.InfoWindow({
      content: `
                <style>
                    .gm-style .gm-style-iw-c { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
                    .gm-style .gm-style-iw-d { overflow: visible !important; }
                    .gm-style .gm-style-iw-t::after { display: none !important; }
                    .gm-style-iw-chr { display: none !important; }
                    .gm-ui-hover-effect { display: none !important; }
                </style>
                <div style="
                    background: ${isDarkMode ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)"};
                    border: 2px solid #10b981;
                    border-radius: 12px;
                    padding: 12px 16px;
                    backdrop-filter: blur(12px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 20px rgba(16, 185, 129, 0.3);
                ">
                    <div style="font-weight: 700; font-size: 14px; color: ${isDarkMode ? "#fff" : "#1f2937"};">
                        Source: ${place.name}
                    </div>
                </div>
            `,
      disableAutoPan: true,
    });

    marker.addListener("mouseover", () => {
      hoverInfoWindow.open(map, marker);
    });

    marker.addListener("mouseout", () => {
      hoverInfoWindow.close();
    });

    setSelectedSourceMarker(marker);
    setInputs((prev) => ({ ...prev, start: place.name }));
  };

  const handleAddToDestination = (place, location) => {
    // Clear previous destination marker
    if (selectedDestMarker) selectedDestMarker.setMap(null);

    // Create new destination marker (blue)
    const marker = new google.maps.Marker({
      position: location,
      map: map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "#3b82f6",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 3,
      },
      label: {
        text: "D",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "14px",
      },
      zIndex: 1000,
    });

    // Add hover effect to destination marker
    const hoverInfoWindow = new google.maps.InfoWindow({
      content: `
                <style>
                    .gm-style .gm-style-iw-c { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
                    .gm-style .gm-style-iw-d { overflow: visible !important; }
                    .gm-style .gm-style-iw-t::after { display: none !important; }
                    .gm-style-iw-chr { display: none !important; }
                    .gm-ui-hover-effect { display: none !important; }
                </style>
                <div style="
                    background: ${isDarkMode ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)"};
                    border: 2px solid #3b82f6;
                    border-radius: 12px;
                    padding: 12px 16px;
                    backdrop-filter: blur(12px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 20px rgba(59, 130, 246, 0.3);
                ">
                    <div style="font-weight: 700; font-size: 14px; color: ${isDarkMode ? "#fff" : "#1f2937"};">
                        Destination: ${place.name}
                    </div>
                </div>
            `,
      disableAutoPan: true,
    });

    marker.addListener("mouseover", () => {
      hoverInfoWindow.open(map, marker);
    });

    marker.addListener("mouseout", () => {
      hoverInfoWindow.close();
    });

    setSelectedDestMarker(marker);
    setInputs((prev) => ({ ...prev, end: place.name }));
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        handleSelectSuggestion(
          suggestions[highlightedIndex].place_id,
          suggestions[highlightedIndex].description,
        );
      } else if (searchQuery && suggestions.length > 0) {
        handleSelectSuggestion(
          suggestions[0].place_id,
          suggestions[0].description,
        );
      }
    }
  };

  return (
    <>
      <motion.div
        drag
        dragMomentum={false}
        className="absolute top-16 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      >
        <div className="relative w-full max-w-xl pointer-events-auto">
          {(!isEmergencyActive || showEmergencySystem) && !eta && (
            <GlassPanel className="flex items-center px-2 py-2 space-x-2 shadow-xl z-50 cursor-move">
              <button
                onClick={() => setShowPlanner(!showPlanner)}
                className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors cursor-pointer"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <ArrowRightCircle
                  className={`w-6 h-6 text-blue-600 dark:text-blue-400 transform transition-transform duration-300 ${showPlanner ? "rotate-90" : "rotate-0"}`}
                />
              </button>
              <div className="flex-1 relative flex items-center bg-gray-100 dark:bg-white/5 rounded-lg px-2">
                <Search className="w-4 h-4 opacity-40 mr-2" />
                <input
                  type="text"
                  placeholder="Search places..."
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onKeyDown={handleKeyDown}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder-gray-500 text-gray-900 dark:text-white py-2"
                />
                <button
                  onClick={startVoiceSession}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="p-1.5 bg-blue-600/10 hover:bg-blue-600/20 rounded-full ml-1"
                >
                  <Mic className="w-4 h-4 text-blue-500" />
                </button>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestions([]);
                    }}
                    className="p-1 opacity-50 hover:opacity-100 ml-1"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </GlassPanel>
          )}

          {eta && !isEmergencyActive && (
            <GlassPanel className="flex items-center justify-between px-4 py-3 shadow-xl z-50 bg-blue-600/90 border-blue-400/30 text-white backdrop-blur-md">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowPlanner(!showPlanner)}
                  className="p-2 bg-white/20 rounded-lg"
                >
                  {showPlanner ? <ChevronUp /> : <ChevronDown />}
                </button>
                <div>
                  <p className="text-xs opacity-80 uppercase font-bold">
                    Est. Travel Time
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">{eta}</span>
                    <span className="text-sm opacity-80">({distance})</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </GlassPanel>
          )}

          {showSuggestions &&
            suggestions.length > 0 &&
            !eta &&
            !isEmergencyActive && (
              <GlassPanel className="absolute top-14 left-0 right-0 overflow-hidden shadow-2xl z-40">
                {suggestions.map((prediction, idx) => (
                  <div
                    key={prediction.place_id}
                    onClick={() =>
                      handleSelectSuggestion(
                        prediction.place_id,
                        prediction.description,
                      )
                    }
                    className={`px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-white/5 last:border-none flex items-center gap-3 ${idx === highlightedIndex ? "bg-blue-500/30" : "hover:bg-black/10 dark:hover:bg-white/10"}`}
                  >
                    <MapPin className="w-4 h-4 opacity-50" />
                    <div className="text-sm truncate">
                      <span className="font-bold">
                        {prediction.structured_formatting.main_text}
                      </span>
                      <span className="opacity-60 ml-1 text-xs">
                        {prediction.structured_formatting.secondary_text}
                      </span>
                    </div>
                  </div>
                ))}
              </GlassPanel>
            )}
        </div>
      </motion.div>

      {showPlanner && !isEmergencyActive && (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ x: 20, y: 100, opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute z-40 top-32"
        >
          <GlassPanel className="w-80 p-5 space-y-4 border-t-4 border-t-blue-500 shadow-2xl bg-white dark:bg-black cursor-move">
            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
              <h3 className="font-bold flex items-center gap-2">
                <Move className="w-4 h-4 opacity-50" /> Route Planner
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleClear}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="relative group">
                <div className="absolute left-3 top-3 w-2 h-2 rounded-full bg-green-500"></div>
                <input
                  value={inputs.start}
                  onChange={(e) =>
                    setInputs({ ...inputs, start: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      inputs.start.trim() &&
                      google &&
                      map
                    ) {
                      e.preventDefault();
                      console.log(
                        "🔑 Enter pressed on source field:",
                        inputs.start,
                      );
                      const service = new google.maps.places.PlacesService(map);
                      const request = {
                        query: inputs.start,
                        locationBias: { lat: 12.9716, lng: 77.5946 },
                        fields: [
                          "name",
                          "geometry",
                          "formatted_address",
                          "place_id",
                        ],
                      };
                      console.log("📍 Geocoding source:", request);
                      service.findPlaceFromQuery(request, (results, status) => {
                        console.log(
                          "✅ Source geocode result:",
                          status,
                          results,
                        );
                        if (
                          status ===
                          google.maps.places.PlacesServiceStatus.OK &&
                          results &&
                          results[0]
                        ) {
                          const place = results[0];
                          const location = {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng(),
                          };
                          console.log(
                            "🎯 Calling handleAddToSource with:",
                            place.name,
                            location,
                          );
                          handleAddToSource(place, location);
                          showStatus(
                            `Source marker placed at ${place.name}`,
                            "success",
                          );
                        } else {
                          console.error("❌ Failed to geocode source:", status);
                        }
                      });
                    }
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  type="text"
                  placeholder="Start"
                  className="w-full bg-white/10 rounded-lg py-2 pl-8 pr-8 text-sm outline-none"
                />
                <button
                  onClick={() => attemptLocationFetch(google, map, true)}
                  className="absolute right-2 top-2 p-1"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <LocateFixed className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="relative group">
                <div className="absolute left-3 top-3 w-2 h-2 rounded-full bg-red-500"></div>
                <input
                  value={inputs.end}
                  onChange={(e) =>
                    setInputs({ ...inputs, end: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      inputs.end.trim() &&
                      google &&
                      map
                    ) {
                      e.preventDefault();
                      const service = new google.maps.places.PlacesService(map);
                      const request = {
                        query: inputs.end,
                        locationBias: { lat: 12.9716, lng: 77.5946 },
                        fields: [
                          "name",
                          "geometry",
                          "formatted_address",
                          "place_id",
                        ],
                      };
                      service.findPlaceFromQuery(request, (results, status) => {
                        if (
                          status ===
                          google.maps.places.PlacesServiceStatus.OK &&
                          results &&
                          results[0]
                        ) {
                          const place = results[0];
                          const location = {
                            lat: place.geometry.location.lat(),
                            lng: place.geometry.location.lng(),
                          };
                          handleAddToDestination(place, location);
                          showStatus(
                            `Destination marker placed at ${place.name}`,
                            "success",
                          );
                        }
                      });
                    }
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  type="text"
                  placeholder="Destination"
                  className="w-full bg-white/10 rounded-lg py-2 pl-8 pr-3 text-sm outline-none"
                />
              </div>
              <div
                className="relative group"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <DateTimePicker
                  value={inputs.time ? new Date(inputs.time) : null}
                  onChange={(date) =>
                    setInputs((prev) => ({
                      ...prev,
                      time: date ? date.toISOString().slice(0, 16) : "",
                    }))
                  }
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={calculateRoute}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg active:scale-95"
              >
                <Navigation className="w-4 h-4" /> Go
              </button>
              <button
                onClick={fetchCommuteInsight}
                onPointerDown={(e) => e.stopPropagation()}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
            {isFetchingInsight && (
              <div className="text-xs text-gray-400 animate-pulse text-center">
                Analysing route...
              </div>
            )}
            {commuteInsight && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-3 bg-purple-900/40 border border-purple-500/30 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-purple-100 leading-relaxed">
                    {commuteInsight}
                  </p>
                </div>
              </motion.div>
            )}
          </GlassPanel>
        </motion.div>
      )}

      <div className="absolute bottom-24 right-4 z-50 flex flex-col items-center gap-3">
        {/* NEW EXPANDING WEATHER CARD */}
        <WeatherCard
          data={weatherData}
          onClick={fetchRealtimeWeather}
          isLoading={isFetchingWeather}
          isDarkMode={isDarkMode}
        />

        {/* CIRCULAR CONTROL BUTTONS (LAYERS & TRAFFIC) */}
        <ul className="example-2">
          {/* LAYERS BUTTON */}
          <li className="icon-content" data-type="layers">
            <button
              onClick={() =>
                setMapType((prev) =>
                  prev === "roadmap" ? "satellite" : "roadmap",
                )
              }
              aria-label="Map Layers"
            >
              <div className="filled" />
              <Layers className="w-6 h-6 text-gray-600 dark:text-gray-300 relative z-10" />
            </button>
            <div className="tooltip">
              {mapType === "roadmap"
                ? "Switch to Satellite"
                : "Switch to Roadmap"}
            </div>
          </li>

          {/* TRAFFIC BUTTON */}
          <li className="icon-content" data-type="traffic">
            <button
              onClick={() => setIsTrafficOn(!isTrafficOn)}
              aria-label="Traffic"
            >
              <div className="filled" />
              <Zap
                className={`w-6 h-6 relative z-10 ${isTrafficOn ? "text-yellow-500" : "text-gray-600 dark:text-gray-300"}`}
              />
            </button>
            <div className="tooltip">
              {isTrafficOn ? "Hide Traffic" : "Show Traffic"}
            </div>
          </li>
        </ul>

        {/* NO GLASSPANEL WRAPPER FOR SWITCH - FIXES "BOX" ISSUE */}
        <div className="mt-2">
          <ThemeSwitch isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
        </div>
      </div>
    </>
  );
};

const NavigationPage = ({
  arEnabled,
  setArEnabled,
  navigationComplete,
  arStatus,
  routeSteps,
  navStepIndex,
  handleNavStep,
  exitModes,
  panoRef,
}) => {
  // We use useDragControls to separate drag handle interaction from resizing
  const dragControls = useDragControls();

  return (
    <>
      <div className="absolute top-4 left-4 z-50 pointer-events-auto">
        {/* NEW CUSTOM BACK BUTTON */}
        <CustomBackButton onClick={() => exitModes(true)} />
      </div>
      {arEnabled && !navigationComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-0 left-0 right-0 h-[50vh] z-10 bg-black"
        >
          <div ref={panoRef} className="w-full h-full relative z-10" />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
            <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-green-500/50 text-green-400 font-mono text-xs">
              AR GUIDANCE ACTIVE
            </div>
          </div>
        </motion.div>
      )}
      {!navigationComplete && routeSteps.length > 0 && (
        <>
          {/* Draggable & Resizable Instructions Box */}
          <motion.div
            drag
            dragListener={false}
            dragControls={dragControls}
            dragMomentum={false}
            initial={{ x: "-50%" }}
            style={{
              left: "50%",
              position: "absolute",
              top: "1rem",
              zIndex: 40,
            }}
            className="pointer-events-auto"
          >
            <GlassPanel className="p-0 overflow-hidden bg-black/80 resize-both min-w-[280px] max-w-[90vw] flex flex-col">
              {/* Drag Handle Header */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="w-full h-6 bg-white/10 flex items-center justify-center cursor-move hover:bg-white/20 transition-colors"
              >
                <div className="w-12 h-1 bg-white/30 rounded-full"></div>
              </div>

              {/* Content */}
              <div className="p-5 pt-2">
                <div className="flex items-start gap-4">
                  <CornerUpRight className="w-12 h-12 text-green-400 shrink-0" />
                  <div>
                    <h2
                      className="text-2xl font-bold leading-tight"
                      dangerouslySetInnerHTML={{
                        __html:
                          routeSteps[navStepIndex]?.instruction || "Proceed",
                      }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <span className="bg-white/20 px-3 py-1 rounded text-sm font-bold">
                    {routeSteps[navStepIndex]?.distance || "0 m"}
                  </span>
                </div>
              </div>
            </GlassPanel>
          </motion.div>

          <div className="absolute bottom-8 left-0 right-0 z-40 pointer-events-auto flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 bg-black/60 backdrop-blur rounded-full p-2 border border-white/10">
              <button
                onClick={() => handleNavStep("prev")}
                className="p-3 text-white"
              >
                <ChevronLeft />
              </button>
              <span className="font-mono text-white text-sm">
                Step {navStepIndex + 1} / {routeSteps.length || 1}
              </span>
              <button
                onClick={() => handleNavStep("next")}
                className="p-3 text-white"
              >
                <ChevronRight />
              </button>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setArEnabled(!arEnabled)}
                className="px-6 py-4 rounded-2xl bg-white text-black font-bold flex items-center gap-2"
              >
                <Eye className="w-5 h-5" />{" "}
                {arEnabled ? "Disable AR" : "Start AR View"}
              </button>
            </div>
          </div>
        </>
      )}
      {navigationComplete && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div className="bg-[#1a1a1a] border border-green-500/50 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>
            <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <Flag className="w-10 h-10 text-green-500" fill="currentColor" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              You have arrived!
            </h2>
            <p className="text-gray-400 mb-8">
              You have reached your destination successfully.
            </p>
            <button
              onClick={() => exitModes(true)}
              className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-95"
            >
              Complete Trip
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
};

const TrainsPage = ({
  selectedStation,
  trainSearchQuery,
  setTrainSearchQuery,
  handleTrainSearch,
  isSearchingTrain,
  isFetchingTrains,
  stationSchedule,
  exitModes,
  isDarkMode,
}) => (
  <>
    <div className="absolute top-4 left-4 z-50 pointer-events-auto">
      {/* NEW CUSTOM BACK BUTTON */}
      <CustomBackButton onClick={() => exitModes(true)} />
    </div>
    <motion.div
      initial={{ x: -400 }}
      animate={{ x: 20 }}
      className="absolute top-32 bottom-32 left-0 z-40 w-80 flex flex-col pointer-events-none"
    >
      {/* TRAINS PAGE GLASS PANEL WITH FIXED DARK MODE LOGIC */}
      <GlassPanel className="pointer-events-auto h-full flex flex-col bg-white dark:bg-black/90 border-r border-white/10 shadow-2xl overflow-hidden">
        <div className="p-4 bg-orange-600 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrainFront className="w-6 h-6" />{" "}
            {selectedStation?.name || "Select Station"}
          </h2>
        </div>
        <div className="p-3 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={trainSearchQuery}
              onChange={(e) => setTrainSearchQuery(e.target.value)}
              onKeyDown={handleTrainSearch}
              placeholder="Search Train No."
              className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-800 dark:text-white outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {/* CUSTOM LOADER USED HERE */}
          {isFetchingTrains ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <CustomLoader scale={0.6} />
              <span className="text-xs mt-4">Fetching...</span>
            </div>
          ) : (
            <table className="w-full text-sm text-left text-gray-800 dark:text-gray-200">
              <thead className="text-xs uppercase bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="px-2 py-2">Train</th>
                  <th className="px-2 py-2">PF</th>
                  <th className="px-2 py-2">ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {stationSchedule.map((train, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    <td className="px-2 py-3">
                      <div className="font-bold">{train.number}</div>
                      <div className="text-[10px] opacity-70">{train.name}</div>
                    </td>
                    <td className="px-2 py-3 text-center">{train.pf}</td>
                    <td className="px-2 py-3 text-xs font-bold text-green-600 dark:text-green-500">
                      {train.eta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </GlassPanel>
    </motion.div>
  </>
);

// --- MAIN APP COMPONENT ---
export default function App() {
  const [google, setGoogle] = useState(null);
  const [map, setMap] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [ambulanceRenderer, setAmbulanceRenderer] = useState(null);
  const [placesService, setPlacesService] = useState(null);
  const [autocompleteService, setAutocompleteService] = useState(null);
  const [trafficLayer, setTrafficLayer] = useState(null);

  const [viewMode, setViewMode] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("map");
  const [arEnabled, setArEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showPlanner, setShowPlanner] = useState(true);
  const [isTrafficOn, setIsTrafficOn] = useState(false);
  const [mapType, setMapType] = useState("roadmap");
  const [showWeather, setShowWeather] = useState(false);
  const [arStatus, setArStatus] = useState("loading");
  const [navigationComplete, setNavigationComplete] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [showWeatherAnim, setShowWeatherAnim] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState("info");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // --- AUTH DEBUG STATE ---
  const [currentDomain, setCurrentDomain] = useState("");

  const [showEmergencySystem, setShowEmergencySystem] = useState(false);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationSchedule, setStationSchedule] = useState([]);
  const [isFetchingTrains, setIsFetchingTrains] = useState(false);
  const [trainSearchQuery, setTrainSearchQuery] = useState("");
  const [voiceTrainQuery, setVoiceTrainQuery] = useState(""); // For voice-triggered train searches
  const [isSearchingTrain, setIsSearchingTrain] = useState(false);
  const [inputs, setInputs] = useState({ start: "", end: "", time: "" });
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState("Fetching location...");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [routeSteps, setRouteSteps] = useState([]);
  const [navStepIndex, setNavStepIndex] = useState(0);
  const [navMarker, setNavMarker] = useState(null);
  const [arPanorama, setArPanorama] = useState(null);
  const [clickStep, setClickStep] = useState("dest");
  // CHANGED: Use Ref for immediate updates in map callbacks to prevent closure staleness
  const signalMarkers = useRef([]);

  const [commuteInsight, setCommuteInsight] = useState(null);
  const [isFetchingInsight, setIsFetchingInsight] = useState(false);
  const [voiceTrigger, setVoiceTrigger] = useState(0);
  const [airportTransitionActive, setAirportTransitionActive] = useState(false);

  // Refs
  const mapRef = useRef(null);
  const panoRef = useRef(null);
  const clickStepRef = useRef("dest");
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const stationMarkersRef = useRef([]);
  const incomingTrainsRef = useRef([]);
  const ambulanceMarkerRef = useRef(null);
  const realTrackPolylinesRef = useRef([]);
  const hasAttemptedLocationFetch = useRef(false); // Track if we've already tried to get location
  const hasPlayedAirportAnimation = useRef(false); // Track if airport animation has played

  // Voice Agent States
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [conversationHistory, setConversationHistory] = useState([]);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    clickStepRef.current = clickStep;
  }, [clickStep]);

  // --- CORE FUNCTIONS DEFINED IN SCOPE ---

  const showStatus = (msg, type = "info") => {
    setStatusMessage(msg);
    setStatusType(type);
    if (type !== "error") setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleAddToSource = (place, location) => {
    console.log("📍 handleAddToSource called:", place.name, location);

    // Update input with place name
    setInputs((prev) => ({
      ...prev,
      start: place.name || place.formatted_address,
    }));

    // Create green circular marker with 'S' label
    if (map && google) {
      const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: `Source: ${place.name}`,
        label: {
          text: "S",
          color: "white",
          fontSize: "16px",
          fontWeight: "bold",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#10b981",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
      });

      // Pan camera to source location
      map.panTo(location);
      map.setZoom(15);

      console.log("✅ Source marker created and camera panned");
    }
  };

  const handleAddToDestination = (place, location) => {
    console.log("📍 handleAddToDestination called:", place.name, location);

    // Update input with place name
    setInputs((prev) => ({
      ...prev,
      end: place.name || place.formatted_address,
    }));

    // Create blue circular marker with 'D' label
    if (map && google) {
      const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: `Destination: ${place.name}`,
        label: {
          text: "D",
          color: "white",
          fontSize: "16px",
          fontWeight: "bold",
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
      });

      // Pan camera to destination location
      map.panTo(location);
      map.setZoom(15);

      console.log("✅ Destination marker created and camera panned");
    }
  };

  const calculateRoute = () => {
    if (!inputs.start || !inputs.end || !directionsService) {
      showStatus("Please enter Start and Destination", "error");
      return;
    }
    let origin = inputs.start;
    if (userLocation) {
      if (
        inputs.start.includes("Lat:") ||
        inputs.start.includes("Requesting") ||
        inputs.start.includes("(Default)")
      ) {
        origin = { lat: userLocation.lat, lng: userLocation.lng };
      }
    }
    const request = {
      origin: origin,
      destination: inputs.end,
      travelMode: "DRIVING",
      provideRouteAlternatives: true,
    };
    directionsService.route(request, (result, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(result);
        directionsRenderer.setOptions({
          polylineOptions: {
            strokeColor: "#3b82f6",
            strokeWeight: 6,
            strokeOpacity: 0.8,
          },
          suppressMarkers: false,
        });
        if (map) directionsRenderer.setMap(map);

        const leg = result.routes[0].legs[0];
        setEta(leg.duration.text);
        setDistance(leg.distance.text);
        const detailedSteps = [];
        leg.steps.forEach((step) => {
          step.path.forEach((point) => {
            detailedSteps.push({
              pos: point,
              instruction: step.instructions,
              distance: step.distance.text,
              maneuver: step.maneuver,
            });
          });
        });
        setRouteSteps(detailedSteps);
        setNavStepIndex(0);
        const pathPoints = detailedSteps.map((s) => s.pos);
        generateTrafficSignals(pathPoints, "normal");
        setShowPlanner(false);
        showStatus("Route Calculated!", "success");
      } else {
        showStatus("Route not found. Try different locations.", "error");
      }
    });
  };

  const handleViewChange = (newView) => {
    // Clean up previous view's specific states that might linger
    setArEnabled(false);
    setShowEmergencySystem(false);
    setSelectedStation(null);
    setTrainSearchQuery("");
    setVoiceTrainQuery(""); // Clear voice train query when changing views

    // Stop Emergency Mode and Cleanup Ambulance
    setIsEmergencyActive(false);
    if (ambulanceMarkerRef.current) {
      ambulanceMarkerRef.current.setMap(null);
      ambulanceMarkerRef.current = null; // This breaks the animation loop
    }

    // Trigger airport transition animation (only once per session)
    if (newView === "airport" && viewMode !== "airport" && !hasPlayedAirportAnimation.current) {
      setAirportTransitionActive(true);
      hasPlayedAirportAnimation.current = true;
    }

    if (newView === "dashboard") {
      // Returning to dashboard: Clean nav/route specific data
      setRouteSteps([]);
      setNavigationComplete(false);
      setEta(null);
      setDistance(null);
      setCommuteInsight(null);
      setInputs({ start: "", end: "", time: "" });
      setSearchQuery("");
      setSuggestions([]);
      if (directionsRenderer) {
        directionsRenderer.setDirections({ routes: [] });
        directionsRenderer.setMap(null);
        if (map) directionsRenderer.setMap(map);
      }
    }

    // Cleanup Global Overlays
    if (ambulanceRenderer) ambulanceRenderer.setDirections({ routes: [] });
    if (navMarker) navMarker.setMap(null);

    // Clear legacy markers (imperative cleanup backup)
    stationMarkersRef.current.forEach((m) => m.setMap(null));
    stationMarkersRef.current = [];
    incomingTrainsRef.current.forEach((item) => {
      if (item.marker) item.marker.setMap(null);
    });
    incomingTrainsRef.current = [];
    realTrackPolylinesRef.current.forEach((p) => p.setMap(null));
    realTrackPolylinesRef.current = [];
    signalMarkers.current.forEach((m) => m.setMap(null));
    signalMarkers.current = [];

    setViewMode(newView);
    setActiveTab(newView === "dashboard" ? "map" : newView);

    if (map) {
      map.setZoom(13);
      map.setTilt(0);
      map.setHeading(0);
      if (userLocation) map.panTo(userLocation);
      else map.setCenter(BENGALURU_CENTER);
    }
  };

  const getMockTime = (baseTime, addMinutes) => {
    const t = new Date(baseTime.getTime() + addMinutes * 60000);
    return (
      t.getHours().toString().padStart(2, "0") +
      ":" +
      t.getMinutes().toString().padStart(2, "0")
    );
  };

  // ... (Other functions remain unchanged)
  const fetchRealtimeWeather = async () => {
    setIsFetchingWeather(true);
    const prompt = `Use Google Search to find the REAL-TIME current weather in Bengaluru, India. Return a single JSON object. Format: { "temp": "24°C", "condition": "Clear", "prediction": "No rain expected today" }.`;
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            tools: [{ google_search: {} }],
          }),
        },
      );
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const json = JSON.parse(
        text
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim(),
      );
      setWeatherData(json);
      setShowWeatherAnim(true);
      setShowWeather(true);
    } catch (e) {
      setWeatherData({
        temp: "28°C",
        condition: "Clear",
        prediction: "Clear skies (Offline)",
      });
      setShowWeatherAnim(true);
      setShowWeather(true);
    } finally {
      setIsFetchingWeather(false);
    }
  };

  const fetchCommuteInsight = async () => {
    if (!inputs.start || !inputs.end) {
      showStatus("Set start & end points first!", "error");
      return;
    }
    setIsFetchingInsight(true);
    const prompt = `I am traveling from ${inputs.start} to ${inputs.end} in Bengaluru. Provide a single, short "Pro Tip" (max 20 words) about this route.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        },
      );
      const data = await response.json();
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Traffic is heavy, proceed with caution.";
      setCommuteInsight(text);
    } catch (e) {
      setCommuteInsight("Unable to fetch AI insight.");
    } finally {
      setIsFetchingInsight(false);
    }
  };

  const updateUserMarker = (pos, g, m) => {
    if (userMarkerRef.current) userMarkerRef.current.setMap(null);
    userMarkerRef.current = new g.maps.Marker({
      position: pos,
      map: m,
      icon: {
        path: g.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#4285F4",
        fillOpacity: 1,
        strokeColor: "white",
        strokeWeight: 3,
      },
      zIndex: 1000,
      title: "Your Location",
    });
  };

  const setModeToDefault = (g, m, reasonMsg) => {
    setIsLoadingLocation(false);
    const defaultPos = BENGALURU_CENTER;
    setUserLocation(defaultPos);
    setInputs((prev) => ({ ...prev, start: "Bengaluru (Default)" }));
    setCurrentAddress("Bengaluru (Default)");
    if (g && m) {
      m.setCenter(defaultPos);
      m.setZoom(14);
      updateUserMarker(defaultPos, g, m);
    }
    showStatus(reasonMsg, "info");
  };

  // ===== VOICE AGENT FUNCTIONS =====

  const speakResponse = (text) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      synthRef.current.speak(utterance);
    }
  };

  const startVoiceRecognition = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      showStatus("Voice recognition not supported in this browser", "error");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceTranscript("");
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setVoiceTranscript(interimTranscript || finalTranscript);

      if (finalTranscript) {
        processVoiceCommand(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        showStatus(`Voice error: ${event.error}`, "error");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setVoiceTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setVoiceTranscript("");
  };

  const setLocationViaVoice = async (locationType, locationName) => {
    if (!placesService || !google) {
      speakResponse("Map services not ready yet");
      return;
    }

    showStatus(`Searching for ${locationName}...`, "info");

    const request = {
      input: locationName,
      locationBias: userLocation || BENGALURU_CENTER,
      fields: ["name", "geometry", "formatted_address", "place_id"],
    };

    placesService.findPlaceFromQuery(request, (results, status) => {
      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        results &&
        results[0]
      ) {
        const place = results[0];
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        if (locationType === "source") {
          handleAddToSource(place, location);
          const response = `Source set to ${place.name}`;
          speakResponse(response);
          setConversationHistory((prev) => [
            ...prev,
            { type: "user", text: `Set source as ${locationName}` },
            { type: "assistant", text: response },
          ]);
        } else {
          handleAddToDestination(place, location);
          const response = `Destination set to ${place.name}`;
          speakResponse(response);
          setConversationHistory((prev) => [
            ...prev,
            { type: "user", text: `Set destination as ${locationName}` },
            { type: "assistant", text: response },
          ]);
        }

        showStatus(
          `${locationType === "source" ? "Source" : "Destination"} set to ${place.name}`,
          "success",
        );
      } else {
        const errorMsg = `Could not find location: ${locationName}`;
        speakResponse(errorMsg);
        showStatus(errorMsg, "error");
        setConversationHistory((prev) => [
          ...prev,
          { type: "user", text: `Set ${locationType} as ${locationName}` },
          { type: "assistant", text: errorMsg },
        ]);
      }
    });
  };

  const navigateViaVoice = (pageName) => {
    const pageMap = {
      train: "trains",
      trains: "trains",
      transport: "transport",
      bus: "transport",
      metro: "transport",
      dashboard: "dashboard",
      home: "dashboard",
      navigation: "navigation",
      navigate: "navigation",
    };

    const targetPage = pageMap[pageName.toLowerCase()];

    if (!targetPage) {
      const errorMsg = `I don't know how to navigate to ${pageName}`;
      speakResponse(errorMsg);
      setConversationHistory((prev) => [
        ...prev,
        { type: "user", text: `Go to ${pageName}` },
        { type: "assistant", text: errorMsg },
      ]);
      return;
    }

    let response = "";

    if (targetPage === "trains") {
      enterTrainMode();
      response = "Opening trains page";
    } else if (targetPage === "transport") {
      if (!hasPlayedBusAnimation.current) {
        setActiveTransition("bus");
        setPendingViewMode("transport");
        hasPlayedBusAnimation.current = true;
      } else {
        setViewMode("transport");
      }
      response = "Opening transport page";
    } else if (targetPage === "dashboard") {
      handleViewChange("dashboard");
      response = "Going to dashboard";
    } else if (targetPage === "navigation") {
      if (routeSteps.length > 0) {
        setViewMode("navigation");
        response = "Starting navigation";
      } else {
        response = "Please calculate a route first";
      }
    }

    speakResponse(response);
    setConversationHistory((prev) => [
      ...prev,
      { type: "user", text: `Go to ${pageName}` },
      { type: "assistant", text: response },
    ]);
  };

  const processVoiceCommand = (transcript) => {
    const lowerTranscript = transcript.toLowerCase();

    const sourceMatch =
      lowerTranscript.match(/set (?:source|start|origin)(?: as| to)? (.+)/i) ||
      lowerTranscript.match(/(?:source|start|origin) (?:is|as) (.+)/i);

    const destMatch =
      lowerTranscript.match(/set (?:destination|dest|end)(?: as| to)? (.+)/i) ||
      lowerTranscript.match(/(?:destination|dest|end) (?:is|as) (.+)/i);

    const navMatch = lowerTranscript.match(
      /(?:go to|open|show|navigate to) (?:the )?(.+?)(?:page)?$/i,
    );

    if (sourceMatch) {
      const locationName = sourceMatch[1].trim();
      setLocationViaVoice("source", locationName);
    } else if (destMatch) {
      const locationName = destMatch[1].trim();
      setLocationViaVoice("destination", locationName);
    } else if (navMatch) {
      const pageName = navMatch[1].trim();
      navigateViaVoice(pageName);
    } else {
      const response =
        "I can help you set source/destination or navigate pages. Try saying 'set source as MG Road' or 'go to trains'";
      speakResponse(response);
      setConversationHistory((prev) => [
        ...prev,
        { type: "user", text: transcript },
        { type: "assistant", text: response },
      ]);
    }
  };

  const generateTrafficSignals = (pathPoints, mode = "normal") => {
    signalMarkers.current.forEach((m) => m.setMap(null));
    signalMarkers.current = [];

    if (pathPoints.length >= 20) {
      for (let i = 20; i < pathPoints.length - 10; i += 30) {
        const isRed = mode === "green-corridor" ? false : Math.random() > 0.4;
        const marker = new google.maps.Marker({
          position: pathPoints[i],
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: isRed ? "#ef4444" : "#22c55e",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          },
          zIndex: 100,
        });
        signalMarkers.current.push(marker);
      }
    }
  };

  const handleUpdateLocation = (newAddress) => {
    setCurrentAddress(newAddress);
    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: newAddress }, (results, status) => {
        if (status === "OK" && results[0]) {
          const newLoc = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          };
          setUserLocation(newLoc);
          if (map) {
            map.panTo(newLoc);
            updateUserMarker(newLoc, window.google, map);
          }
          showStatus("Location Updated!", "success");
        } else {
          showStatus("Could not find that address.", "error");
        }
      });
    }
  };

  const attemptLocationFetch = (g, m, forceUpdate = false) => {
    // Capture the current source value at the START to check against it later
    const initialSource = inputs.start;

    setIsLoadingLocation(true);
    // Only update inputs.start if it's empty, or if forceUpdate is true (from crosshair button)
    // Check if inputs.start has meaningful content (not empty, not 'Requesting Location...', not 'Bengaluru (Default)')
    const hasManualSource =
      initialSource &&
      initialSource !== "" &&
      initialSource !== "Requesting Location..." &&
      initialSource !== "Bengaluru (Default)";

    if (!hasManualSource || forceUpdate) {
      setInputs((prev) => ({ ...prev, start: "Requesting Location..." }));
    }
    showStatus("Locating...", "info");
    if (!navigator.geolocation) {
      setModeToDefault(g, m, "Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(pos);
        setIsLoadingLocation(false);
        showStatus("Location Found!", "success");
        const coordString = `Lat: ${pos.lat.toFixed(4)}, Lng: ${pos.lng.toFixed(4)}`;

        // Check again if source was manually set (comparing against initial value)
        if (!hasManualSource || forceUpdate) {
          setInputs((prev) => ({ ...prev, start: coordString }));
        }
        if (g && m) {
          m.setCenter(pos);
          m.setZoom(15);

          // Create/update user marker with hover and click interactions
          if (userMarkerRef.current) userMarkerRef.current.setMap(null);

          const userMarker = new g.maps.Marker({
            position: pos,
            map: m,
            icon: {
              path: g.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "#fff",
              strokeWeight: 3,
            },
            zIndex: 1000,
            title: "Your Location",
          });

          userMarkerRef.current = userMarker;

          const geocoder = new g.maps.Geocoder();
          geocoder.geocode({ location: pos }, (results, status) => {
            if (status === "OK" && results[0]) {
              const addr = results[0].formatted_address;

              // CRITICAL: Check against the INITIAL source value, not current
              // This prevents async override after user has manually set source
              if (!hasManualSource || forceUpdate) {
                setInputs((prev) => ({ ...prev, start: addr }));
              }
              setCurrentAddress(addr);

              // Add hover info window
              const hoverInfoWindow = new g.maps.InfoWindow({
                content: `
                                <style>
                                    .gm-style .gm-style-iw-c { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
                                    .gm-style .gm-style-iw-d { overflow: visible !important; }
                                    .gm-style .gm-style-iw-t::after { display: none !important; }
                                    .gm-style-iw-chr { display: none !important; }
                                    .gm-ui-hover-effect { display: none !important; }
                                </style>
                                <div style="
                                    background: ${isDarkMode ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)"};
                                    border: 2px solid #4285F4;
                                    border-radius: 12px;
                                    padding: 12px 16px;
                                    backdrop-filter: blur(12px);
                                    box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 20px rgba(66, 133, 244, 0.3);
                                ">
                                    <div style="font-weight: 700; font-size: 14px; color: ${isDarkMode ? "#fff" : "#1f2937"}; margin-bottom: 4px;">
                                        📍 Your Location
                                    </div>
                                    <div style="font-size: 12px; color: ${isDarkMode ? "#9ca3af" : "#6b7280"};">
                                        ${addr}
                                    </div>
                                </div>
                            `,
                disableAutoPan: true,
              });

              userMarker.addListener("mouseover", () => {
                hoverInfoWindow.open(m, userMarker);
              });

              userMarker.addListener("mouseout", () => {
                hoverInfoWindow.close();
              });

              // Add click listener to show selection options
              userMarker.addListener("click", () => {
                const selectionInfoWindow = new g.maps.InfoWindow({
                  content: `
                                    <style>
                                        .gm-style .gm-style-iw-c { background: transparent !important; box-shadow: none !important; padding: 0 !important; }
                                        .gm-style .gm-style-iw-d { overflow: visible !important; }
                                        .gm-style .gm-style-iw-t::after { display: none !important; }
                                    </style>
                                    <div style="
                                        background: ${isDarkMode ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)"};
                                        border: 2px solid #4285F4;
                                        border-radius: 16px;
                                        padding: 16px;
                                        backdrop-filter: blur(16px);
                                        box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(66, 133, 244, 0.3);
                                        min-width: 280px;
                                    ">
                                        <div style="font-weight: 700; font-size: 16px; color: ${isDarkMode ? "#fff" : "#1f2937"}; margin-bottom: 8px;">
                                            📍 Your Location
                                        </div>
                                        <div style="font-size: 13px; color: ${isDarkMode ? "#9ca3af" : "#6b7280"}; margin-bottom: 16px;">
                                            ${addr}
                                        </div>
                                        <div style="display: flex; gap: 8px;">
                                            <button id="set-current-as-source" style="
                                                flex: 1;
                                                padding: 10px 16px;
                                                background: linear-gradient(135deg, #10b981, #059669);
                                                color: white;
                                                border: none;
                                                border-radius: 10px;
                                                font-weight: 600;
                                                font-size: 13px;
                                                cursor: pointer;
                                                transition: all 0.2s;
                                                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                                            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                                Set as Source
                                            </button>
                                            <button id="set-current-as-dest" style="
                                                flex: 1;
                                                padding: 10px 16px;
                                                background: linear-gradient(135deg, #3b82f6, #2563eb);
                                                color: white;
                                                border: none;
                                                border-radius: 10px;
                                                font-weight: 600;
                                                font-size: 13px;
                                                cursor: pointer;
                                                transition: all 0.2s;
                                                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                                            " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                                Set as Destination
                                            </button>
                                        </div>
                                    </div>
                                `,
                  position: pos,
                });

                selectionInfoWindow.open(m);

                setTimeout(() => {
                  const sourceBtn = document.getElementById(
                    "set-current-as-source",
                  );
                  const destBtn = document.getElementById(
                    "set-current-as-dest",
                  );

                  if (sourceBtn) {
                    sourceBtn.addEventListener("click", () => {
                      setInputs((prev) => ({ ...prev, start: addr }));
                      selectionInfoWindow.close();
                      showStatus("Source set to your location", "success");
                    });
                  }

                  if (destBtn) {
                    destBtn.addEventListener("click", () => {
                      setInputs((prev) => ({ ...prev, end: addr }));
                      selectionInfoWindow.close();
                      showStatus("Destination set to your location", "success");
                    });
                  }
                }, 100);
              });
            }
          });
        }
      },
      (error) => {
        setModeToDefault(g, m, "Location access denied/failed. Using Default.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );
  };

  const handleMapDoubleClick = (latLng, g, mapInstance) => {
    if (viewMode !== "dashboard") return;
    const currentStep = clickStepRef.current;
    const geocoder = new g.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results[0]) {
        const address = results[0].formatted_address;
        const contentString = `
                <div style="
                    background: ${isDarkMode ? "rgba(0, 0, 0, 0.85)" : "rgba(255, 255, 255, 0.85)"};
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-radius: 16px;
                    padding: 16px;
                    min-width: 220px;
                    border: 1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
                    box-shadow: 0 8px 32px ${isDarkMode ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.2)"}, 
                                0 0 0 1px ${isDarkMode ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} inset;
                ">
                    <h3 style="
                        margin: 0 0 8px 0;
                        font-weight: 700;
                        font-size: 15px;
                        color: ${isDarkMode ? "#fff" : "#000"};
                        text-shadow: 0 0 20px ${currentStep === "dest" ? "#3b82f6" : "#10b981"}80;
                    ">
                        ${currentStep === "dest" ? "🏁 Destination" : "🚀 Start Location"}
                    </h3>
                    <p style="
                        margin: 0;
                        font-size: 12px;
                        color: ${isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"};
                        line-height: 1.4;
                    ">
                        ${address}
                    </p>
                </div>
            `;
        const infoWindow = new g.maps.InfoWindow({
          content: contentString,
          minWidth: 200,
        });
        const markerConfig =
          currentStep === "dest"
            ? { color: "#ef4444", key: "end" }
            : { color: "#22c55e", key: "start" };
        setInputs((curr) => ({ ...curr, [markerConfig.key]: address }));
        const marker = new g.maps.Marker({
          position: latLng,
          map: mapInstance,
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: markerConfig.color,
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          },
        });
        markersRef.current.push(marker);
        infoWindow.open(mapInstance, marker);
        if (currentStep === "dest") {
          setClickStep("start");
        } else {
          setShowPlanner(true);
          setClickStep("dest");
        }
      }
    });
  };

  const fetchTrainDataWithGemini = async (
    stationName,
    stationCode,
    specificTrainNo = null,
  ) => {
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
    let prompt = "";
    if (specificTrainNo) {
      prompt = `Using Google Search, find the exact current LIVE running status of Train No: "${specificTrainNo}" at "${stationName}" (${stationCode}). Current Time: ${currentTime}. If the train is not running today, provide the scheduled time. Return JSON: {"name": string, "number": string, "arr": string, "dep": string, "pf": string, "eta": string, "status": string}`;
    } else {
      prompt = `Using Google Search, find the LIVE UPCOMING train schedule for "${stationName}" (${stationCode}) Bengaluru. Current Time: ${currentTime}. Return JSON list of 6 trains with their REAL-TIME status.`;
    }
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            tools: [{ google_search: {} }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        },
      );
      if (!response.ok) throw new Error("Gemini API Error");
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty response");

      // Robust JSON extraction
      const jsonMatch = text.match(/\[.*\]/s) || text.match(/\{.*\}/s);
      if (!jsonMatch) throw new Error("No JSON found in response");
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      // FALLBACK TO SIMULATED DATA IF REAL FAILS
      const now = new Date();
      if (specificTrainNo)
        return {
          name: "Mock Express",
          number: specificTrainNo,
          pf: "1",
          arr: getMockTime(now, 10),
          dep: getMockTime(now, 15),
          eta: "10 min",
          status: "On Time (Offline Schedule)",
        };
      return [
        {
          name: "SBC-KGI MEMU",
          number: "06575",
          pf: "1",
          arr: getMockTime(now, 5),
          dep: getMockTime(now, 6),
          eta: "5 min",
          status: "On Time (Offline Schedule)",
        },
        {
          name: "MYS Vande Bharat",
          number: "20607",
          pf: "7",
          arr: getMockTime(now, 15),
          dep: getMockTime(now, 20),
          eta: "15 min",
          status: "On Time (Offline Schedule)",
        },
      ];
    }
  };

  const handleStationClick = async (station) => {
    setSelectedStation(station);
    setIsFetchingTrains(true);
    setTrainSearchQuery("");
    map.setCenter({ lat: station.lat, lng: station.lng });
    map.setZoom(15);
    try {
      const trains = await fetchTrainDataWithGemini(station.name, station.code);
      // If search is for specific station schedule, it returns array.
      if (Array.isArray(trains)) {
        setStationSchedule(trains);
      } else {
        // Fallback if somehow it returns an object (unlikely for schedule search)
        setStationSchedule([trains]);
      }
    } catch (err) {
      const now = new Date();
      setStationSchedule([
        {
          name: "Intercity Exp",
          number: "12678",
          pf: "4",
          arr: getMockTime(now, 5),
          dep: getMockTime(now, 10),
          eta: "5 min",
          status: "Delayed (Offline Schedule)",
        },
      ]);
    } finally {
      setIsFetchingTrains(false);
    }
  };

  const handleTrainSearch = async (e) => {
    if (e.key === "Enter" && trainSearchQuery.length > 2) {
      setIsSearchingTrain(true);
      try {
        const result = await fetchTrainDataWithGemini(
          selectedStation.name,
          selectedStation.code,
          trainSearchQuery,
        );
        if (result && !result.error) {
          // Ensure result is an object before using result.number
          if (result.number) {
            setStationSchedule((prev) => [
              result,
              ...prev.filter((t) => t.number !== result.number),
            ]);
            showStatus(`Train ${result.number} found!`, "success");
          } else {
            showStatus("Invalid data received.", "error");
          }
        } else {
          showStatus(result.error || "Train not found.", "error");
        }
      } catch (err) {
        showStatus("Search failed.", "error");
      } finally {
        setIsSearchingTrain(false);
      }
    }
  };

  const handleEmergencyClick = () => {
    handleViewChange("dashboard");
    setShowEmergencySystem(true);
    if (userLocation && map) {
      map.panTo(userLocation);
      map.setZoom(16);
    }
  };

  const handleEmergencyStart = ({ origin, destination, hospitalName }) => {
    if (!directionsService || !directionsRenderer) return;
    setIsEmergencyActive(true);
    const greenRequest = {
      origin: origin,
      destination: destination,
      travelMode: "DRIVING",
    };
    directionsService.route(greenRequest, (result, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(result);
        directionsRenderer.setOptions({
          polylineOptions: {
            strokeColor: "#22c55e",
            strokeWeight: 8,
            strokeOpacity: 0.9,
          },
          suppressMarkers: false,
        });
        const leg = result.routes[0].legs[0];
        const steps = [];
        leg.steps.forEach((step) =>
          step.path.forEach((point) => steps.push(point)),
        );
        generateTrafficSignals(steps, "green-corridor");
        showStatus(
          `CORRIDOR TO ${hospitalName.toUpperCase()} ACTIVE`,
          "success",
        );

        // Animate ambulance directly along the green corridor from origin to hospital
        const path = result.routes[0].overview_path;
        animateAmbulance(path);
      } else {
        showStatus("Could not map route to hospital.", "error");
      }
    });
  };

  const animateAmbulance = (path) => {
    if (!map || !google) return;
    if (ambulanceMarkerRef.current) ambulanceMarkerRef.current.setMap(null);
    const icon = {
      url: "/svg and animations/ambulance.svg",
      scaledSize: new google.maps.Size(40, 40),
      anchor: new google.maps.Point(20, 20),
    };
    const marker = new google.maps.Marker({
      position: path[0],
      map: map,
      icon: icon,
      title: "Approaching Ambulance",
      zIndex: 2000,
    });
    ambulanceMarkerRef.current = marker;
    let step = 0;
    let pathIndex = 0;
    const framesPerSegment = 100; // Perfect realistic speed simulating a real ambulance driving through the city
    const animate = () => {
      if (!ambulanceMarkerRef.current) return;
      if (pathIndex < path.length - 1) {
        const start = path[pathIndex];
        const end = path[pathIndex + 1];
        const progress = (step % framesPerSegment) / framesPerSegment;
        const lat = start.lat() + (end.lat() - start.lat()) * progress;
        const lng = start.lng() + (end.lng() - start.lng()) * progress;
        const newPos = new google.maps.LatLng(lat, lng);
        marker.setPosition(newPos);
        step++;
        if (step % framesPerSegment === 0) pathIndex++;
        requestAnimationFrame(animate);
      } else {
        // Loop the animation when it reaches the hospital so it continues moving
        pathIndex = 0;
        step = 0;
        requestAnimationFrame(animate);
      }
    };
    animate();
  };

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.length > 2 && autocompleteService) {
      autocompleteService.getPlacePredictions(
        {
          input: val,
          location: new google.maps.LatLng(BENGALURU_CENTER),
          radius: 50000,
        },
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setSuggestions(predictions);
            setShowSuggestions(true);
          } else {
            setSuggestions([]);
          }
        },
      );
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (placeId, description) => {
    setSearchQuery(description);
    setShowSuggestions(false);
    const updateLocation = (location, address) => {
      map.setCenter(location);
      map.setZoom(16);
      const marker = new window.google.maps.Marker({
        map: map,
        position: location,
        title: description,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#ef4444",
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
      });
      markersRef.current.push(marker);
      setInputs((prev) => ({ ...prev, end: address }));
      setClickStep("start");
      setShowPlanner(true);
    };
    if (placesService) {
      placesService.getDetails({ placeId: placeId }, (place, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry
        ) {
          updateLocation(
            place.geometry.location,
            place.formatted_address || description,
          );
        } else {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ address: description }, (results, geoStatus) => {
            if (geoStatus === "OK" && results[0]) {
              updateLocation(
                results[0].geometry.location,
                results[0].formatted_address || description,
              );
            } else {
              showStatus("Location not found.", "error");
            }
          });
        }
      });
    }
  };

  const handleClear = () => {
    setInputs({ start: "", end: "", time: "" });
    setEta(null);
    setDistance(null);
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (directionsRenderer) directionsRenderer.setDirections({ routes: [] });
    if (ambulanceRenderer) ambulanceRenderer.setDirections({ routes: [] });
    setRouteSteps([]);
    signalMarkers.current.forEach((m) => m.setMap(null));
    signalMarkers.current = [];
    setClickStep("dest");
    setNavStepIndex(0);
    setSelectedStation(null);
    setIsEmergencyActive(false);
    setNavigationComplete(false);
    if (map) {
      map.setZoom(13);
      if (userLocation) map.panTo(userLocation);
      else map.setCenter(BENGALURU_CENTER);
    }
    showStatus("Cleared", "info");
  };

  const handleNavStep = (direction) => {
    let newIndex = navStepIndex + (direction === "next" ? 10 : -10);
    if (newIndex >= routeSteps.length - 1) {
      newIndex = routeSteps.length - 1;
      setNavigationComplete(true);
    }
    if (newIndex < 0) newIndex = 0;
    setNavStepIndex(newIndex);
  };

  const drawRealTracks = () => {
    if (!directionsService || !map) return;
    const routesToFetch = [
      {
        origin: "Kengeri Railway Station",
        dest: "KSR Bengaluru City Junction",
      },
      {
        origin: "KSR Bengaluru City Junction",
        dest: "Whitefield Railway Station",
      },
      { origin: "Yesvantpur Junction", dest: "KSR Bengaluru City Junction" },
      { origin: "Yesvantpur Junction", dest: "Banaswadi" },
    ];
    routesToFetch.forEach((route, index) => {
      directionsService.route(
        {
          origin: route.origin,
          destination: route.dest,
          travelMode: "TRANSIT",
          transitOptions: { modes: ["TRAIN"] },
        },
        (result, status) => {
          if (status === "OK") {
            const path = result.routes[0].overview_path;
            const trackBase = new google.maps.Polyline({
              path: path,
              map: map,
              strokeColor: "#333333",
              strokeWeight: 6,
              zIndex: 1,
            });
            const trackDetail = new google.maps.Polyline({
              path: path,
              map: map,
              strokeColor: "#777777",
              strokeWeight: 3,
              strokeOpacity: 1,
              icons: [
                {
                  icon: {
                    path: "M 0,-1 0,1",
                    strokeColor: "#ffffff",
                    strokeWeight: 2,
                    scale: 3,
                  },
                  offset: "0",
                  repeat: "10px",
                },
              ],
              zIndex: 2,
            });
            realTrackPolylinesRef.current.push(trackBase, trackDetail);
            if (index === 0) startLiveTrainSimulation(path);
          }
        },
      );
    });
  };

  // Video transition states
  const [activeTransition, setActiveTransition] = useState(null);
  const [pendingViewMode, setPendingViewMode] = useState(null);
  const hasPlayedTrainAnimation = useRef(false);
  const hasPlayedBusAnimation = useRef(false);
  const hasPlayedMetroAnimation = useRef(false);

  const enterTrainMode = () => {
    // Trigger train animation transition only if not played yet
    if (!hasPlayedTrainAnimation.current) {
      setActiveTransition("train");
      setPendingViewMode("trains");
      hasPlayedTrainAnimation.current = true;
    } else {
      // Skip animation, go directly to trains page
      handleViewChange("trains");
    }
  };

  const handleTransitionComplete = () => {
    // Switch to pending view after video completes
    if (pendingViewMode) {
      handleViewChange(pendingViewMode);
      setPendingViewMode(null);
    }
    setActiveTransition(null);
  };

  // NEW: Lifecycle Effect for Train Mode
  useEffect(() => {
    if (viewMode === "trains" && map && google) {
      // Setup Train Map Elements
      map.setZoom(11);
      map.setCenter(BENGALURU_CENTER);
      RAILWAY_STATIONS.forEach((station) => {
        const marker = new google.maps.Marker({
          position: { lat: station.lat, lng: station.lng },
          map: map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#fbbf24",
            fillOpacity: 1,
            strokeColor: "black",
            strokeWeight: 2,
          },
          label: { text: "🚆", fontSize: "14px" },
          title: station.name,
        });
        marker.addListener("click", () => handleStationClick(station));
        stationMarkersRef.current.push(marker);
      });
      drawRealTracks();
      showStatus("Showing Real Railway Network", "info");

      // Cleanup function - Runs when viewMode changes OR component unmounts
      return () => {
        stationMarkersRef.current.forEach((m) => m.setMap(null));
        stationMarkersRef.current = [];
        incomingTrainsRef.current.forEach((item) => {
          if (item.marker) item.marker.setMap(null);
        });
        incomingTrainsRef.current = [];
        realTrackPolylinesRef.current.forEach((p) => p.setMap(null));
        realTrackPolylinesRef.current = [];
      };
    }
  }, [viewMode, map, google]);

  const enterTransportMode = () => {
    // Trigger bus animation transition only if not played yet
    if (!hasPlayedBusAnimation.current) {
      setActiveTransition("bus");
      setPendingViewMode("transport");
      hasPlayedBusAnimation.current = true;
    } else {
      // Skip animation, go directly to transport page
      setViewMode("transport");
    }
  };

  const enterNavigationMode = () => {
    if (routeSteps.length === 0) {
      setShowPlanner(true);
      showStatus("Calculate a route first!", "error");
      return;
    }
    handleViewChange("navigation");
    // Note: Map drawing logic moved to useEffect below
  };

  const startLiveTrainSimulation = (path) => {
    if (!path || path.length < 2) return;
    const trainMarker = new google.maps.Marker({
      position: path[0],
      map: map,
      icon: {
        path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 5,
        fillColor: "#fbbf24",
        fillOpacity: 1,
        strokeWeight: 1,
        rotation: 0,
      },
      label: { text: "🚆", fontSize: "14px" },
      title: `Express Train`,
    });
    let step = 0;
    let pathIndex = 0;
    const framesPerSegment = 100;
    const animate = () => {
      if (!trainMarker.getMap()) return;
      if (pathIndex < path.length - 1) {
        const start = path[pathIndex];
        const end = path[pathIndex + 1];
        const progress = (step % framesPerSegment) / framesPerSegment;
        const lat = start.lat() + (end.lat() - start.lat()) * progress;
        const lng = start.lng() + (end.lng() - start.lng()) * progress;
        const newPos = new google.maps.LatLng(lat, lng);
        trainMarker.setPosition(newPos);
        if (google) {
          const heading = window.google.maps.geometry.spherical.computeHeading(
            start,
            end,
          );
          const icon = trainMarker.getIcon();
          icon.rotation = heading;
          trainMarker.setIcon(icon);
        }
        step++;
        if (step % framesPerSegment === 0) pathIndex++;
        requestAnimationFrame(animate);
      } else {
        pathIndex = 0;
        step = 0;
        requestAnimationFrame(animate);
      }
    };
    incomingTrainsRef.current.push({ marker: trainMarker, animInterval: null });
    requestAnimationFrame(animate);
  };

  const initMap = (g) => {
    if (!mapRef.current) return;
    const mapInstance = new g.maps.Map(mapRef.current, {
      center: BENGALURU_CENTER,
      zoom: 13,
      disableDefaultUI: true,
      disableDoubleClickZoom: true,
      gestureHandling: "greedy",
      styles: isDarkMode ? DARK_MAP_STYLE : [],
      mapTypeId: "roadmap",
    });
    setMap(mapInstance);
    setDirectionsService(new g.maps.DirectionsService());
    setDirectionsRenderer(
      new g.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#3b82f6",
          strokeWeight: 6,
          strokeOpacity: 0.8,
        },
      }),
    );
    setAmbulanceRenderer(
      new g.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: "#ef4444",
          strokeWeight: 6,
          strokeOpacity: 0.8,
        },
      }),
    );
    setPlacesService(new g.maps.places.PlacesService(mapInstance));
    setAutocompleteService(new g.maps.places.AutocompleteService());
    setTrafficLayer(new g.maps.TrafficLayer());
    mapInstance.addListener("dblclick", (e) => {
      handleMapDoubleClick(e.latLng, g, mapInstance);
    });

    // Location is NOT auto-fetched on load
    // User must click the crosshair button to set current location as source
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if we are already signed in to avoid re-triggering
        if (auth.currentUser) return;

        // --- CHANGED: Try HARDCODED LOGIN FIRST (User Request) ---
        try {
          await signInWithEmailAndPassword(auth, "user.me@gmail.com", "123456");
          console.log("Logged in with hardcoded user!");
        } catch (emailErr) {
          console.warn(
            "Hardcoded login failed, trying anonymous fallback...",
            emailErr,
          );
          // Fallback to anonymous if hardcoded fails (e.g. user deleted or password changed)
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth Failed:", err);
        // Show the actual error code to help debug
        showStatus(`Auth Error: ${err.code || err.message}`, "error");
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = ` 
        .gmnoprint a, .gmnoprint span, .gm-style-cc { display: none; } 
        .gmnoprint div { background: none !important; } 
        img[src*="google_white"] { display: none; } 
        img[src*="google_on_white"] { display: none; } 
        .gm-bundled-control .gmnoprint { display: block; } 
        .hide-scrollbar::-webkit-scrollbar { display: none; } 
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Make InfoWindow background transparent for glassmorphism */
        .gm-style .gm-style-iw-c {
            background: transparent !important;
            box-shadow: none !important;
            padding: 0 !important;
        }
        .gm-style .gm-style-iw-d {
            overflow: visible !important;
        }
        .gm-style .gm-style-iw-t::after {
            display: none !important;
        }
        
        ${globalStyles}
    `;
    document.head.appendChild(style);

    const loadGoogleMaps = () => {
      if (window.google) {
        setGoogle(window.google);
        initMap(window.google);
        return;
      }
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
      script.async = true;
      script.onload = () => {
        setGoogle(window.google);
        initMap(window.google);
      };
      document.body.appendChild(script);
    };
    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (trafficLayer && map)
      isTrafficOn ? trafficLayer.setMap(map) : trafficLayer.setMap(null);
  }, [isTrafficOn, trafficLayer, map]);
  useEffect(() => {
    if (map && google)
      map.setOptions({ styles: isDarkMode ? DARK_MAP_STYLE : [] });
  }, [isDarkMode, map, google]);
  useEffect(() => {
    if (map) map.setMapTypeId(mapType);
  }, [mapType, map]);
  useEffect(() => {
    if (map && google) {
      setTimeout(() => {
        google.maps.event.trigger(map, "resize");
        if (userLocation) map.panTo(userLocation);
      }, 600);
    }
  }, [arEnabled, map, google, userLocation]);

  useEffect(() => {
    if (
      viewMode === "navigation" &&
      arEnabled &&
      panoRef.current &&
      google &&
      routeSteps.length > 0
    ) {
      const svService = new google.maps.StreetViewService();
      setArStatus("loading");
      const location = routeSteps[navStepIndex]?.pos || userLocation;
      if (!location) return;
      svService.getPanorama(
        { location: location, radius: 50 },
        (data, status) => {
          if (status === "OK") {
            const panorama = new google.maps.StreetViewPanorama(
              panoRef.current,
              {
                pano: data.location.pano,
                pov: { heading: 0, pitch: 0 },
                zoom: 1,
                disableDefaultUI: true,
                addressControl: false,
                showRoadLabels: false,
              },
            );
            setArPanorama(panorama);
            setArStatus("active");
            if (routeSteps[navStepIndex + 1]) {
              const initialHeading =
                google.maps.geometry.spherical.computeHeading(
                  routeSteps[navStepIndex].pos,
                  routeSteps[navStepIndex + 1].pos,
                );
              panorama.setPov({ heading: initialHeading, pitch: 0 });
            }
          } else {
            setArStatus("error");
          }
        },
      );
    }
  }, [viewMode, arEnabled, google, routeSteps, navStepIndex, userLocation]);

  useEffect(() => {
    if (viewMode === "navigation" && routeSteps[navStepIndex] && map) {
      const pos = routeSteps[navStepIndex].pos;
      map.panTo(pos);
      map.setZoom(18);
      map.setTilt(45);

      if (navMarker) {
        navMarker.setMap(map);
        navMarker.setPosition(pos);
        if (routeSteps[navStepIndex + 1]) {
          const heading = google.maps.geometry.spherical.computeHeading(
            pos,
            routeSteps[navStepIndex + 1].pos,
          );
          const icon = navMarker.getIcon();
          icon.rotation = heading;
          navMarker.setIcon(icon);
          map.setHeading(heading);
          if (arPanorama) {
            arPanorama.setPosition(pos);
            arPanorama.setPov({ heading: heading, pitch: 0 });
          }
        }
      } else if (google) {
        const newMarker = new google.maps.Marker({
          position: pos,
          map: map,
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: "#fbbf24",
            fillOpacity: 1,
            strokeWeight: 2,
            rotation: 0,
          },
          zIndex: 999,
        });
        setNavMarker(newMarker);
      }

      // Cleanup logic specifically for Navigation Mode
      return () => {
        if (navMarker) navMarker.setMap(null);
      };
    }
  }, [navStepIndex, viewMode, map, google]);

  return (
    <div
      className={`relative w-full h-screen overflow-hidden ${isDarkMode ? "dark text-white" : "text-gray-900"}`}
    >
      {/* SETUP HELPER: VISIBLE IF AUTH ERROR OCCURS */}
      {statusMessage && statusMessage.includes("auth") && (
        <div className="absolute top-0 left-0 right-0 z-[100] bg-orange-600 text-white p-2 text-xs flex justify-between items-center px-4">
          <span>
            <strong>Action Required:</strong> Add this domain to Firebase Auth
            Settings:{" "}
          </span>
          <div className="flex items-center gap-2 bg-black/30 px-2 py-1 rounded">
            <code className="font-mono select-all">{currentDomain}</code>
            <button
              onClick={() => navigator.clipboard.writeText(currentDomain)}
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showWeatherAnim && weatherData && (
          <WeatherOverlay condition={weatherData} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-10 left-0 right-0 z-[60] flex justify-center pointer-events-none"
          >
            <div
              className={`pointer-events-auto px-4 py-2 rounded-lg shadow-xl border flex items-center gap-2 font-bold text-sm ${statusType === "error" ? "bg-red-500 border-red-400 text-white" : statusType === "success" ? "bg-green-500 border-green-400 text-white" : "bg-blue-500 border-blue-400 text-white"}`}
            >
              {statusType === "error" && <AlertTriangle className="w-4 h-4" />}
              {statusType === "success" && <CheckCircle className="w-4 h-4" />}
              {statusType === "info" && <CustomLoader scale={0.4} />}
              {statusMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <VoiceAssistant
        setSearchQuery={setSearchQuery}
        setArEnabled={setArEnabled}
        setInputs={setInputs}
        isEmergency={isEmergencyActive}
        ambulanceEta={eta || "4"}
        setShowEmergencySystem={setShowEmergencySystem}
        setViewMode={handleViewChange}
        setVoiceTrainQuery={setVoiceTrainQuery}
        calculateRoute={calculateRoute}
        fetchRealtimeWeather={fetchRealtimeWeather}
        triggerSession={voiceTrigger}
        handleAddToSource={handleAddToSource}
        handleAddToDestination={handleAddToDestination}
        placesService={placesService}
        google={google}
        userLocation={userLocation}
        showStatus={showStatus}
      />

      <AnimatePresence>
        {viewMode === "dashboard" && (
          <DashboardPage
            showPlanner={showPlanner}
            setShowPlanner={setShowPlanner}
            searchQuery={searchQuery}
            handleSearchInput={handleSearchInput}
            setSearchQuery={setSearchQuery}
            suggestions={suggestions}
            setSuggestions={setSuggestions}
            showSuggestions={showSuggestions}
            handleSelectSuggestion={handleSelectSuggestion}
            eta={eta}
            distance={distance}
            isEmergencyActive={isEmergencyActive}
            showEmergencySystem={showEmergencySystem}
            setShowEmergencySystem={setShowEmergencySystem}
            inputs={inputs}
            setInputs={setInputs}
            attemptLocationFetch={attemptLocationFetch}
            isLoadingLocation={isLoadingLocation}
            calculateRoute={calculateRoute}
            handleClear={handleClear}
            fetchRealtimeWeather={fetchRealtimeWeather}
            isFetchingWeather={isFetchingWeather}
            showWeather={showWeather}
            weatherData={weatherData}
            setShowWeather={setShowWeather}
            mapType={mapType}
            setMapType={setMapType}
            isTrafficOn={isTrafficOn}
            setIsTrafficOn={setIsTrafficOn}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            google={google}
            map={map}
            startVoiceSession={() => setVoiceTrigger((prev) => prev + 1)}
            commuteInsight={commuteInsight}
            isFetchingInsight={isFetchingInsight}
            fetchCommuteInsight={fetchCommuteInsight}
          />
        )}

        {viewMode === "navigation" && (
          <NavigationPage
            arEnabled={arEnabled}
            setArEnabled={setArEnabled}
            navigationComplete={navigationComplete}
            arStatus={arStatus}
            routeSteps={routeSteps}
            navStepIndex={navStepIndex}
            handleNavStep={handleNavStep}
            exitModes={() => handleViewChange("dashboard")}
            inputs={inputs}
            panoRef={panoRef}
          />
        )}

        {viewMode === "trains" && (
          <TrainsPageComponent
            onBack={() => handleViewChange("dashboard")}
            voiceSearchQuery={voiceTrainQuery}
          />
        )}

        {viewMode === "transport" && (
          <TransportPageComponent
            onBack={() => handleViewChange("dashboard")}
            userLocation={userLocation}
            routeData={{ origin: inputs.start, destination: inputs.end }}
            hasPlayedMetroAnimation={hasPlayedMetroAnimation}
          />
        )}

        {viewMode === "airport" && (
          <div className="fixed inset-0 z-50 bg-slate-950">
            <AirTransitPage onBack={() => handleViewChange("dashboard")} />
          </div>
        )}
      </AnimatePresence>

      <EmergencyPage
        userLocation={userLocation}
        currentAddress={currentAddress}
        isVisible={showEmergencySystem}
        onClose={() => setShowEmergencySystem(false)}
        onEmergencyStart={handleEmergencyStart}
        onUpdateLocation={handleUpdateLocation}
        authUser={authUser}
        placesService={placesService}
      />

      {/* Video Transitions */}
      <VideoTransition
        videoSrc="/svg and animations/train final animation.mp4"
        isActive={activeTransition === "train"}
        onComplete={handleTransitionComplete}
      />
      <VideoTransition
        videoSrc="/svg and animations/bus final animation.mp4"
        isActive={activeTransition === "bus"}
        onComplete={handleTransitionComplete}
        exitDirection="left"
      />
      <VideoTransition
        videoSrc="/svg and animations/air final.mp4"
        isActive={airportTransitionActive}
        onComplete={() => setAirportTransitionActive(false)}
        exitDirection="fade"
      />

      <AnimatePresence>
        {(viewMode === "dashboard" ||
          viewMode === "trains" ||
          viewMode === "transport") && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="absolute bottom-10 left-0 right-0 z-50 flex justify-center pointer-events-none"
            >
              <GlassPanel className="pointer-events-auto flex items-center space-x-3 p-3 rounded-2xl border border-white/40 shadow-2xl bg-white/90 dark:bg-black/60 backdrop-blur-xl">
                <NavButton
                  icon={MapIcon}
                  label="Map"
                  active={activeTab === "map"}
                  onClick={() => handleViewChange("dashboard")}
                />
                <NavButton
                  icon={Navigation}
                  label="Nav"
                  onClick={enterNavigationMode}
                  active={activeTab === "nav"}
                />
                <NavButton
                  icon={Bus}
                  label="Transport"
                  onClick={enterTransportMode}
                  active={viewMode === "transport"}
                />
                <NavButton
                  icon={Train}
                  label="Trains"
                  active={activeTab === "trains"}
                  onClick={enterTrainMode}
                />
                <NavButton
                  icon={Plane}
                  label="Airport"
                  active={viewMode === "airport"}
                  onClick={() => handleViewChange("airport")}
                />
                <div className="w-px h-10 bg-gray-400/30 mx-2"></div>
                <button
                  onClick={handleEmergencyClick}
                  className="p-4 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/50 animate-pulse transition-all active:scale-95"
                >
                  <Siren className="w-6 h-6" />
                </button>
              </GlassPanel>
            </motion.div>
          )}
      </AnimatePresence>

      <div
        ref={mapRef}
        className={`w-full transition-all duration-500 ease-in-out z-0 bg-gray-900 ${viewMode === "navigation" && arEnabled ? "h-[50vh] mt-[50vh]" : "h-full"}`}
      />
    </div>
  );
}

const EmergencyPage = ({ ...props }) => {
  return <EmergencySystem {...props} />;
};
