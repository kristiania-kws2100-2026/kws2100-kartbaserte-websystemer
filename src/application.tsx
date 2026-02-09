import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useEffect, useRef } from "react";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { Draw } from "ol/interaction.js";
import { GeoJSON } from "ol/format.js";

const geoJson = new GeoJSON();

useGeographic();

const drawingVectorSource = new VectorSource();
const drawingLayer = new VectorLayer({
  source: drawingVectorSource,
});
const savedFeatures = localStorage.getItem("features");
if (savedFeatures) {
  drawingVectorSource.addFeatures(geoJson.readFeatures(savedFeatures));
}

const map = new Map({
  view: new View({ center: [10.7, 59.9], zoom: 12 }),
  layers: [new TileLayer({ source: new OSM() }), drawingLayer],
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    map.setTarget(mapRef.current!);
    drawingVectorSource.on("change", () => {
      localStorage.setItem(
        "features",
        geoJson.writeFeatures(drawingVectorSource.getFeatures()),
      );
    });
  }, []);

  function handleClick() {
    const draw = new Draw({
      type: "Point",
      source: drawingVectorSource,
    });
    map.addInteraction(draw);

    drawingVectorSource.on("addfeature", () => {
      map.removeInteraction(draw);
    });
  }

  return (
    <>
      <button onClick={handleClick}>Add point</button>
      <div ref={mapRef}></div>
    </>
  );
}
