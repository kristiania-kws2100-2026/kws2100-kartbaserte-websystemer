import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM, WMTS } from "ol/source.js";
import { useGeographic } from "ol/proj.js";

// @ts-ignore
import "ol/ol.css";
import { Layer } from "ol/layer.js";
import { optionsFromCapabilities } from "ol/source/WMTS.js";
import { WMTSCapabilities } from "ol/format.js";
import { bydelLayer } from "../layers/bydelLayer.js";
import { skoleLayer } from "../layers/skoleLayer.js";

useGeographic();

const view = new View({ center: [10.9, 59.9], zoom: 12 });
const map = new Map({ view });

const osmLayer = new TileLayer({ source: new OSM() });

const kartverketLayer = new TileLayer();
fetch("https://cache.kartverket.no/v1/wmts/1.0.0/WMTSCapabilities.xml").then(
  async (res) => {
    const parser = new WMTSCapabilities();
    const capabilities = parser.read(await res.text());
    kartverketLayer.setSource(
      new WMTS(
        optionsFromCapabilities(capabilities, {
          layer: "topo",
          matrixSet: "webmercator",
        })!,
      )!,
    );
  },
);

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  const [layers, setLayers] = useState<Layer[]>([
    kartverketLayer,
    bydelLayer,
    skoleLayer,
  ]);
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
