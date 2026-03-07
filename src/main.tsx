import { createRoot } from "react-dom/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Map, MapBrowserEvent, Overlay, View } from "ol";
import { useGeographic } from "ol/proj.js";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";

import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON, MVT } from "ol/format.js";
import VectorTileLayer from "ol/layer/VectorTile.js";
import VectorTileSource from "ol/source/VectorTile.js";
import proj4 from "proj4";
import { register } from "ol/proj/proj4.js";
import type { FeatureLike } from "ol/Feature.js";

// @ts-ignore
import "ol/ol.css";

proj4.defs(
  "EPSG:25833",
  "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
);
register(proj4);

useGeographic();
const backgroundLayer = new TileLayer({ source: new OSM() });
const kommuneTileLayer = new VectorTileLayer({
  source: new VectorTileSource({
    url: "/api/kommuner/{z}/{x}/{y}",
    format: new MVT(),
  }),
});
const kommuneGeoJSONLayer = new VectorLayer({
  source: new VectorSource({
    url: "/geojson/kommuner.geojson",
    format: new GeoJSON(),
  }),
});
const grunnskoleLayer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON({ dataProjection: "EPSG:25833" }),
    url: "/api/grunnskoler",
  }),
});
const vegadresseLayer = new VectorTileLayer({
  source: new VectorTileSource({
    format: new MVT(),
    url: "/api/vegadresse/{z}/{x}/{y}",
  }),
});
const map = new Map({
  view: new View({ center: [11.06, 59.95], zoom: 15 }),
  layers: [],
});
const overlay = new Overlay({ positioning: "top-center" });

function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [kommuneFromDatabase, setKommuneFromDatabase] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureLike[]>([]);

  const kommuneLayer = useMemo(
    () => (kommuneFromDatabase ? kommuneTileLayer : kommuneGeoJSONLayer),
    [kommuneFromDatabase],
  );
  const layers = useMemo(
    () => [backgroundLayer, kommuneLayer, grunnskoleLayer, vegadresseLayer],
    [kommuneLayer],
  );
  useEffect(() => map.setLayers(layers), [layers]);

  useEffect(() => {
    map.setTarget(mapRef.current!);
    overlay.setElement(overlayRef.current!);
    map.addOverlay(overlay);
    map.on("click", (e: MapBrowserEvent) => {
      const features = map.getFeaturesAtPixel(e.pixel, {
        layerFilter: (l) => l === vegadresseLayer,
      });
      setSelectedFeatures(features);
      overlay.setPosition(features.length > 0 ? e.coordinate : undefined);
    });
  }, []);
  return (
    <div>
      <label>
        <input
          type={"checkbox"}
          checked={kommuneFromDatabase}
          onChange={(e) => setKommuneFromDatabase(e.target.checked)}
        />
        Bruk kommuner fra database
      </label>
      <div ref={mapRef}>
        <div ref={overlayRef}>
          <h2>Valgt adresse:</h2>
          {selectedFeatures
            .map((a) => a.getProperties())
            .map(({ id, adressetekst }) => (
              <li key={id}>{adressetekst}</li>
            ))}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("app")!).render(<Application />);
