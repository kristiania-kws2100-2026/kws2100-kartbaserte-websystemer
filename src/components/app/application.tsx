import { Feature, Map, MapBrowserEvent, Overlay, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useEffect, useRef, useState } from "react";
import { useGeographic } from "ol/proj.js";

import { FeedMessage } from "../../../generated/gtfs-realtime.js";
import VectorLayer from "ol/layer/Vector.js";
import { Point } from "ol/geom.js";
import VectorSource from "ol/source/Vector.js";
import type { FeatureLike } from "ol/Feature.js";
import { Fill, RegularShape, Stroke, Style } from "ol/style.js";

import "ol/ol.css";

import "./application.css";

useGeographic();

const vehicleLayer = new VectorLayer({
  style: new Style({
    image: new RegularShape({
      points: 4,
      radius: 7,
      fill: new Fill({ color: "blue" }),
      stroke: new Stroke({ color: "white" }),
    }),
  }),
});

const map = new Map({
  layers: [new TileLayer({ source: new OSM() }), vehicleLayer],
  view: new View({ center: [10.7, 59.9], zoom: 10 }),
});
const overlay = new Overlay({ positioning: "top-center" });

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureLike[]>([]);
  useEffect(() => {
    map.setTarget(mapRef.current!);
    setInterval(() => {
      fetchData();
    }, 15_000);
    map.on("click", (e: MapBrowserEvent) => {
      const features = map.getFeaturesAtPixel(e.pixel, {});
      setSelectedFeatures(features);
      overlay.setPosition(e.coordinate);
    });
    map.addOverlay(overlay);
    overlay.setElement(overlayRef.current!);
  }, []);
  return (
    <div ref={mapRef}>
      <div ref={overlayRef}>
        Selected vehicles:{" "}
        <ul>
          {selectedFeatures
            .map((f) => f.getProperties())
            .map(({ routeId }) => (
              <li>{routeId}</li>
            ))}
        </ul>
      </div>
    </div>
  );
}

async function fetchData() {
  const res = await fetch(
    "https://api.entur.io/realtime/v1/gtfs-rt/vehicle-positions",
  );
  const features = FeedMessage.decode(
    new Uint8Array(await res.arrayBuffer()),
  ).entity.map((e) => {
    const { latitude, longitude, speed } = e.vehicle!.position!;
    const routeId = e.vehicle?.trip?.routeId!;
    const properties = { routeId, speed, type: "vehicle" };
    return new Feature({
      geometry: new Point([longitude, latitude]),
      ...properties,
    });
  });
  vehicleLayer.setSource(new VectorSource({ features }));
}

await fetchData();
