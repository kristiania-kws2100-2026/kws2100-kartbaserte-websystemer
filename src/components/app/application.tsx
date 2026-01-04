import React, { useEffect, useRef, useState } from "react";
import { Feature, Map, MapBrowserEvent, Overlay, View } from "ol";
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
import { Point } from "ol/geom.js";

useGeographic();

const fylkeSource = new VectorSource({
  url: `${import.meta.env.BASE_URL}/geojson/fylker.geojson`,
  format: new GeoJSON(),
});
const vgsSource = new VectorSource({
  url: `${import.meta.env.BASE_URL}/geojson/vgs.geojson`,
  format: new GeoJSON(),
});
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
      source: vgsSource,
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
const overlay = new Overlay({
  positioning: "bottom-center",
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const [activeFylke, setActiveFylke] = useState<Feature>();
  const [selectedSchools, setSelectedSchools] = useState<FeatureLike[]>([]);

  function handlePointerMove(e: MapBrowserEvent) {
    const features = fylkeSource.getFeaturesAtCoordinate(e.coordinate);
    setActiveFylke(features.length > 0 ? features[0] : undefined);
  }

  function handleClick(e: MapBrowserEvent) {
    const features = map.getFeaturesAtPixel(e.pixel, {
      layerFilter: (l) => l.getSource() === vgsSource,
    });
    setSelectedSchools(features);
    overlay.setPosition(
      features.length > 0
        ? (features[0]!.getGeometry() as Point).getCoordinates()
        : undefined,
    );
  }

  useEffect(() => {
    activeFylke?.setStyle(activeFylkeStyle);
    return () => activeFylke?.setStyle(undefined);
  }, [activeFylke]);

  function activeFylkeStyle(feature: FeatureLike): Style {
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

  useEffect(() => {
    map.setTarget(mapRef.current!);
    map.on("pointermove", handlePointerMove);
    overlay.setElement(overlayRef.current!);
    map.on("click", handleClick);
    map.addOverlay(overlay);
  }, []);
  return (
    <>
      <h1>Videregående skoler i Norge</h1>
      <div ref={mapRef} />
      <div ref={overlayRef}>
        {selectedSchools.length === 1
          ? selectedSchools[0]!.getProperties()["skolenavn"]
          : `${selectedSchools.length} valgte skoler`}
      </div>
    </>
  );
}
