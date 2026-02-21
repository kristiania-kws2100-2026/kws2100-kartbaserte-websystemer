import { createRoot } from "react-dom/client";
import { useEffect, useRef } from "react";
import { Map, View } from "ol";
import { useGeographic } from "ol/proj.js";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";

import "ol/ol.css";

useGeographic();
const map = new Map({
  view: new View({ center: [10.7, 59.9], zoom: 10 }),
  layers: [new TileLayer({ source: new OSM() })],
});

function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => map.setTarget(mapRef.current!), []);
  return <div ref={mapRef}></div>;
}

createRoot(document.getElementById("app")!).render(<Application />);
