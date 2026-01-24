import React, { useEffect, useMemo, useState } from "react";
import type { Layer } from "ol/layer.js";
import TileLayer from "ol/layer/Tile.js";
import { OSM, StadiaMaps } from "ol/source.js";

const osmLayer = new TileLayer({ source: new OSM() });
const stadiaLayer = new TileLayer({
  source: new StadiaMaps({ layer: "alidade_smooth" }),
});
const stadiaDarkLayer = new TileLayer({
  source: new StadiaMaps({ layer: "alidade_smooth_dark" }),
});

const LayerOptions = {
  osmLayer: "OpenStreetMap bakgrunnskart",
  stadiaLayer: "Stadia backgrunnskart",
  stadiaDarkLayer: "Stadia backgrunnskart (mørk)",
};
type LayerName = keyof typeof LayerOptions;

export function BackgroundLayerSelect({
  setBackgroundLayers,
}: {
  setBackgroundLayers: (value: Layer[]) => void;
}) {
  const layers = useMemo<Record<string, Layer>>(
    () => ({
      osmLayer,
      stadiaLayer,
      stadiaDarkLayer,
    }),
    [],
  );

  const [layerName, setLayerName] =
    useState<keyof typeof LayerOptions>("osmLayer");
  useEffect(() => setBackgroundLayers([layers[layerName]!]), [layerName]);

  return (
    <select onChange={(e) => setLayerName(e.target.value as LayerName)}>
      {Object.entries(LayerOptions).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
      s{" "}
    </select>
  );
}
