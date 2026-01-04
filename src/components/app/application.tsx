import React, { useEffect, useRef, useState } from "react";
import { Feature, Map, MapBrowserEvent, View } from "ol";
import { OSM } from "ol/source.js";
import TileLayer from "ol/layer/Tile.js";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import "./application.css";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import { Circle, Fill, Stroke, Style, Text } from "ol/style.js";
import type { FeatureLike } from "ol/Feature.js";

useGeographic();

const fylkeSource = new VectorSource({
  url: `${import.meta.env.BASE_URL}/geojson/fylker.geojson`,
  format: new GeoJSON(),
});

function activeFylkeStyle(feature: FeatureLike) {
  const fylkesnavn = feature.getProperties()["fylkesnavn"];
  return new Style({
    stroke: new Stroke({ color: "black", width: 3 }),
    text: new Text({
      text: fylkesnavn,
      stroke: new Stroke({ color: "white", width: 2 }),
      font: "bold 24px serif",
    }),
  });
}

const map = new Map({
  layers: [
    new TileLayer({ source: new OSM() }),
    new VectorLayer({
      source: fylkeSource,
      style: new Style({
        stroke: new Stroke({ color: "black", width: 1 }),
      }),
    }),
    new VectorLayer({
      source: new VectorSource({
        url: `${import.meta.env.BASE_URL}/geojson/vgs.geojson`,
        format: new GeoJSON(),
      }),
      style: new Style({
        image: new Circle({
          radius: 6,
          stroke: new Stroke({ color: "black" }),
          fill: new Fill({ color: "red" }),
        }),
      }),
    }),
  ],
  view: new View({
    center: [11, 60],
    zoom: 9,
  }),
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const [activeFylke, setActiveFylke] = useState<Feature>();

  function handlePointerMove(e: MapBrowserEvent) {
    const features = fylkeSource.getFeaturesAtCoordinate(e.coordinate);
    setActiveFylke(features.length > 0 ? features[0] : undefined);
  }

  useEffect(() => {
    activeFylke?.setStyle(activeFylkeStyle);
    return () => activeFylke?.setStyle(undefined);
  }, [activeFylke]);

  useEffect(() => {
    map.setTarget(mapRef.current!);
    map.on("pointermove", handlePointerMove);
  }, []);
  return (
    <>
      <h1>Videregående skoler i Norge</h1>
      <div ref={mapRef} />
    </>
  );
}
