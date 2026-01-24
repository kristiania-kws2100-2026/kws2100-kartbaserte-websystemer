import React, { useEffect, useMemo, useRef, useState } from "react";
import { Feature, Map, MapBrowserEvent, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import "./application.css";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import { getCenter } from "ol/extent.js";
import { Layer } from "ol/layer.js";
import { FylkeLayerCheckbox } from "../layers/fylkeLayer.js";

useGeographic();

const kommuneSource = new VectorSource({
  url: "/kws2100-kartbaserte-websystemer/geojson/kommuner.geojson",
  format: new GeoJSON(),
});
const kommuneLayer = new VectorLayer({ source: kommuneSource });

const view = new View({ zoom: 9, center: [10, 59.5] });
const map = new Map({ view });

function KommuneLayerCheckbox({
  map,
  setKommuneLayers,
  setAlleKommuner,
  setSelectedKommune,
}: {
  map: Map;
  setKommuneLayers: (value: Layer[]) => void;
  setAlleKommuner: (value: Feature[]) => void;
  setSelectedKommune: (value: Feature | undefined) => void;
}) {
  const [checked, setChecked] = useState(true);
  useEffect(() => setKommuneLayers(checked ? [kommuneLayer] : []), [checked]);
  useEffect(
    () => setAlleKommuner(checked ? kommuneSource.getFeatures() : []),
    [checked],
  );
  function handleMapClick(e: MapBrowserEvent) {
    const clickedKommune = kommuneSource.getFeaturesAtCoordinate(e.coordinate);
    setSelectedKommune(
      clickedKommune.length > 0 ? clickedKommune[0] : undefined,
    );
  }
  useEffect(() => {
    map.on("click", handleMapClick);
    kommuneSource.on("change", () =>
      setAlleKommuner(kommuneSource.getFeatures()),
    );
  }, []);

  return (
    <button onClick={() => setChecked((b) => !b)} tabIndex={-1}>
      <input type={"checkbox"} checked={checked} /> Vis kommuner
    </button>
  );
}

function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [alleKommuner, setAlleKommuner] = useState<Feature[]>([]);
  const [fylkesLayers, setFylkesLayers] = useState<Layer[]>([]);
  const [kommuneLayers, setKommuneLayers] = useState<Layer[]>([]);

  const layers = useMemo(
    () => [
      new TileLayer({ source: new OSM() }),
      ...fylkesLayers,
      ...kommuneLayers,
    ],
    [fylkesLayers, kommuneLayers],
  );
  useEffect(() => map.setLayers(layers), [layers]);

  const [selectedKommune, setSelectedKommune] = useState<Feature>();

  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);

  function handleClick(kommuneProperties: Record<string, any>) {
    const { geometry } = kommuneProperties;
    view.animate({ center: getCenter(geometry.getExtent()) });
  }

  return (
    <>
      <header>
        <h1>
          {selectedKommune
            ? selectedKommune.getProperties()["kommunenavn"]
            : "Kart over administrative områder i Norge"}
        </h1>
        <div>
          <KommuneLayerCheckbox
            map={map}
            setKommuneLayers={setKommuneLayers}
            setAlleKommuner={setAlleKommuner}
            setSelectedKommune={setSelectedKommune}
          />
          <FylkeLayerCheckbox setFylkesLayers={setFylkesLayers} map={map} />
        </div>
      </header>
      <main>
        <div ref={mapRef}></div>
        {alleKommuner.length > 0 && (
          <aside>
            <h2>Alle kommuner</h2>
            <ul>
              {alleKommuner
                .map((f) => f.getProperties())
                .sort((a, b) =>
                  a["kommunenavn"].localeCompare(b["kommunenavn"]),
                )
                .map((k) => (
                  <li>
                    <a href={"#"} onClick={() => handleClick(k)}>
                      {k["kommunenavn"]}
                    </a>
                  </li>
                ))}
            </ul>
          </aside>
        )}
      </main>
    </>
  );
}

export default Application;
