import React, { useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { WMTS } from "ol/source.js";
import { useGeographic } from "ol/proj.js";

// Styling of OpenLayers components like zoom and pan controls
// @ts-ignore
import "ol/ol.css";
import { Layer } from "ol/layer.js";
import { GeoJSON, WMTSCapabilities } from "ol/format.js";
import { optionsFromCapabilities } from "ol/source/WMTS.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { Stroke, Style } from "ol/style.js";
import { skoleLayer } from "../layers/skoleLayer.js";

// By calling the "useGeographic" function in OpenLayers, we tell that we want coordinates to be in degrees
//  instead of meters, which is the default. Without this `center: [10.6, 59.9]` brings us to "null island"
useGeographic();

const map = new Map();

const kartverketLayer = new TileLayer();
fetch("https://cache.kartverket.no/v1/wmts/1.0.0/WMTSCapabilities.xml").then(
  async (res) => {
    const capabilities = new WMTSCapabilities().read(await res.text());
    const options = optionsFromCapabilities(capabilities, {
      layer: "topo",
      matrixSet: "webmercator",
    });
    kartverketLayer.setSource(new WMTS(options!));
  },
);

// Source: https://www.oslo.kommune.no/statistikk/geografiske-inndelinger/
const bydelerLayer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: "/kws2100-kartbaserte-websystemer/geojson/bydeler.geojson",
  }),
  style: new Style({
    stroke: new Stroke({ color: "black", width: 3 }),
  }),
});

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  // By declaring the view as React state, we can change it using code
  const [view, setView] = useState(
    new View({ center: [10.8, 59.9], zoom: 12 }),
  );
  // binding the view to the map with a use effect ensures that when we call `setView`, the OpenLayers map is updated to use the new view
  useEffect(() => map.setView(view), [view]);

  // By declaring the layers as React state, we can change them using code
  const [layers, setLayers] = useState<Layer[]>([
    kartverketLayer,
    bydelerLayer,
    skoleLayer,
  ]);
  // binding the layers to the map with a use effect ensures that when we call `setLayers`, the OpenLayers map is updated to use the new layers
  useEffect(() => map.setLayers(layers), [layers]);

  // When we display the page, we want the OpenLayers map object to target the DOM object refererred to by the
  // map React component
  useEffect(() => {
    map.setTarget(mapRef.current!);

    // We can update the view position from the users position with a callback
    // (this requires user consent)
    navigator.geolocation.getCurrentPosition((e) => {
      const { latitude, longitude } = e.coords;
      view.animate({ center: [longitude, latitude], zoom: 14 });
    });
  }, []);

  // This is the location (in React) where we want the map to be displayed
  return <div ref={mapRef}></div>;
}
