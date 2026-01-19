import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import "./application.css";

useGeographic();

const map = new Map({
  layers: [new TileLayer({ source: new OSM() })],
  view: new View({ zoom: 9, center: [10, 59.5] }),
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);

  return (
    <>
      <h1>Kart over administrative områder i Norge</h1>
      <div ref={mapRef}></div>
    </>
  );
}
