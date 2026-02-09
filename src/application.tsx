import { Feature, Map, MapBrowserEvent, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useEffect, useRef, useState } from "react";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { Draw } from "ol/interaction.js";
import { GeoJSON } from "ol/format.js";
import { Fill, RegularShape, Stroke, Style, Text } from "ol/style.js";

const geoJson = new GeoJSON();

useGeographic();

const drawingVectorSource = new VectorSource();
const drawingLayer = new VectorLayer({
  source: drawingVectorSource,
  style: (feature) => {
    const color = feature.getProperties()["color"] || "blue";
    const label = feature.getProperties()["label"];
    const imageStyle = new Style({
      image: new RegularShape({
        radius: 10,
        points: 4,
        fill: new Fill({ color }),
        stroke: new Stroke({
          color: "white",
          width: 3,
        }),
      }),
    });

    if (label) {
      return [
        imageStyle,
        new Style({
          text: new Text({
            text: label,
            font: "bold 20px serif",
            offsetY: 25,
          }),
        }),
      ];
    }

    return imageStyle;
  },
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
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const [selectedFeature, setSelectedFeature] = useState<Feature>();
  const [color, setColor] = useState("blue");
  const [label, setLabel] = useState("");

  useEffect(() => {
    map.setTarget(mapRef.current!);
    map.on("click", (e: MapBrowserEvent) => {
      setSelectedFeature(map.getFeaturesAtPixel(e.pixel)[0] as Feature);
    });

    drawingVectorSource.on("change", () => {
      localStorage.setItem(
        "features",
        geoJson.writeFeatures(drawingVectorSource.getFeatures()),
      );
    });
  }, []);

  useEffect(() => {
    if (selectedFeature) {
      dialogRef.current?.showModal();
      setColor(selectedFeature.getProperties()["color"] || "#0000ff");
      setLabel(selectedFeature.getProperties()["label"] || "");
    }
  }, [selectedFeature]);
  useEffect(() => {
    if (selectedFeature) {
      selectedFeature.setProperties({ color });
    }
  }, [color]);
  useEffect(() => {
    if (selectedFeature) {
      selectedFeature.setProperties({ label });
    }
  }, [label]);

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
      <dialog ref={dialogRef}>
        <h1>You have selected a feature</h1>
        <form>
          <p>
            Color:{" "}
            <input
              type={"color"}
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </p>
          <p>
            Label{" "}
            <input value={label} onChange={(e) => setLabel(e.target.value)} />
          </p>
        </form>
      </dialog>
      <div ref={mapRef}></div>
    </>
  );
}
