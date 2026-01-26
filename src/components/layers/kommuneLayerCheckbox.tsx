import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import { Layer } from "ol/layer.js";
import { type Feature, Map, type MapBrowserEvent } from "ol";
import React, { useEffect, useState } from "react";
import type { FeatureLike } from "ol/Feature.js";

const kommuneSource = new VectorSource({
  url: "/kws2100-kartbaserte-websystemer/geojson/kommuner.geojson",
  format: new GeoJSON(),
});
const kommuneLayer = new VectorLayer({ source: kommuneSource });

export function KommuneLayerCheckbox({
  map,
  setKommuneLayers,
  setAlleKommuner,
  setSelectedKommune,
}: {
  setKommuneLayers: (value: Layer[]) => void;
  map: Map;
  setAlleKommuner: (value: Feature[]) => void;
  setSelectedKommune: (value: Feature | undefined) => void;
}) {
  function handleMapClick(e: MapBrowserEvent) {
    const clickedKommune = kommuneSource.getFeaturesAtCoordinate(e.coordinate);
    setSelectedKommune(
      clickedKommune.length > 0 ? clickedKommune[0] : undefined,
    );
  }
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    setKommuneLayers(checked ? [kommuneLayer] : []);
    setAlleKommuner(checked ? kommuneSource.getFeatures() : []);
  }, [checked]);
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
