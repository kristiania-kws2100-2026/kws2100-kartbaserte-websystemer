import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useEffect, useRef } from "react";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import VectorTileSource from "ol/source/VectorTile.js";
import { GeoJSON, MVT } from "ol/format.js";
import VectorTileLayer from "ol/layer/VectorTile.js";

useGeographic();

const map = new Map({
  layers: [
    new TileLayer({ source: new OSM() }),
    new VectorLayer({
      source: new VectorSource({
        url: "/api/grunnskole",
        format: new GeoJSON(),
      }),
    }),
    new VectorTileLayer({
      source: new VectorTileSource({
        url: "/api/adresse/{z}/{x}/{y}",
        format: new MVT(),
      }),
    }),
  ],
  view: new View({ center: [10.7, 59.9], zoom: 8 }),
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => map.setTarget(mapRef.current!));
  return <div ref={mapRef}></div>;
}
