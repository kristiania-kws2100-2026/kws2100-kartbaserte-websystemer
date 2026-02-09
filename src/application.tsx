import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useEffect, useRef } from "react";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";

useGeographic();

const map = new Map({
  view: new View({ center: [10.7, 59.9], zoom: 12 }),
  layers: [new TileLayer({ source: new OSM() })],
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);
  return <div ref={mapRef}></div>;
}
