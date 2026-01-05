import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import { Circle, Fill, Stroke, Style } from "ol/style.js";

useGeographic();

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    new VectorLayer({
      source: new VectorSource({
        url: "/kws2100-kartbaserte-websystemer/geojson/fylker.geojson",
        format: new GeoJSON(),
      }),
      style: new Style({
        stroke: new Stroke({
          color: "black",
          width: 1,
        }),
      }),
    }),
    new VectorLayer({
      source: new VectorSource({
        url: "/kws2100-kartbaserte-websystemer/geojson/vgs.geojson",
        format: new GeoJSON(),
      }),
      style: new Style({
        image: new Circle({
          radius: 5,
          fill: new Fill({ color: "red" }),
          stroke: new Stroke({ color: "black", width: 2 }),
        }),
      }),
    }),
  ],
  view: new View({
    center: [11, 60],
    zoom: 8,
  }),
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);

  return (
    <>
      <h1>Hello Map Application in it's own file</h1>
      <div ref={mapRef}></div>
    </>
  );
}
