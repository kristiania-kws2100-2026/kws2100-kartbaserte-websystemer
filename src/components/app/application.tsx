import { Feature, Map, MapBrowserEvent, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import VectorLayer from "ol/layer/Vector.js";
import { useEffect, useRef, useState } from "react";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import { FeedMessage } from "../../../generated/gtfs-realtime.js";
import { Point } from "ol/geom.js";
import VectorSource from "ol/source/Vector.js";
import { Fill, RegularShape, Stroke, Style } from "ol/style.js";
import type { FeatureLike } from "ol/Feature.js";

useGeographic();

const vehicleLayer = new VectorLayer({
  style: (feature) => {
    const ruteNr: string = feature.getProperties().ruteNr;
    console.log(ruteNr);
    let color = "blue";
    if (ruteNr.startsWith("VY")) {
      color = "red";
    }
    return new Style({
      image: new RegularShape({
        radius: 10,
        points: 4,
        fill: new Fill({ color }),
        stroke: new Stroke({ color: "white" }),
      }),
    });
  },
});
const map = new Map({
  layers: [new TileLayer({ source: new OSM() }), vehicleLayer],
  view: new View({ center: [10.7, 59.9], zoom: 10 }),
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureLike[]>([]);
  useEffect(() => {
    map.setTarget(mapRef.current!);
    setInterval(() => {
      loadVehicles();
    }, 10_000);
    map.on("click", (e: MapBrowserEvent) => {
      const features = map.getFeaturesAtPixel(e.pixel);
      setSelectedFeatures(features);
    });
  }, []);
  return (
    <div ref={mapRef}>
      <div>
        Selected vehicles:{" "}
        <div>
          {selectedFeatures
            .map((p) => p.getProperties())
            .map(({ geometry, ...properties }) => (
              <pre>{JSON.stringify(properties)}</pre>
            ))}
        </div>
      </div>
    </div>
  );
}

async function loadVehicles() {
  const res = await fetch(
    "https://api.entur.io/realtime/v1/gtfs-rt/vehicle-positions",
  );
  const message = FeedMessage.decode(Uint8Array.from(await res.bytes()));
  const features = message.entity.map((e) => {
    const { routeId } = e.vehicle?.trip!;
    const { latitude, longitude } = e.vehicle?.position!;
    return new Feature({
      ruteNr: routeId,
      geometry: new Point([longitude, latitude]),
    });
  });
  vehicleLayer.setSource(new VectorSource({ features }));
}
loadVehicles();
