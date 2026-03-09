import { createRoot } from "react-dom/client";
import { useEffect, useRef } from "react";
import { Map, View } from "ol";
import { useGeographic } from "ol/proj.js";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";

// @ts-ignore
import "ol/ol.css";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import VectorTileLayer from "ol/layer/VectorTile.js";
import VectorTileSource from "ol/source/VectorTile.js";

useGeographic();
const kommuneLayer = new VectorTileLayer({
  source: new VectorTileSource({
    url: "/api/kommuner/{z}/{x}/{y}",
    format: new GeoJSON(),
  }),
});
const grunnskoleLayer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: "/api/grunnskoler",
  }),
});
const backgroundLayer = new TileLayer({ source: new OSM() });
const map = new Map({
  view: new View({ center: [11.05, 59.95], zoom: 14 }),
  layers: [backgroundLayer, kommuneLayer, grunnskoleLayer],
});

function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => map.setTarget(mapRef.current!), []);
  return <div ref={mapRef}></div>;
}

createRoot(document.getElementById("app")!).render(<Application />);
