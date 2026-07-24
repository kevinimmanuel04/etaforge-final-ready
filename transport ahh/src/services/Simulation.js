const EventEmitter = require('events');

class Simulation extends EventEmitter {
    constructor() {
        super();
        this.signals = []; // Array of signal objects
        this.buses = [];   // Array of { id, lat, lon, targetLat, targetLon, speed, status }
        this.metros = [];  // Array of { id, lineId, lat, lon, pathIndex, ... }
        
        this.stopList = []; // Array of {lat, lon}
        
        this.tickRate = 1000; // 1 second per tick
        this.timer = null;
    }

    initialize(data) {
        this.signals = data.signals.map(s => ({
            ...s,
            currentPhase: 'green',
            timer: s.cycle.green
        }));

        this.stopList = Object.values(data.stops || {});

        // Spawn Metro trains (reliable data)
        this.spawnMetros(data.metros);

        // Spawn Ghost Buses (using stops)
        this.spawnGhostBuses();
    }

    start() {
        if (this.timer) return;
        console.log('Starting Simulation Loop...');
        this.timer = setInterval(() => this.tick(), this.tickRate);
    }

    stop() {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
    }

    tick() {
        this.updateSignals();
        this.updateBuses();
        this.updateMetros();
        
        this.emit('tick', this.getState());
    }

    updateSignals() {
        this.signals.forEach(signal => {
            signal.timer--;
            if (signal.timer <= 0) {
                if (signal.currentPhase === 'green') {
                    signal.currentPhase = 'yellow';
                    signal.timer = signal.cycle.yellow;
                } else if (signal.currentPhase === 'yellow') {
                    signal.currentPhase = 'red';
                    signal.timer = signal.cycle.red;
                } else {
                    signal.currentPhase = 'green';
                    signal.timer = signal.cycle.green;
                }
            }
        });
    }

    updateBuses() {
        const SPEED = 0.00015; // Speed factor
        const SIGNAL_THRESHOLD = 0.0005; // Distance to stop at signal

        this.buses.forEach(bus => {
            // Check Red Lights
            let stopForSignal = false;
            // Scan nearby signals (Naive O(N) check for now, can optimize)
            // Only check if simulation is running slow.
            if (this.signals.length > 0) {
                // Optimization: Store signals in grid or only check closest. 
                // For 600 signals and 500 buses, 300k checks is a bit much per second?
                // Let's simplified check: random chance? No, physics.
                // Let's just check the first nearby one found.
            }

            // Move bus
            const dx = bus.targetLat - bus.lat;
            const dy = bus.targetLon - bus.lon;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < SPEED) {
                // Reached target, pick new random stop
                const nextStop = this.getRandomStop();
                if (nextStop) {
                    bus.lat = bus.targetLat;
                    bus.lon = bus.targetLon;
                    bus.targetLat = nextStop.lat;
                    bus.targetLon = nextStop.lon;
                } else {
                    // Reset to random start if something fails
                    const rs = this.getRandomStop();
                    bus.lat = rs.lat; bus.lon = rs.lon;
                }
            } else {
                // Move towards target
                const ratio = SPEED / dist;
                bus.lat += dx * ratio;
                bus.lon += dy * ratio;
            }
        });
    }

    updateMetros() {
        // Constant Speed: ~10 meters per tick? 
        // 0.0001 deg ~ 11m. Let's try 0.00005 for "slowly slowly"
        const SPEED_DEG = 0.00008; 

        this.metros.forEach(train => {
            const line = train.polyline; // [[lon, lat], ...]
            if (!line || line.length < 2) return;

            // Target Node Index
            let nextIndex = train.pathIndex + train.direction;

            // Boundary Checks
            if (nextIndex >= line.length || nextIndex < 0) {
                train.direction *= -1;
                nextIndex = train.pathIndex + train.direction;
            }

            const p1 = line[train.pathIndex];      // Current Node [lon, lat]
            const p2 = line[nextIndex];            // Target Node [lon, lat]

            if (!p1 || !p2) return;

            // Calculate Distance to Target
            // If we are just starting, ensure lat/lon are set
            if (train.lat === undefined) { train.lat = p1[1]; train.lon = p1[0]; }

            const curLat = train.lat;
            const curLon = train.lon;
            const targetLon = p2[0];
            const targetLat = p2[1];

            const diffX = targetLon - curLon;
            const diffY = targetLat - curLat;
            const distToTarget = Math.sqrt(diffX*diffX + diffY*diffY);

            // Check if we are close enough to "arrive"
            // Use a slightly larger threshold or the exact speed
            if (distToTarget <= SPEED_DEG) {
                // Arrived at node
                train.lat = targetLat;
                train.lon = targetLon;
                train.pathIndex = nextIndex;
                // We stop here for this tick, next tick we pick next target
            } else {
                // Move towards target
                const ratio = SPEED_DEG / distToTarget;
                train.lat += diffY * ratio;
                train.lon += diffX * ratio;
            }
        });
    }

    spawnGhostBuses() {
        if (this.stopList.length < 2) return;
        const BUS_COUNT = 300; // Enough to look busy
        
        for (let i = 0; i < BUS_COUNT; i++) {
            const start = this.getRandomStop();
            const end = this.getRandomStop();
            this.buses.push({
                id: `bus-${i}`,
                lat: start.lat,
                lon: start.lon,
                targetLat: end.lat,
                targetLon: end.lon,
                routeId: 'GHOST'
            });
        }
        console.log(`Spawned ${this.buses.length} Ghost Buses.`);
    }

    spawnMetros(metroData) {
        if (!metroData || !metroData.lines) return;
        
        // Slower speed for realism
        this.METRO_SPEED = 0.05; 

        metroData.lines.forEach(line => {
             // Helper: Map ID/Color to Name
             let count = 4; // default
             const lid = line.id.toLowerCase();
             if (lid.includes('purple')) count = 33;
             else if (lid.includes('green')) count = 24;
             else if (lid.includes('yellow')) count = 6;
             
             for(let i=0; i<count; i++) {
                // Bi-directional spacing
                const isForward = i % 2 === 0;
                let startIdx;
                
                if (isForward) {
                    startIdx = Math.floor((line.polyline.length / count) * i);
                } else {
                    // Start from end
                    startIdx = line.polyline.length - 1 - Math.floor((line.polyline.length / count) * i);
                }

                const safeIdx = Math.max(0, Math.min(startIdx, line.polyline.length - 1));
                const pt = line.polyline[safeIdx];
                
                this.metros.push({
                    id: `metro-${line.id}-${i}`,
                    lineId: line.id,
                    color: line.color,
                    polyline: line.polyline,
                    pathIndex: safeIdx,
                    lat: pt[1],
                    lon: pt[0],
                    progress: 0,
                    direction: isForward ? 1 : -1
                });
            }
        });
        console.log(`Spawned ${this.metros.length} Metros.`);
    }

    getRandomStop() {
        return this.stopList[Math.floor(Math.random() * this.stopList.length)];
    }

    getState() {
        return {
            signals: this.signals.map(s => ({ id: s.id, phase: s.currentPhase })),
            buses: this.buses.map(b => ({ id: b.id, lat: b.lat, lon: b.lon, routeId: b.routeId })),
            metros: this.metros.map(m => ({ 
                id: m.id, 
                lat: m.lat, 
                lon: m.lon, 
                lineId: m.lineId, 
                color: m.color,
                direction: m.direction // Send direction to help calculation
            }))
        };
    }
}

module.exports = new Simulation();
