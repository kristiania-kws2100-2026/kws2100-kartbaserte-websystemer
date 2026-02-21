import { createRoot } from "react-dom/client";
import { useEffect, useRef } from "react";
import { Map, View } from "ol";
import { useGeographic } from "ol/proj.js";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";

import "ol/ol.css";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import { register } from "ol/proj/proj4.js";
import proj4 from "proj4";
import { Circle, Fill, Stroke, Style, Text } from "ol/style.js";

proj4.defs(
  "EPSG:25833",
  "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
);
register(proj4);

useGeographic();
const kommuneLayer = new VectorLayer({
  source: new VectorSource({
    url: "/geojson/kommuner.geojson",
    format: new GeoJSON(),
  }),
  style: (f, resolution) => {
    if (resolution < 150) {
      return new Style({
        text: new Text({
          text: f.getProperties()["name"],
          font: "25px bold sans-serif",
          stroke: new Stroke({ width: 2, color: "white" }),
        }),
        stroke: new Stroke({ width: 3, color: "black" }),
      });
    }
    return new Style({
      stroke: new Stroke({ width: 3, color: "black" }),
    });
  },
});
const grunnskoleLayer = new VectorLayer({
  source: new VectorSource({
    url: "/api/grunnskoler",
    format: new GeoJSON({ dataProjection: "EPSG:25833" }),
  }),
  style: (feature) => {
    return new Style({
      image: new Circle({
        radius: 3 + feature.getProperties()["antallelever"] / 100,
        fill: new Fill({
          color:
            feature.getProperties()["eierforhold"] === "Privat"
              ? "purple"
              : "blue",
        }),
        stroke: new Stroke({ width: 3, color: "white" }),
      }),
    });
  },
});
const map = new Map({
  view: new View({ center: [10.7, 59.9], zoom: 8 }),
  layers: [new TileLayer({ source: new OSM() }), kommuneLayer, grunnskoleLayer],
});

function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => map.setTarget(mapRef.current!), []);
  return <div ref={mapRef}></div>;
}

createRoot(document.getElementById("app")!).render(<Application />);
