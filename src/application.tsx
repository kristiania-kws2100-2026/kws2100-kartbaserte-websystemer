import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import VectorTileLayer from "ol/layer/VectorTile.js";
import VectorTileSource from "ol/source/VectorTile.js";
import type { FeatureLike } from "ol/Feature.js";
import { GeoJSON, MVT } from "ol/format.js";
import { Map, MapBrowserEvent, Overlay, View } from "ol";
import { OSM } from "ol/source.js";
import { useEffect, useRef, useState } from "react";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import "./application.css";

useGeographic();

const map = new Map({
  layers: [
    new TileLayer({ source: new OSM() }),
    new VectorLayer({
      source: new VectorSource({
        url: "/api/grunnskole",
        format: new GeoJSON(),
      }),
    }),
    new VectorTileLayer({
      source: new VectorTileSource({
        url: "/api/adresser/{z}/{x}/{y}",
        format: new MVT(),
      }),
    }),
  ],
  view: new View({ center: [10.7, 59.9], zoom: 12 }),
});
const overlay = new Overlay({
  positioning: "top-center",
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [selectedGrunnskoler, setSelectedGrunnskoler] = useState<FeatureLike[]>(
    [],
  );

  useEffect(() => {
    map.setTarget(mapRef.current!);
    overlay.setElement(overlayRef.current!);
    map.addOverlay(overlay);

    map.on("click", (e: MapBrowserEvent) => {
      const features = map.getFeaturesAtPixel(e.pixel);
      setSelectedGrunnskoler(features);
      overlay.setPosition(features.length > 0 ? e.coordinate : undefined);
    });
  });

  return (
    <div ref={mapRef}>
      <div ref={overlayRef}>
        Selected school:{" "}
        {selectedGrunnskoler.map((s) => (
          <div>{s.getProperties()["skolenavn"]}</div>
        ))}
      </div>
    </div>
  );
}
