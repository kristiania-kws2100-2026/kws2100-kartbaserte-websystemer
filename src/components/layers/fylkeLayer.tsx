import { Feature, Map, type MapBrowserEvent } from "ol";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import VectorLayer from "ol/layer/Vector.js";
import { Fill, Stroke, Style, Text } from "ol/style.js";
import { Layer } from "ol/layer.js";
import React, { useEffect, useState } from "react";
import type { FeatureLike } from "ol/Feature.js";

const fylkeSource = new VectorSource({
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

function activeFylkeStyle(feature: FeatureLike) {
  return new Style({
    stroke: new Stroke({ color: "blue", width: 4 }),
    text: new Text({
      text: feature.getProperties()["fylkesnavn"],
    }),
  });
}

export function FylkeLayerCheckbox({
  map,
  setFylkesLayers,
}: {
  setFylkesLayers(layers: Layer[]): void;
  map: Map;
}) {
  const [showFylkeLayer, setShowFylkeLayer] = useState(false);
  const [activeFylkeList, setActiveFylkeList] = useState<Feature[]>([]);
  useEffect(
    () => setFylkesLayers(showFylkeLayer ? [fylkeLayer] : []),
    [showFylkeLayer],
  );
  function handlePointermove(e: MapBrowserEvent) {
    setActiveFylkeList(fylkeSource.getFeaturesAtCoordinate(e.coordinate));
  }
  useEffect(() => {
    activeFylkeList.forEach((f) => f.setStyle(activeFylkeStyle));
    return () => activeFylkeList.forEach((f) => f.setStyle(undefined));
  }, [activeFylkeList]);

  useEffect(() => {
    if (showFylkeLayer) map.on("pointermove", handlePointermove);
    else map.un("pointermove", handlePointermove);
  }, [showFylkeLayer]);

  return (
    <button onClick={() => setShowFylkeLayer((b) => !b)} tabIndex={-1}>
      <input type={"checkbox"} checked={showFylkeLayer} /> Vis fylker
    </button>
  );
}
