import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import VectorLayer from "ol/layer/Vector.js";
import { Feature, Map, MapBrowserEvent } from "ol";
import { Layer } from "ol/layer.js";
import React, { useEffect, useState } from "react";

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
