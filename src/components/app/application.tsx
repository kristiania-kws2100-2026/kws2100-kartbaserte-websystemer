import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useGeographic } from "ol/proj.js";

useGeographic();

const map = new Map({
  layers: [new TileLayer({ source: new OSM() })],
  view: new View({ center: [11, 59], zoom: 8 }),
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    /*
    mapRef.current!.innerText = "Hello JavaScript";
    mapRef.current!.style.backgroundColor = "lightblue";
    mapRef.current!.style.height = "100%";

     */
    map.setTarget(mapRef.current!);
  }, []);

  return <div ref={mapRef}>MAP HERE</div>;
}
