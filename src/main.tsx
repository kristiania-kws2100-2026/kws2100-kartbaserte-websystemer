import { createRoot } from "react-dom/client";
import { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import { Stroke, Style, Text } from "ol/style.js";

useGeographic();

const layers = [
  new TileLayer({ source: new OSM() }),
  new VectorLayer({
    source: new VectorSource({
      url: "/geojson/kommuner.geojson",
      format: new GeoJSON(),
    }),
    style: (f) =>
      new Style({
        stroke: new Stroke({
          width: 3,
          color: "black",
        }),
        text: new Text({
          text: f.getProperties()["name"],
        }),
      }),
  }),
  new VectorLayer({
    source: new VectorSource({
      url: "/api/grunnskoler",
      format: new GeoJSON(),
    }),
  }),
];
const map = new Map({
  view: new View({ center: [10.7, 59.9], zoom: 8 }),
  layers,
});

function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => map.setTarget(mapRef.current!), []);
  return <div ref={mapRef}></div>;
}

createRoot(document.getElementById("app")!).render(<Application />);
