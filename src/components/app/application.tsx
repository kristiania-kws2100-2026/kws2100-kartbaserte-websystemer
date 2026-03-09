import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useGeographic } from "ol/proj.js";
import { useEffect, useRef } from "react";

import "ol/ol.css";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import { Fill, Stroke, Style } from "ol/style.js";

useGeographic();

function getColor(percent: number) {
  if (percent == 0) return `rgba(0, 255, 0, 0.75)`;

  percent = Math.min(1, Math.max(0, percent));
  const red = Math.floor(192 * percent);
  const green = Math.floor(192 * (1 - percent));
  return `rgba(${red}, ${green}, 0, ${0.75})`;
}

const map = new Map({
  layers: [
    new TileLayer({ source: new OSM() }),
    new VectorLayer({
      source: new VectorSource({
        url: "/api/grunnkrets",
        format: new GeoJSON(),
      }),
      style: (feature) =>
        new Style({
          stroke: new Stroke({ color: "black", width: 2 }),
          fill: new Fill({
            color: getColor(feature.getProperties().antall_adresser / 2000),
          }),
        }),
    }),
  ],
  view: new View({ center: [10.7, 59.9], zoom: 11 }),
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => map.setTarget(mapRef.current!), []);
  return <div ref={mapRef}></div>;
}
