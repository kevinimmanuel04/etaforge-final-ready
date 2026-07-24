# 🚀 ETA Forge Live — Real-Time Multimodal Transit & Intelligent Navigation Platform

**ETA Forge Live** is an advanced, full-stack real-time transit intelligence platform. It integrates live Indian Railways train tracking, Bengaluru metro & bus city transport simulation, live airport flight monitoring with 3D cockpit views, AI-powered voice assistance (ElevenLabs), and smart emergency hospital finder (Gemini AI).

---

## 🌟 Features

### 🚄 Live Train Tracking & Real-Time Intelligence
- **Real-Time GPS & Station Radar**: Live tracking of trains across major routes with delay predictions, platform updates, and current speed.
- **Selenium Scraping Engine**: Automated backend tracking powered by Firebase Realtime Database.

### 🚌 Multimodal City Transport Simulator (Namma Metro & BMTC)
- **Live Signal & Bus/Metro Simulation**: Real-time traffic signal states, speed calculations, and interactive map boards for Bengaluru.
- **Dynamic Route Optimization**: Intelligent pathfinding across Bus, Metro, and walking transitions.

### ✈️ Airport & Live Flight Tracker
- **FlightRadar24 Integration**: Live radar tracking of commercial flights departing/arriving at Kempegowda International Airport (BLR) and major hubs.
- **Interactive Flight Cockpit View**: 3D perspective flight visualization and real-time altitude/speed statistics.

### 🎙️ AI Voice & Emergency Intelligence
- **ElevenLabs Voice Assistant**: Natural voice guidance for station updates, delays, and navigation.
- **Gemini AI Emergency Hospital Finder**: Instant AI location query for nearest hospitals based on live coordinates.

---

## 🏗️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, TailwindCSS, Framer Motion, Lucide Icons, Google Maps JavaScript API |
| **Transport Backend** | Node.js, Express, Socket.io, CSV Data Loaders |
| **Train Backend** | Python 3, Selenium WebDriver, Firebase Admin SDK, Chrome Headless |
| **Airport Backend** | Python 3, FlightRadar24 API, Firebase Firestore |
| **Database & Cloud** | Firebase Realtime Database & Cloud Firestore |
| **AI & Voice Services** | Google Gemini 1.5 Flash AI, ElevenLabs Conversational Voice AI |

---

## 📁 Repository Structure

```text
etaforge-final-ready/
├── src/                          # Main React Vite Frontend Application
│   ├── App.jsx                   # Primary Dashboard & Navigation Hub
│   ├── TrainsPage.jsx            # Indian Railways Live Tracking Interface
│   ├── TransportPage.jsx         # Namma Metro & Bus City Transport Interface
│   └── components/               # UI Components (Calendar, TimePicker, etc.)
├── airport/                      # Airport Tracking Subsystem
│   ├── tracker.py                # Python FlightRadar24 scraper & Firestore sync
│   ├── src/                      # Airport Frontend Cockpit View
│   └── service-account.json.example # Firebase Service Account Template
├── train backend/                # Railway Backend Subsystem
│   ├── train_firebase.py         # Selenium Railway Scraper & Firebase RTDB Sync
│   ├── stations_db.json          # Pre-configured Station Database
│   └── service-account.json.example # Firebase Service Account Template
├── transport ahh/                # City Transport Subsystem
│   ├── src/index.js              # Express + Socket.io Live Simulation Backend
│   └── *.json, *.csv             # Metro & Traffic Signal Data Feeds
├── .env.example                  # Environment Variables Template
├── package.json                  # Main Unified Package Manifest
├── vite.config.js                # Vite Bundler Configuration
└── README.md                     # Project Documentation
```

---

## 🔐 Security & Environment Configuration

All sensitive API keys and credentials are strictly isolated into environment variables.

### 1. Copy Environment File Template
Create a `.env` file in the root directory by copying `.env.example`:
```bash
cp .env.example .env
```

### 2. Configure Your API Keys in `.env`
```env
# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Firebase Web Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=etaforge-live.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://etaforge-live-default-rtdb.asia-southeast1.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=etaforge-live
VITE_FIREBASE_STORAGE_BUCKET=etaforge-live.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=14242983734
VITE_FIREBASE_APP_ID=1:14242983734:web:cda6c57463217ba2700d97

# Gemini AI & ElevenLabs Voice Keys
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_ELEVEN_LABS_API_KEY=your_elevenlabs_api_key
```

### 3. Firebase Service Account Keys (Backend)
If running custom Firebase synchronization scripts, place your Firebase Admin `service-account.json` file inside `airport/` and `train backend/`. Sample templates are provided in `service-account.json.example`.

> ⚠️ **Security Note**: `.env` files and `service-account.json` are included in `.gitignore` to prevent accidental credential leakage to GitHub.

---

## ⚡ How to Start and Run the App

### Prerequisites
Make sure you have installed:
- **Node.js** (v18.x or higher)
- **Python** (v3.9 or higher) with `pip`
- **Google Chrome** (required for Selenium headless train tracking)

### Step 1: Install Dependencies

1. **Install Node.js Frontend & Backend Dependencies**:
   ```bash
   npm install
   cd "transport ahh" && npm install && cd ..
   ```

2. **Install Python Backend Dependencies**:
   ```bash
   pip install firebase-admin FlightRadar24 selenium webdriver-manager python-dotenv requests
   ```

---

### Step 2: Run the Full Platform (Single Command)

To launch **all 4 services concurrently** (Train Backend, Transport Backend, Airport Backend, and Frontend):

```bash
npm start
```

This starts:
1. `TRAIN`: Python Train Live Tracking Backend (`python train backend/train_firebase.py`)
2. `TRANSPORT`: Node.js Transport Simulator Backend (`node transport ahh/src/index.js`)
3. `AIRPORT`: Python Airport Tracker Backend (`python airport/tracker.py`)
4. `FRONTEND`: Vite Frontend Server (`http://localhost:5173`)

Open your browser and navigate to:
```text
http://localhost:5173
```

---

## 🚀 How to Publish to GitHub

The repository is fully pre-configured for GitHub.

1. **Stage and Commit Changes**:
   ```bash
   git add .
   git commit -m "Initial release of ETA Forge Live with security hardening"
   ```

2. **Connect to GitHub Remote & Push**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/etaforge-live.git
   git branch -M main
   git push -u origin main
   ```

Alternatively, open VS Code Source Control panel and click **Publish to GitHub**.

---

## 📜 License
MIT License. Created for SDC Full Project / ETA Forge Platform.
