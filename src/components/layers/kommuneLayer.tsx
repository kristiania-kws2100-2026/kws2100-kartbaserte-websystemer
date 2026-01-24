import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import VectorLayer from "ol/layer/Vector.js";
import { Feature, Map, MapBrowserEvent } from "ol";
import { Layer } from "ol/layer.js";
import React, { useEffect, useState } from "react";

export interface KommuneProperties {
  kommunenavn: string;
}

const kommuneSource = new VectorSource<
  { getProperties(): KommuneProperties } & Feature
>({
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
  setAlleKommuner: (value: KommuneProperties[]) => void;
  setSelectedKommune: (value: KommuneProperties | undefined) => void;
}) {
  const [checked, setChecked] = useState(false);
  useEffect(() => setKommuneLayers(checked ? [kommuneLayer] : []), [checked]);
  useEffect(
    () =>
      setAlleKommuner(
        checked
          ? kommuneSource.getFeatures().map((p) => p.getProperties())
          : [],
      ),
    [checked],
  );
  function handleMapClick(e: MapBrowserEvent) {
    const clickedKommune = kommuneSource.getFeaturesAtCoordinate(e.coordinate);
    setSelectedKommune(clickedKommune[0]?.getProperties());
  }
  useEffect(() => {
    map.on("click", handleMapClick);
    kommuneSource.on("change", () =>
      setAlleKommuner(
        kommuneSource.getFeatures().map((f) => f.getProperties()),
      ),
    );
  }, []);

  return (
    <button onClick={() => setChecked((b) => !b)} tabIndex={-1}>
      <input type={"checkbox"} checked={checked} /> Vis kommuner
    </button>
  );
}
