import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useGeographic } from "ol/proj.js";

// @ts-ignore
import "ol/ol.css";

useGeographic();

const view = new View({ center: [10.9, 59.9], zoom: 12 });
const map = new Map({
  view: view,
  layers: [new TileLayer({ source: new OSM() })],
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    map.setTarget(mapRef.current!);
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      view.animate({ center: [longitude, latitude] });
    });
  }, []);
  return <div ref={mapRef}></div>;
}
