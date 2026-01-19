import React, { useEffect, useRef, useState } from "react";
import { Feature, Map, MapBrowserEvent, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import "./application.css";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import { Fill, Stroke, Style, Text } from "ol/style.js";

useGeographic();

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
const layers = [new TileLayer({ source: new OSM() }), fylkeLayer];

const map = new Map({
  layers,
  view: new View({ zoom: 9, center: [10, 59.5] }),
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [activeFylke, setActiveFylke] = useState<Feature>();

  function handlePointermove(e: MapBrowserEvent) {
    let fylkeUnderPointer = fylkeSource.getFeaturesAtCoordinate(e.coordinate);
    setActiveFylke(
      fylkeUnderPointer.length > 0 ? fylkeUnderPointer[0] : undefined,
    );
  }
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

  useEffect(() => {
    map.setTarget(mapRef.current!);
    map.on("pointermove", handlePointermove);
  }, []);

  return (
    <>
      <h1>
        {activeFylke
          ? activeFylke.getProperties()["fylkesnavn"]
          : "Kart over administrative områder i Norge"}
      </h1>
      <div ref={mapRef}></div>
    </>
  );
}
