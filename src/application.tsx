import React, { useEffect, useRef, useState } from "react";
import { Feature, Map, MapBrowserEvent, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { Draw } from "ol/interaction.js";
import { Fill, RegularShape, Style } from "ol/style.js";
import { GeoJSON } from "ol/format.js";

const geojson = new GeoJSON();

useGeographic();

const drawingVectorSource = new VectorSource();
const drawingLayer = new VectorLayer({
  source: drawingVectorSource,
  style: new Style({
    image: new RegularShape({
      points: 4,
      radius: 10,
      fill: new Fill({ color: "blue" }),
    }),
  }),
});
const features = localStorage.getItem("features");
if (features) {
  drawingVectorSource.addFeatures(geojson.readFeatures(features));
}

const map = new Map({
  view: new View({ center: [10.7, 59.9], zoom: 12 }),
  layers: [new TileLayer({ source: new OSM() }), drawingLayer],
});

function SelectedFeatureDialog({ feature }: { feature: Feature | undefined }) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  useEffect(() => {
    if (feature) dialogRef.current?.showModal();
  }, [feature]);
  return (
    <dialog ref={dialogRef}>
      <h1>Selected feature</h1>
    </dialog>
  );
}

function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    map.setTarget(mapRef.current!);
    map.on("click", handleMapClick);
    drawingVectorSource.on("change", () => {
      localStorage.setItem(
        "features",
        geojson.writeFeatures(drawingVectorSource.getFeatures()),
      );
    });
  }, []);

  const [selectedFeature, setSelectedFeature] = useState<Feature>();

  function handleMapClick(e: MapBrowserEvent) {
    setSelectedFeature(map.getFeaturesAtPixel(e.pixel)[0] as Feature);
  }

  function handleClick() {
    const draw = new Draw({ type: "Point", source: drawingVectorSource });
    map.addInteraction(draw);
    drawingVectorSource.once("addfeature", () => map.removeInteraction(draw));
  }

  return (
    <>
      <nav>
        <button onClick={handleClick}>Draw point</button>
      </nav>
      <SelectedFeatureDialog feature={selectedFeature} />
      <div ref={mapRef}></div>
    </>
  );
}

export default Application;
