import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html, Stage, PerspectiveCamera } from '@react-three/drei';
import { Wind, Droplets, Thermometer, CloudRain, X, Map } from 'lucide-react';


// --- 1. The Mountain Loader Component ---
function MountainModel({ url }) {
  const { scene } = useGLTF(url);
  // Scale down the model if it's too large
  return <primitive object={scene} scale={2} />;
}

// --- 2. Interactive Sensor Dot ---
function SensorNode({ position, data, onSelect, isActive }) {
  const [hovered, setHovered] = useState(false);
  
  // Scale sensors to match the massive mountain model
  const sensorSize = 300; // Much larger for big model
  const ringSize = 1400;
  
  return (
    <group position={position}>
      <mesh 
        onClick={() => onSelect(data)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[hovered ? sensorSize * 1.3 : sensorSize, 32, 32]} />
        <meshStandardMaterial 
          color={data.risk === "HIGH" ? "#ef4444" : data.risk === "MEDIUM" ? "#f59e0b" : "#10b981"} 
          emissive={data.risk === "HIGH" ? "#ef4444" : data.risk === "MEDIUM" ? "#f59e0b" : "#10b981"} 
          emissiveIntensity={isActive ? 5 : hovered ? 3 : 2} 
        />
      </mesh>
      
      {/* Pulsing ring effect */}
      {(isActive || hovered) && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ringSize, ringSize + 100, 32]} />
          <meshBasicMaterial 
            color={data.risk === "HIGH" ? "#ef4444" : data.risk === "MEDIUM" ? "#f59e0b" : "#10b981"}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}

// --- 3. Camera Position Logger ---
function CameraLogger() {
  const { camera } = useThree();
  const controlsRef = useRef();
  
  useEffect(() => {
    if (!controlsRef.current) return;
    
    const handleChange = () => {
      const pos = camera.position;
      const distance = Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2);
      
      console.log('═══════════════════════════════════════');
      console.log('📷 CAMERA POSITION:', {
        x: pos.x.toFixed(2),
        y: pos.y.toFixed(2),
        z: pos.z.toFixed(2)
      });
      console.log('🔍 ZOOM DISTANCE:', distance.toFixed(2));
      console.log('═══════════════════════════════════════');
    };
    
    controlsRef.current.addEventListener('change', handleChange);
    
    return () => {
      if (controlsRef.current) {
        controlsRef.current.removeEventListener('change', handleChange);
      }
    };
  }, [camera]);
  
  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableRotate
      enablePan
      enableZoom
      minDistance={1000}
      maxDistance={60000}
    />
  );
}

// --- 4. Main Dashboard ---
export default function MeghaGaahDashboard() {
  const [selectedID, setSelectedID] = useState('m1');
  const [activeSensor, setActiveSensor] = useState(null);

  // Manually positioned sensors ON the terrain
  // You need to adjust these Y values to match your terrain height at each X,Z position
  const manualSensorPositions = {
    m1: [
      
      { x: 12519, y: 8663, z: -2433, label: "North Ridge" },
      { x: 1500, y: 9963, z: -1000, label: "South Peak" },
      { x: 0, y: 9463, z: 2000, label: "Base Camp" },
      { x: -9500, y: 10050, z: 0, label: "Summit Point" },
      { x: 7000, y: 11663, z: 1500, label: "Valley Floor" },
      { x: -1800, y: 9663, z: -9000, label: "East Slope" },
      { x: 9500, y: 9063, z: -5800, label: "South Base" }
    ],
    m2: [
      { x: 12519, y: 5863, z: -2433, label: "North Ridge" },
      { x: 1500, y: 6863, z: -1000, label: "South Peak" },
      { x: -4500, y: 7463, z: 2000, label: "Base Camp" },
      { x: -16500, y: 6550, z: 0, label: "Summit Point" },
      // { x: 7000, y: 11663, z: 1500, label: "Valley Floor" },
      // { x: -1800, y: 9663, z: -9000, label: "East Slope" },
      // { x: 9500, y: 9063, z: -5800, label: "South Base" }
    ]
  };
  
  const generateSensorsFromPositions = (positions, mountainId) => {
    return positions.map((pos, i) => ({
      id: mountainId * 100 + i,
      label: pos.label,
      pos: [pos.x, pos.y, pos.z],
      temp: `${(Math.random() * 15 + 5).toFixed(1)}°C`,
      hum: `${(Math.random() * 30 + 60).toFixed(0)}%`,
      wind: `${(Math.random() * 30 + 10).toFixed(0)} km/h`,
      moisture: `${(Math.random() * 5 + 7).toFixed(1)} g/m³`,
      risk: Math.random() > 0.7 ? "HIGH" : Math.random() > 0.4 ? "MEDIUM" : "LOW"
    }));
  };

  const mountains = {
    m1: {
      name: "Kashmir Valley",
      path: "/mountain1.glb",
      sensors: generateSensorsFromPositions(manualSensorPositions.m1, 1)
    },
    m2: {
      name: "Mandi Ridge",
      path: "/mountain2.glb",
      sensors: generateSensorsFromPositions(manualSensorPositions.m2, 2)
    }
  };

  const current = mountains[selectedID];

  return (
    <div className="relative w-full h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Header Overlay */}
      <nav className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center gap-3">
          <CloudRain className="text-emerald-600 w-7 h-7" />
          <h1 className="text-xl font-black tracking-tight uppercase">Megha<span className="text-emerald-600">Gaah</span></h1>
        </div>
        <div className="hidden md:flex gap-6 font-semibold text-sm text-slate-500">
          <a href="#" className="text-emerald-600 border-b-2 border-emerald-600 pb-1">Explore</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Analysis</a>
          <a href="#" className="hover:text-emerald-600 transition-colors">Alerts</a>
        </div>
      </nav>

      {/* Control Panel: Left Side */}
      <div className="absolute top-20 left-4 z-20 w-64 max-w-[calc(100vw-2rem)]">
        <div className="p-4 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl border border-slate-200">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
            <Map size={14} /> Select Region
          </label>
          <select 
            value={selectedID}
            onChange={(e) => {
              setSelectedID(e.target.value);
              setActiveSensor(null);
            }}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-emerald-500/30 outline-none font-medium cursor-pointer text-sm"
          >
            <option value="m1">Kashmir Valley (mountain1)</option>
            <option value="m2">Mandi Ridge (mountain2)</option>
          </select>
        </div>
      </div>

      {/* Sensor Data Card: Right Side */}
      {activeSensor && (
        <div className="absolute top-20 right-4 z-20 w-80 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] overflow-y-auto bg-white/95 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-slate-200">
          <div className="flex justify-between items-start mb-5">
            <div className="flex-1 min-w-0">
              <h2 className="font-black text-xl text-slate-800 tracking-tight truncate">{activeSensor.label}</h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">Sensor ID: {activeSensor.id}</p>
            </div>
            <button 
              onClick={() => setActiveSensor(null)} 
              className="p-2 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0 ml-2"
            >
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="space-y-2.5">
            <MetricRow 
              icon={<Thermometer className="text-orange-500" size={18} />} 
              label="Temperature" 
              value={activeSensor.temp} 
            />
            <MetricRow 
              icon={<Droplets className="text-blue-500" size={18} />} 
              label="Humidity" 
              value={activeSensor.hum} 
            />
            <MetricRow 
              icon={<Droplets className="text-cyan-500" size={18} />} 
              label="Air Moisture" 
              value={activeSensor.moisture} 
            />
            <MetricRow 
              icon={<Wind className="text-emerald-500" size={18} />} 
              label="Wind Speed" 
              value={activeSensor.wind} 
            />
          </div>
          
          <div className="mt-5 pt-4 border-t border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cloudburst Risk</span>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
              activeSensor.risk === "HIGH" 
                ? "bg-red-100 text-red-700" 
                : activeSensor.risk === "MEDIUM"
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }`}>
              {activeSensor.risk}
            </span>
          </div>

          {/* Mini Chart Placeholder */}
          <div className="mt-4 p-3 bg-slate-50 rounded-xl">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">24h Trend</p>
            <div className="h-20 flex items-end justify-around gap-1">
              {[...Array(12)].map((_, i) => {
                const height = Math.random() * 60 + 30;
                return (
                  <div 
                    key={i} 
                    className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-lg transition-all hover:opacity-70"
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3D Viewport */}
      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas shadows dpr={[1, 2]} style={{ background: "#f8fafc" }}>
          <PerspectiveCamera makeDefault position={[-1330.18, 33439.96, 23434.66]} />
          
          <Suspense fallback={<Html center>Unpacking Terrain...</Html>}>
            <Stage environment="forest" intensity={0.6} contactShadow={false}>
              <MountainModel url={current.path} />
              
              {current.sensors.map(sensor => (
                <SensorNode 
                  key={sensor.id} 
                  position={sensor.pos} 
                  data={sensor} 
                  onSelect={setActiveSensor}
                  isActive={activeSensor?.id === sensor.id}
                />
              ))}
            </Stage>
          </Suspense>

          <CameraLogger />
        </Canvas>
      </div>
    </div>
  );
}

// UI Helper
function MetricRow({ icon, label, value }) {
  return (
    <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100 hover:bg-slate-100/50 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">{icon}</div>
        <span className="text-sm font-semibold text-slate-600 truncate">{label}</span>
      </div>
      <span className="text-base font-black text-slate-900 ml-2 flex-shrink-0">{value}</span>
    </div>
  );
}