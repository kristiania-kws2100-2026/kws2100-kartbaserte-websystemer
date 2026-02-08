import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { Draw } from "ol/interaction.js";
import { Fill, RegularShape, Style } from "ol/style.js";

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
const map = new Map({
  view: new View({ center: [10.7, 59.9], zoom: 12 }),
  layers: [new TileLayer({ source: new OSM() }), drawingLayer],
});

function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);

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
      <div ref={mapRef}></div>
    </>
  );
}

export default Application;
