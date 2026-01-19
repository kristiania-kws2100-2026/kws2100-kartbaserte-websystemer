import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import "./application.css";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";

useGeographic();

const fylkeLayer = new VectorLayer({
  source: new VectorSource({
    url: "/kws2100-kartbaserte-websystemer/geojson/fylker.geojson",
    format: new GeoJSON(),
  }),
});
const layers = [new TileLayer({ source: new OSM() }), fylkeLayer];

const map = new Map({
  layers,
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
