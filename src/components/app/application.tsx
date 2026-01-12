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
const map = new Map({
  layers: [new TileLayer({ source: new OSM() }), fylkeLayer],
  view: new View({ center: [11, 59], zoom: 8 }),
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);

  return (
    <>
      <h1>My map application</h1>
      <div ref={mapRef}></div>
    </>
  );
}
