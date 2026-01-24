import React, { useEffect } from "react";
import type { Layer } from "ol/layer.js";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";

export function BackgroundLayerSelect({
  setBackgroundLayers,
}: {
  setBackgroundLayers: (value: Layer[]) => void;
}) {
  useEffect(() => {
    setBackgroundLayers([new TileLayer({ source: new OSM() })]);
  }, []);

  return (
    <select>
      <option>OpenStreetMap bakgrunnskart</option>
      <option>Stadia bakgrunnskart</option>
    </select>
  );
}
