import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import VectorLayer from "ol/layer/Vector.js";
import { Fill, Stroke, Style, Text } from "ol/style.js";
import { Layer } from "ol/layer.js";
import React, { useEffect, useState } from "react";
import { Feature, Map, type MapBrowserEvent } from "ol";

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

export function FylkesLayerCheckbox({
  setFylkesLayers,
  map,
}: {
  setFylkesLayers: (value: Layer[]) => void;
  map: Map;
}) {
  function handlePointermove(e: MapBrowserEvent) {
    const fylkeUnderPointer = fylkeSource.getFeaturesAtCoordinate(e.coordinate);
    setActiveFylke(
      fylkeUnderPointer.length > 0 ? fylkeUnderPointer[0] : undefined,
    );
  }

  const [activeFylke, setActiveFylke] = useState<Feature>();
  const [showFylkeLayer, setShowFylkeLayer] = useState(false);
  useEffect(() => {
    setFylkesLayers(showFylkeLayer ? [fylkeLayer] : []);
    if (showFylkeLayer) map.on("pointermove", handlePointermove);
    return () => {
      map.un("pointermove", handlePointermove);
    };
  }, [showFylkeLayer]);
  useEffect(() => {
    activeFylke?.setStyle(
      (feature) =>
        new Style({
          stroke: new Stroke({ color: "blue", width: 4 }),
          text: new Text({
            text: feature.getProperties()["fylkesnavn"],
          }),
        }),
    );
    return () => activeFylke?.setStyle(undefined);
  }, [activeFylke]);

  return (
    <button onClick={() => setShowFylkeLayer((b) => !b)} tabIndex={-1}>
      <input type={"checkbox"} checked={showFylkeLayer} /> Vis fylker (ny)
    </button>
  );
}
