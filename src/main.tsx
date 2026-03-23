import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import { Map, MapBrowserEvent, Overlay, View } from "ol";
import { useGeographic } from "ol/proj.js";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";

// @ts-ignore
import "ol/ol.css";
import type { FeatureLike } from "ol/Feature.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import { Fill, Stroke, Style } from "ol/style.js";

useGeographic();
const backgroundLayer = new TileLayer({ source: new OSM() });

function getColor(properties: any) {
  const antall_with_no_school_within_750m = parseInt(
    properties.antall_with_no_school_within_750m,
  );
  const antall_adresser = parseInt(properties.antall_adresser);
  if (antall_adresser < 20) {
    return "rgba(255, 255, 255, 0.5)";
  }
  const percentage = antall_with_no_school_within_750m / antall_adresser;
  return `rgba(${192 * percentage}, ${192 * (1 - percentage)}, 0, 0.5)`;
}

const map = new Map({
  view: new View({ center: [10.7, 59.9], zoom: 11 }),
  layers: [
    backgroundLayer,
    new VectorLayer({
      source: new VectorSource({
        url: "/api/skolerapport",
        format: new GeoJSON(),
      }),
      style: (feature) =>
        new Style({
          stroke: new Stroke({ width: 2, color: "black" }),
          fill: new Fill({
            color: getColor(feature.getProperties()),
          }),
        }),
    }),
  ],
});
const overlay = new Overlay({
  positioning: "top-center",
});

function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [selectedVegadresser, setSelectedVegadresser] = useState<FeatureLike[]>(
    [],
  );
  useEffect(() => {
    map.setTarget(mapRef.current!);
    overlay.setElement(overlayRef.current!);
    map.addOverlay(overlay);
  }, []);
  useEffect(() => {
    console.log({ selectedVegadresser });
  }, [selectedVegadresser]);
  return (
    <div ref={mapRef}>
      <div ref={overlayRef}>
        <h2>Valgte adresser</h2>
        {selectedVegadresser
          .map((f) => f.getProperties())
          .map((p) => (
            <li>{p.adressetekst}</li>
          ))}
      </div>
    </div>
  );
}

createRoot(document.getElementById("app")!).render(<Application />);
