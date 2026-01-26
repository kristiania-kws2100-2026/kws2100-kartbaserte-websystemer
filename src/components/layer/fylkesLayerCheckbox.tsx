import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import VectorLayer from "ol/layer/Vector.js";
import { Fill, Stroke, Style } from "ol/style.js";
import { Layer } from "ol/layer.js";
import React, { useEffect, useState } from "react";

export const fylkeSource = new VectorSource({
  url: "/kws2100-kartbaserte-websystemer/geojson/fylker.geojson",
  format: new GeoJSON(),
});
const fylkeLayer = new VectorLayer({
  source: fylkeSource,
  style: new Style({
    stroke: new Stroke({ color: "blue", width: 2 }),
    fill: new Fill({
      color: "#ff000020",
    }),
  }),
});

export function FylkesLayerCheckbox({
  setFylkesLayers,
}: {
  setFylkesLayers: (value: Layer[]) => void;
}) {
  const [showFylkeLayer, setShowFylkeLayer] = useState(true);
  useEffect(() => {
    setFylkesLayers(showFylkeLayer ? [fylkeLayer] : []);
  }, [showFylkeLayer]);
  return (
    <button onClick={() => setShowFylkeLayer((b) => !b)} tabIndex={-1}>
      <input type={"checkbox"} checked={showFylkeLayer} /> Vis fylker (ny)
    </button>
  );
}
