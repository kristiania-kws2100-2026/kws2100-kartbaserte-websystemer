import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useEffect, useRef } from "react";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import { FeedMessage } from "../../../generated/gtfs-realtime.js";

useGeographic();

const map = new Map({
  layers: [new TileLayer({ source: new OSM() })],
  view: new View({ center: [10.7, 59.9], zoom: 10 }),
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => map.setTarget(mapRef.current!), []);
  return <div ref={mapRef}></div>;
}

async function fetchData() {
  const res = await fetch(
    "https://api.entur.io/realtime/v1/gtfs-rt/vehicle-positions",
  );
  const message = FeedMessage.decode(new Uint8Array(await res.arrayBuffer()));
  console.log(message);
}

await fetchData();
