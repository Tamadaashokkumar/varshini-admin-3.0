"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DashboardService } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

// --- City Coordinates ---
const CITY_COORDINATES: Record<string, [number, number]> = {
  /* ===================== INDIA – EXISTING CITIES ===================== */
  Delhi: [28.7041, 77.1025],
  Mumbai: [19.076, 72.8777],
  Kolkata: [22.5726, 88.3639],
  Chennai: [13.0827, 80.2707],
  Bangalore: [12.9716, 77.5946],
  Ahmedabad: [23.0225, 72.5714],
  Pune: [18.5204, 73.8567],
  Jaipur: [26.9124, 75.7873],
  Chandigarh: [30.7333, 76.7794],
  Bhopal: [23.2599, 77.4126],
  Indore: [22.7196, 75.8577],
  Lucknow: [26.8467, 80.9462],
  Kanpur: [26.4499, 80.3319],
  Patna: [25.5941, 85.1376],
  Ranchi: [23.3441, 85.3096],
  Bhubaneswar: [20.2961, 85.8245],
  Raipur: [21.2514, 81.6296],
  Guwahati: [26.1445, 91.7362],
  Shillong: [25.5788, 91.8933],
  Imphal: [24.817, 93.9368],
  Aizawl: [23.7271, 92.7176],
  Agartala: [23.8315, 91.2868],
  Itanagar: [27.0844, 93.6053],
  Kohima: [25.6747, 94.11],
  Gangtok: [27.3389, 88.6065],
  Thiruvananthapuram: [8.5241, 76.9366],
  Kochi: [9.9312, 76.2673],
  Coimbatore: [11.0168, 76.9558],
  Madurai: [9.9252, 78.1198],
  Tiruchirappalli: [10.7905, 78.7047],
  Vellore: [12.9165, 79.1325],
  Salem: [11.6643, 78.146],
  Udaipur: [24.5854, 73.7125],
  Jodhpur: [26.2389, 73.0243],
  Amritsar: [31.634, 74.8723],
  Ludhiana: [30.9, 75.8573],
  Jalandhar: [31.326, 75.5762],
  Dehradun: [30.3165, 78.0322],
  Haridwar: [29.9457, 78.1642],
  Shimla: [31.1048, 77.1734],
  Srinagar: [34.0837, 74.7973],
  Jammu: [32.7266, 74.857],
  Leh: [34.1526, 77.5771],

  /* ===================== ANDHRA PRADESH – ALL DISTRICTS ===================== */
  Visakhapatnam: [17.6868, 83.2185],
  Anakapalli: [17.69, 82.9988],
  "Alluri Sitharama Raju": [18.1149, 82.9946],
  Vizianagaram: [18.1067, 83.3956],
  Srikakulam: [18.2969, 83.8973],
  "Parvathipuram Manyam": [18.7833, 83.425],
  Kakinada: [16.989, 82.2475],
  "East Godavari": [16.9891, 81.784],
  "West Godavari": [16.7107, 81.0952],
  Eluru: [16.7107, 81.0952],
  NTR: [16.5062, 80.648],
  Krishna: [16.507, 80.646],
  Guntur: [16.3067, 80.4365],
  Bapatla: [15.9042, 80.4676],
  Palnadu: [16.2, 79.9],
  Prakasam: [15.5057, 80.0499],
  "SPSR Nellore": [14.4426, 79.9865],
  Kurnool: [15.8281, 78.0373],
  Nandyal: [15.4786, 78.4831],
  Anantapur: [14.6819, 77.6006],
  "Sri Sathya Sai": [14.165, 77.809],
  "YSR Kadapa": [14.4674, 78.8241],
  Annamayya: [14.0, 79.2],
  Tirupati: [13.6288, 79.4192],
  Chittoor: [13.2172, 79.1003],

  /* ===================== TELANGANA – ALL DISTRICTS ===================== */
  Hyderabad: [17.385, 78.4867],
  "Medchal Malkajgiri": [17.536, 78.481],
  Rangareddy: [17.2403, 78.4294],
  Sangareddy: [17.6297, 78.09],
  Vikarabad: [17.3381, 77.9044],
  Medak: [18.0453, 78.2608],
  Siddipet: [18.1019, 78.852],
  Warangal: [17.9689, 79.5941],
  Hanamkonda: [18.0, 79.5667],
  Jangaon: [17.726, 79.1524],
  Mahabubabad: [17.5983, 80.002],
  "Jayashankar Bhupalpally": [18.41, 79.874],
  Mulugu: [18.189, 80.0169],
  Karimnagar: [18.4386, 79.1288],
  "Rajanna Sircilla": [18.3886, 78.8105],
  Peddapalli: [18.6136, 79.3744],
  Jagitial: [18.7947, 78.9166],
  Nizamabad: [18.6732, 78.1],
  Kamareddy: [18.32, 78.35],
  Adilabad: [19.6633, 78.5323],
  Mancherial: [18.87, 79.44],
  Nirmal: [19.0976, 78.3432],
  "Komaram Bheem": [19.0333, 79.5],
  Mahabubnagar: [16.7375, 77.9859],
  Narayanpet: [16.75, 77.5],
  Nagarkurnool: [16.4821, 78.3247],
  Wanaparthy: [16.357, 78.0623],
  Gadwal: [16.2335, 77.7956],
  Khammam: [17.2473, 80.1514],
  "Bhadradri Kothagudem": [17.5531, 80.6192],
  Suryapet: [17.1405, 79.6236],
  "Yadadri Bhuvanagiri": [17.5154, 78.888],
};

// --- Helper: Get Color based on Intensity ---
const getMarkerColor = (count: number) => {
  if (count >= 50) return { color: "#dc2626", fill: "#ef4444" }; // High (Deep Red)
  if (count >= 20) return { color: "#d97706", fill: "#f59e0b" }; // Medium (Orange)
  return { color: "#2563eb", fill: "#3b82f6" }; // Low (Blue)
};

export default function SalesHeatmap() {
  const [data, setData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      try {
        const res = await DashboardService.getHeatmapData();
        setData(res.data?.data || []);
      } catch (e) {
        console.error("Heatmap error", e);
      }
    }
    fetchData();
  }, []);

  if (!mounted)
    return (
      <div className="h-[400px] w-full bg-white/5 animate-pulse rounded-2xl" />
    );

  return (
    <div className="relative h-[400px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Custom CSS for Popup Styling */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(5px) !important;
          color: #1a1a1a !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3) !important;
          font-weight: 500;
        }
        .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.95) !important;
        }
        .leaflet-container {
          font-family: inherit;
          background: #aad3df; /* Ocean color fallback */
        }
      `}</style>

      <MapContainer
        center={[22.5937, 78.9629]} // Centered on India
        zoom={4}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        scrollWheelZoom={false}
        dragging={true}
        className="z-0"
      >
        {/* 🔥 COLORFUL MAP TILES (Standard OpenStreetMap) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {data.map((cityData, idx) => {
          const coords = CITY_COORDINATES[cityData.city];
          if (!coords) return null;

          const { color, fill } = getMarkerColor(cityData.count);
          // Scale radius: slightly bigger for better visibility on colorful map
          const radius = Math.min(Math.max(cityData.count * 1.5, 10), 35);

          return (
            <CircleMarker
              key={idx}
              center={coords}
              pathOptions={{
                color: "white", // White border to stand out on colorful map
                weight: 2,
                fillColor: fill,
                fillOpacity: 0.8,
              }}
              radius={radius}
            >
              <Popup>
                <div className="p-1 min-w-[120px] text-gray-900">
                  <h4 className="text-sm font-bold text-black mb-1 uppercase tracking-wider border-b border-gray-200 pb-1">
                    {cityData.city}
                  </h4>
                  <div className="flex justify-between text-xs text-gray-600 mb-1 mt-2">
                    <span>Orders:</span>
                    <span className="text-blue-600 font-mono font-bold text-sm">
                      {cityData.count}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Revenue:</span>
                    <span className="text-green-600 font-mono font-bold text-sm">
                      {formatCurrency(cityData.revenue)}
                    </span>
                  </div>
                </div>
              </Popup>

              <Tooltip
                direction="top"
                offset={[0, -10]}
                opacity={1}
                className="bg-black text-white font-bold border-0 rounded px-2 py-1 text-xs shadow-lg"
              >
                {cityData.city}: {cityData.count}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* --- Legend Overlay (Dark Glass to contrast with bright map) --- */}
      <div className="absolute bottom-4 left-4 z-[400] bg-black/70 backdrop-blur-md border border-white/20 p-3 rounded-xl flex flex-col gap-2 shadow-xl">
        <span className="text-[10px] text-gray-200 uppercase font-bold tracking-wide">
          Sales Intensity
        </span>
        <div className="flex items-center gap-3 text-xs text-white font-medium">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500 border border-white"></span>{" "}
            Low
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-orange-500 border border-white"></span>{" "}
            Med
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-white animate-pulse"></span>{" "}
            High
          </div>
        </div>
      </div>
    </div>
  );
}
