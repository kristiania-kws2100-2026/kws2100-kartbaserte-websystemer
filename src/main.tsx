import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import { Map, MapBrowserEvent, Overlay, View } from "ol";
import { useGeographic } from "ol/proj.js";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";

// @ts-ignore
import "ol/ol.css";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON, MVT } from "ol/format.js";
import VectorTileLayer from "ol/layer/VectorTile.js";
import VectorTileSource from "ol/source/VectorTile.js";
import type { FeatureLike } from "ol/Feature.js";

useGeographic();
const kommuneLayer = new VectorTileLayer({
  source: new VectorTileSource({
    url: "/api/kommuner/{z}/{x}/{y}",
    format: new MVT(),
  }),
});
const grunnskoleLayer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: "/api/grunnskoler",
  }),
});
const vegadresseLayer = new VectorTileLayer({
  source: new VectorTileSource({
    url: "/api/vegadresse/{z}/{x}/{y}",
    format: new MVT(),
  }),
});
const backgroundLayer = new TileLayer({ source: new OSM() });
const map = new Map({
  view: new View({ center: [11.05, 59.95], zoom: 14 }),
  layers: [backgroundLayer, kommuneLayer, grunnskoleLayer, vegadresseLayer],
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
    map.on("click", (e: MapBrowserEvent) => {
      const featuresAtPixel = map.getFeaturesAtPixel(e.pixel, {
        layerFilter: (l) => l === vegadresseLayer,
      });
      setSelectedVegadresser(featuresAtPixel);
      overlay.setPosition(
        featuresAtPixel.length > 0 ? e.coordinate : undefined,
      );
    });
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
