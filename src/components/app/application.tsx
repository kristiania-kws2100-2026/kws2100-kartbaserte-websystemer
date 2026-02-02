import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useGeographic } from "ol/proj.js";

// @ts-ignore
import "ol/ol.css";
import { Layer } from "ol/layer.js";
import VectorLayer from "ol/layer/Vector.js";

useGeographic();

const view = new View({ center: [10.9, 59.9], zoom: 12 });
const map = new Map({ view });

const osmLayer = new TileLayer({ source: new OSM() });

const kartverketLayer = new TileLayer();

const bydelLayer = new VectorLayer();
const skoleLayer = new VectorLayer();

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const [layers, setLayers] = useState<Layer[]>([osmLayer]);
  useEffect(() => map.setLayers(layers), [layers]);

  useEffect(() => {
    map.setTarget(mapRef.current!);
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      view.animate({ center: [longitude, latitude], zoom: 15 });
    });
  }, []);
  return <div ref={mapRef}></div>;
}
