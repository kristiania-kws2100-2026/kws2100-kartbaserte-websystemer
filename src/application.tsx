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
import { Draw } from "ol/interaction.js";
import type { DrawEvent } from "ol/interaction/Draw.js";
import { Fill, Style } from "ol/style.js";

useGeographic();

const adresseLayer = new VectorTileLayer({
  source: new VectorTileSource({
    url: "/api/adresser/{z}/{x}/{y}",
    format: new MVT(),
  }),
});
const schoolLayer = new VectorLayer({
  source: new VectorSource({
    url: "/api/grunnskole",
    format: new GeoJSON(),
  }),
  visible: false,
});
const drawnAreaSource = new VectorSource();

const rodeLayer = new VectorLayer({ source: drawnAreaSource });
const backgroundLayer = new TileLayer({ source: new OSM() });
const map = new Map({
  layers: [backgroundLayer, schoolLayer, adresseLayer, rodeLayer],
  view: new View({ center: [10.7, 59.9], zoom: 13 }),
});
const overlay = new Overlay({
  positioning: "top-center",
});

type RodeFeature = {
  properties:
    | {
        adresser: {
          adresseid: number;
          adressenavn: string;
          antall_bruksenheter: number;
        }[];
      }
    | { error: string };
} & FeatureLike;

const drawInteraction = new Draw({
  type: "Polygon",
  source: drawnAreaSource,
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [selectedRoder, setSelectedRoder] = useState<RodeFeature[]>([]);

  function handleClickSelect() {
    map.addInteraction(drawInteraction);
  }

  useEffect(() => {
    map.setTarget(mapRef.current!);
    overlay.setElement(overlayRef.current!);
    map.addOverlay(overlay);

    map.on("click", (e: MapBrowserEvent) => {
      const features = map.getFeaturesAtPixel(e.pixel, {
        layerFilter: (l) => l === rodeLayer,
      });
      setSelectedRoder(features as RodeFeature[]);
      overlay.setPosition(features.length > 0 ? e.coordinate : undefined);
    });

    drawnAreaSource.on("addfeature", async (f: DrawEvent) => {
      map.removeInteraction(drawInteraction);
      console.log(f);
      const res = await fetch("/api/adresser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: new GeoJSON().writeGeometry(f.feature.getGeometry()!),
      });
      if (res.ok) {
        f.feature.setStyle(
          new Style({
            fill: new Fill({ color: "green" }),
          }),
        );
        f.feature.setProperties(await res.json());
      } else {
        f.feature.setStyle(
          new Style({
            fill: new Fill({ color: "red" }),
          }),
        );
      }
    });
  });

  return (
    <>
      <div>
        <button onClick={handleClickSelect}>Velg område</button>
      </div>
      <div ref={mapRef}>
        <div ref={overlayRef}>
          Adresse:{" "}
          {selectedRoder
            .map((f) => f.getProperties())
            .map((props) => (
              <div>
                {"error" in props ? (
                  <>{props.error}</>
                ) : (
                  <>{props.adresser.length} adresser</>
                )}
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
