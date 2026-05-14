"use client";

import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import { motion } from "motion/react";

// Natural Earth countries TopoJSON hosted on jsdelivr CDN.
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type City = {
  name: string;
  country: string;
  coords: [number, number]; // [lon, lat]
  diaspora: string;
};

const CARACAS: [number, number] = [-66.9036, 10.4806];

const CITIES: City[] = [
  { name: "Madrid", country: "España", coords: [-3.7038, 40.4168], diaspora: "500k+" },
  { name: "Bogotá", country: "Colombia", coords: [-74.0721, 4.711], diaspora: "1.2M+" },
  { name: "Buenos Aires", country: "Argentina", coords: [-58.3816, -34.6037], diaspora: "200k+" },
  { name: "Miami", country: "Estados Unidos", coords: [-80.1918, 25.7617], diaspora: "400k+" },
  { name: "Lima", country: "Perú", coords: [-77.0428, -12.0464], diaspora: "1.5M+" },
  { name: "Santiago", country: "Chile", coords: [-70.6693, -33.4489], diaspora: "450k+" },
  { name: "Ciudad de Panamá", country: "Panamá", coords: [-79.5167, 8.9833], diaspora: "150k+" },
  { name: "Houston", country: "Estados Unidos", coords: [-95.3698, 29.7604], diaspora: "120k+" },
  { name: "Quito", country: "Ecuador", coords: [-78.4678, -0.1807], diaspora: "500k+" },
  { name: "Ciudad de México", country: "México", coords: [-99.1332, 19.4326], diaspora: "100k+" },
];

export function DiasporaMap() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
      className="card p-4 md:p-6 overflow-hidden"
      style={{ background: "var(--color-bg-elev)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-[color:var(--color-fg-soft)]">
            Diáspora venezolana
          </div>
          <div className="font-display text-2xl font-bold text-[color:var(--color-brand-700)] leading-tight">
            7 a 8 millones <span className="text-[color:var(--color-fg-muted)] text-base font-normal">de venezolanos viven fuera</span>
          </div>
        </div>
        <span className="chip">10 ciudades</span>
      </div>

      <div className="relative w-full aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/9] rounded-lg overflow-hidden bg-gradient-to-br from-[color:var(--color-brand-50)] to-[color:var(--color-bg)]">
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{ scale: 170, center: [-50, 5] }}
          width={800}
          height={600}
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#f7d9cb"
                  stroke="#e7e3d8"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#e0856e", outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Arcs Caracas → cada ciudad */}
          {CITIES.map((c, i) => (
            <Line
              key={`line-${c.name}`}
              from={CARACAS}
              to={c.coords}
              stroke="#c4513a"
              strokeWidth={1}
              strokeOpacity={0.4}
              strokeLinecap="round"
              strokeDasharray="3,3"
              style={{
                animation: `dash-flow 12s linear infinite`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}

          {/* Origen Caracas */}
          <Marker coordinates={CARACAS}>
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <circle r={11} fill="#c4513a" fillOpacity={0.15}>
                <animate attributeName="r" values="11;22;11" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="fill-opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle r={6} fill="#8a3722" stroke="#faf8f3" strokeWidth={1.8} />
              <text
                x={11}
                y={4}
                fontSize={12}
                fontWeight={800}
                fill="#0b1f1c"
                style={{ pointerEvents: "none", fontFamily: "Plus Jakarta Sans, system-ui", paintOrder: "stroke", stroke: "#faf8f3", strokeWidth: 3 }}
              >
                Caracas
              </text>
            </motion.g>
          </Marker>

          {/* Cities */}
          {CITIES.map((c, i) => (
            <Marker key={c.name} coordinates={c.coords}>
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.08, ease: "backOut" }}
              >
                <circle r={8} fill="#e0856e" fillOpacity={0.25}>
                  <animate attributeName="r" values="8;14;8" dur="3s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                  <animate attributeName="fill-opacity" values="0.45;0;0.45" dur="3s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                </circle>
                <circle r={4.2} fill="#c4513a" stroke="#faf8f3" strokeWidth={1.5} />
                <text
                  x={7}
                  y={3}
                  fontSize={10}
                  fontWeight={700}
                  fill="#0b1f1c"
                  style={{ pointerEvents: "none", fontFamily: "Plus Jakarta Sans, system-ui", paintOrder: "stroke", stroke: "#faf8f3", strokeWidth: 2.5 }}
                >
                  {c.name}
                </text>
                <text
                  x={7}
                  y={14}
                  fontSize={8.5}
                  fontWeight={600}
                  fill="#8a3722"
                  style={{ pointerEvents: "none", fontFamily: "Plus Jakarta Sans, system-ui", paintOrder: "stroke", stroke: "#faf8f3", strokeWidth: 2.5 }}
                >
                  {c.diaspora}
                </text>
              </motion.g>
            </Marker>
          ))}
        </ComposableMap>

        {/* Overlay floating label bottom-left */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-3 left-3 rounded-full bg-[color:var(--color-fg)] text-white px-3 py-1.5 text-xs font-medium shadow-md flex items-center gap-2"
        >
          <span className="size-2 rounded-full bg-[color:var(--color-accent)] animate-pulse" />
          Tour 3D disponible en cada inmueble
        </motion.div>
      </div>

      <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-3 text-center text-xs">
        <Stat top="1.5M" bottom="Perú" />
        <Stat top="1.2M" bottom="Colombia" />
        <Stat top="500k" bottom="Ecuador" />
        <Stat top="500k" bottom="España" />
        <Stat top="400k" bottom="EE.UU." />
      </div>

      <style>{`
        @keyframes dash-flow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -40; }
        }
      `}</style>
    </motion.div>
  );
}

function Stat({ top, bottom }: { top: string; bottom: string }) {
  return (
    <div>
      <div className="font-display text-lg font-bold text-[color:var(--color-brand-700)]">{top}</div>
      <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-fg-soft)]">{bottom}</div>
    </div>
  );
}
