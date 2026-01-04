import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import { OSM } from "ol/source.js";
import TileLayer from "ol/layer/Tile.js";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import "./application.css";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";

useGeographic();

const map = new Map({
  layers: [
    new TileLayer({ source: new OSM() }),
    new VectorLayer({
      source: new VectorSource({
        url: `${import.meta.env.BASE_URL}/geojson/fylker.geojson`,
        format: new GeoJSON(),
      }),
    }),
    new VectorLayer({
      source: new VectorSource({
        url: `${import.meta.env.BASE_URL}/geojson/vgs.geojson`,
        format: new GeoJSON(),
      }),
    }),
  ],
  view: new View({
    center: [11, 60],
    zoom: 9,
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
