import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import { OSM } from "ol/source.js";
import TileLayer from "ol/layer/Tile.js";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import "./application.css";

useGeographic();

const map = new Map({
  layers: [new TileLayer({ source: new OSM() })],
  view: new View({
    center: [11, 60],
    zoom: 10,
  }),
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);
  return (
    <>
      <h1>Hello OpenLayers</h1>
      <div ref={mapRef} />
    </>
  );
}
