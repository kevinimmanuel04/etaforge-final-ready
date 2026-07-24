const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const DataLoader = require('./services/DataLoader');
const Simulation = require('./services/Simulation');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for the mock frontend
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

const PORT = 3000;

// Initialize
(async () => {
    try {
        const data = await DataLoader.loadAll();
        Simulation.initialize(data);
        Simulation.start();
    } catch (err) {
        console.error("Failed to start simulation:", err);
    }
})();

// API Endpoints

// 1. Static Geometry Data (Routes, Signals locations, Stations)
// Frontend calls this ONCE at startup to draw the "board"
app.get('/api/static', (req, res) => {
    res.json({
        signals: DataLoader.signals,
        metroLines: DataLoader.metros.lines,
        busRoutes: DataLoader.busRoutes,
        stops: DataLoader.stops // Export stops
    });
});

// 2. Live State (Positions, Signal Colors)
// Frontend polls this or uses Socket.io
app.get('/api/live', (req, res) => {
    res.json(Simulation.getState());
});

// Socket.io for Real-time push (Optional but better)
io.on('connection', (socket) => {
    console.log('Frontend connected:', socket.id);
    
    // Send immediate state
    socket.emit('state', Simulation.getState());
});

// Pump simulation events to Sockets
Simulation.on('tick', (state) => {
    io.emit('state', state);
});

server.listen(PORT, () => {
    console.log(`ETAForge Backend running on http://localhost:${PORT}`);
});
