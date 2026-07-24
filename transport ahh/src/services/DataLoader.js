const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const DATA_DIR = path.join(__dirname, "../../"); // Data is in root based on previous `list_dir`

class DataLoader {
  constructor() {
    this.signals = [];
    this.metros = { lines: [], stations: [] };
    this.busRoutes = {}; // Map<routeId, { name: string, path: Array<[lat, lon]> }>
    this.stops = {}; // Map<stopId, { lat, lon, name }>
  }

  async loadAll() {
    console.log("Loading data...");
    await this.loadSignals();
    await this.loadMetros();
    await this.loadStops();
    await this.loadRoutes();
    await this.loadRouteMappings();
    await this.loadBusNetwork();
    console.log("Data loading complete.");
    return {
      signals: this.signals,
      metros: this.metros,
      busRoutes: this.busRoutes,
      stops: this.stops,
      routeNumbers: this.routeNumbers || [],
      routesList: this.routesList || [], // New List with Names
      routeStops: this.routeStops || {}
    };
  }

  async loadSignals() {
    const raw = fs.readFileSync(
      path.join(DATA_DIR, "traffic_signals_bengaluru.json")
    );
    const data = JSON.parse(raw);
    this.signals = data.signals;
    console.log(`Loaded ${this.signals.length} traffic signals.`);
  }

  async loadMetros() {
    const raw = fs.readFileSync(
      path.join(DATA_DIR, "namma_metro_bengaluru.json")
    );
    this.metros = JSON.parse(raw);
    
    // OVERWRITE Polyline with Station Coordinates
    // This ensures trains move exactly station-to-station (straight lines between stations)
    // which aligns perfectly with the visual map now.
    this.metros.lines.forEach(line => {
        if (line.stations && line.stations.length > 0) {
            // [lon, lat] format
            line.polyline = line.stations.map(s => [s.lon, s.lat]);
        }
    });

    console.log(`Loaded ${this.metros.lines.length} metro lines (w/ Stations path).`);
  }

  // Load GTFS Stops
  loadStops() {
    return new Promise((resolve) => {
      fs.createReadStream(path.join(DATA_DIR, "stops.csv"))
        .pipe(csv())
        .on("data", (row) => {
          this.stops[row.stop_id] = {
            id: row.stop_id,
            lat: parseFloat(row.stop_lat),
            lon: parseFloat(row.stop_lon),
            name: row.stop_name,
          };
        })
        .on("end", () => {
          console.log(`Loaded ${Object.keys(this.stops).length} bus stops.`);
          resolve();
        });
    });
  }

  // Map Routes to Stops via Trips
  async loadRouteMappings() {
      // 1. Map Trip -> Route
      const tripToRoute = {};
      await new Promise(resolve => {
          fs.createReadStream(path.join(DATA_DIR, "trips.csv"))
          .pipe(csv())
          .on("data", (row) => {
              if (row.trip_id && row.route_id) tripToRoute[row.trip_id] = row.route_id;
          })
          .on("end", resolve);
      });

      // 2. Map Route -> Set of Stops
      this.routeStops = {}; // route_id -> unique stop_ids[]
      await new Promise(resolve => {
          fs.createReadStream(path.join(DATA_DIR, "stop_times.csv"))
          .pipe(csv())
          .on("data", (row) => {
              const routeId = tripToRoute[row.trip_id];
              if (routeId && row.stop_id) {
                  if (!this.routeStops[routeId]) this.routeStops[routeId] = new Set();
                  this.routeStops[routeId].add(row.stop_id);
              }
          })
          .on("end", () => {
              // Convert Sets to Arrays for JSON serialization
              for(let r in this.routeStops) {
                  this.routeStops[r] = Array.from(this.routeStops[r]);
              }
              console.log(`Mapped stops for ${Object.keys(this.routeStops).length} routes.`);
              resolve();
          });
      });
  }

    // Load Bus Routes (for Route Numbers and Names)
    loadRoutes() {
        return new Promise((resolve) => {
            const routes = [];
            fs.createReadStream(path.join(DATA_DIR, "routes.csv"))
                .pipe(csv())
                .on("data", (row) => {
                    // route_id often holds the public number like '335E' or '500D' for BMTC in this dataset
                    // route_long_name holds "Origin - Destination"
                    if(row.route_id) {
                        routes.push({
                            id: row.route_id,
                            longName: row.route_long_name || ""
                        });
                    }
                })
                .on("end", () => {
                    this.routesList = routes; // Store full objects
                    this.routeNumbers = routes.map(r => r.id); // Keep simple list for backward compat if needed
                    console.log(`Loaded ${routes.length} route definitions from routes.csv.`);
                    resolve();
                });
        }); 
    }

    // Load Trips and StopTimes to build Route Paths
    async loadBusNetwork() {
        console.log("Skipping broken GTFS trip/route linkage. Using random stop-to-stop simulation.");
        // We just rely on this.stops being loaded
    }
}

module.exports = new DataLoader();
