import { createRoot } from "react-dom/client";
import { useEffect, useRef } from "react";
import { Map, View } from "ol";
import { useGeographic } from "ol/proj.js";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";

import "ol/ol.css";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";

useGeographic();
const map = new Map({
  view: new View({ center: [10.7, 59.9], zoom: 10 }),
  layers: [
    new TileLayer({ source: new OSM() }),
    new VectorLayer({
      source: new VectorSource({
        url: "/geojson/kommuner.geojson",
        format: new GeoJSON(),
      }),
    }),
  ],
});

function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => map.setTarget(mapRef.current!), []);
  return <div ref={mapRef}></div>;
}

createRoot(document.getElementById("app")!).render(<Application />);
