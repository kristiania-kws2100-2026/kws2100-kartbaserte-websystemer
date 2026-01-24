import React, { useEffect, useMemo, useState } from "react";
import type { Layer } from "ol/layer.js";
import TileLayer from "ol/layer/Tile.js";
import { OSM, StadiaMaps } from "ol/source.js";

const osmLayer = new TileLayer({ source: new OSM() });

const LayerOptions = {
  osmLayer: "OpenStreetMap bakgrunnskart",
  stadiaLayer: "Stadia backgrunnskart",
};
type LayerName = keyof typeof LayerOptions;

export function BackgroundLayerSelect({
  setBackgroundLayers,
}: {
  setBackgroundLayers: (value: Layer[]) => void;
}) {
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener("change", (event) =>
      setDarkMode(event.matches),
    );
  }, []);

  const stadiaLayer = useMemo(() => {
    return new TileLayer({
      source: new StadiaMaps({
        layer: darkMode ? "alidade_smooth_dark" : "alidade_smooth",
      }),
    });
  }, [darkMode]);

  const layers = useMemo<Record<LayerName, Layer>>(
    () => ({
      osmLayer,
      stadiaLayer,
    }),
    [stadiaLayer],
  );

  const [layerName, setLayerName] =
    useState<keyof typeof LayerOptions>("osmLayer");
  useEffect(
    () => setBackgroundLayers([layers[layerName]!]),
    [layerName, layers],
  );

  return (
    <select onChange={(e) => setLayerName(e.target.value as LayerName)}>
      {Object.entries(LayerOptions).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}
