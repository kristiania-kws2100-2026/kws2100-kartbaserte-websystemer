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
import { GeoJSON, MVT } from "ol/format.js";
import VectorTileLayer from "ol/layer/VectorTile.js";
import VectorTileSource from "ol/source/VectorTile.js";
import proj4 from "proj4";
import { register } from "ol/proj/proj4.js";

proj4.defs(
  "EPSG:25833",
  "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
);
register(proj4);

useGeographic();
const kommuneLayer = new VectorTileLayer({
  source: new VectorTileSource({
    url: "/api/kommuner/{z}/{x}/{y}",
    format: new MVT(),
  }),
});
const grunnskoleLayer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON({ dataProjection: "EPSG:25833" }),
    url: "/api/grunnskoler",
  }),
});
const map = new Map({
  view: new View({ center: [11.07, 59.94], zoom: 13 }),
  layers: [new TileLayer({ source: new OSM() }), kommuneLayer, grunnskoleLayer],
});

function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => map.setTarget(mapRef.current!), []);
  return <div ref={mapRef}></div>;
}

createRoot(document.getElementById("app")!).render(<Application />);
