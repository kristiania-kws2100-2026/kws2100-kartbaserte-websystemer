import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useEffect, useRef } from "react";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import { FeedMessage } from "../../../generated/gtfs-realtime.js";
import VectorLayer from "ol/layer/Vector.js";
import { Pointer } from "ol/interaction.js";
import { Point } from "ol/geom.js";
import VectorSource from "ol/source/Vector.js";

useGeographic();

const vehicleLayer = new VectorLayer();

const map = new Map({
  layers: [new TileLayer({ source: new OSM() }), vehicleLayer],
  view: new View({ center: [10.7, 59.9], zoom: 10 }),
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    map.setTarget(mapRef.current!);
    setInterval(() => {
      fetchData();
    }, 15_000);
  }, []);
  return <div ref={mapRef}></div>;
}

async function fetchData() {
  const res = await fetch(
    "https://api.entur.io/realtime/v1/gtfs-rt/vehicle-positions",
  );
  const features = FeedMessage.decode(
    new Uint8Array(await res.arrayBuffer()),
  ).entity.map((e) => {
    const { latitude, longitude } = e.vehicle!.position!;
    return new Feature({ geometry: new Point([longitude, latitude]) });
  });
  console.log(features);
  vehicleLayer.setSource(new VectorSource({ features }));
}

await fetchData();
