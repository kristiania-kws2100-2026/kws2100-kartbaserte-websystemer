import { Map, MapBrowserEvent, Overlay, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useGeographic } from "ol/proj.js";
import { useEffect, useRef, useState } from "react";

import "ol/ol.css";
import { GeoJSON, MVT } from "ol/format.js";
import { Fill, Stroke, Style } from "ol/style.js";
import VectorTileLayer from "ol/layer/VectorTile.js";
import VectorTileSource from "ol/source/VectorTile.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import type { FeatureLike } from "ol/Feature.js";

import "./application.css";

useGeographic();

function getColor(percent: number) {
  if (percent == 0) return `rgba(0, 255, 0, 0.75)`;

  percent = Math.min(1, Math.max(0, percent));
  const red = Math.floor(192 * percent);
  const green = Math.floor(192 * (1 - percent));
  return `rgba(${red}, ${green}, 0, ${0.5})`;
}

const grunnkretsLayer = new VectorTileLayer({
  source: new VectorTileSource({
    url: "/api/grunnkrets/{z}/{x}/{y}",
    format: new MVT(),
  }),
  style: (feature) =>
    new Style({
      stroke: new Stroke({ color: "black", width: 2 }),
      fill: new Fill({
        color: getColor(feature.getProperties().andel_med_skole_over_750m),
      }),
    }),
});
const map = new Map({
  layers: [
    new TileLayer({ source: new OSM() }),
    grunnkretsLayer,
    new VectorLayer({
      source: new VectorSource({
        url: "/api/grunnskole",
        format: new GeoJSON(),
      }),
    }),
  ],
  view: new View({ center: [10.7, 59.9], zoom: 11 }),
});
const overlay = new Overlay({ positioning: "bottom-center" });

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<FeatureLike[]>([]);
  useEffect(() => {
    map.setTarget(mapRef.current!);
    overlay.setElement(overlayRef.current!);
    map.addOverlay(overlay);
    map.on("click", (e: MapBrowserEvent) => {
      const features = map.getFeaturesAtPixel(e.pixel, {
        layerFilter: (l) => l === grunnkretsLayer,
      });
      setSelectedFeature(features);
      overlay.setPosition(features.length > 0 ? e.coordinate : undefined);
    });
  }, []);
  return (
    <div ref={mapRef}>
      <div ref={overlayRef}>
        {selectedFeature
          .map((f) => f.getProperties())
          .map((p) => (
            <div key={p.grunnkretsnummer}>
              {p.grunnkretsnavn}:{" "}
              {(100 - p.andel_med_skole_over_750m * 100).toFixed(0)} %
            </div>
          ))}
      </div>
    </div>
  );
}
