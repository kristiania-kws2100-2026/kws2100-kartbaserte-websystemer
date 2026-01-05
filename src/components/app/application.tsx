import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: [11, 70],
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
      <div ref={mapRef}>Here is the map</div>
    </>
  );
}
