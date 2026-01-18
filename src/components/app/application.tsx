import React, { useEffect, useRef, useState } from "react";
import { Feature, Map, MapBrowserEvent, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import "./application.css";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import { Style, Text } from "ol/style.js";
import type { FeatureLike } from "ol/Feature.js";
import { getCenter } from "ol/extent.js";

useGeographic();

const fylkeSource = new VectorSource({
  url: "/kws2100-kartbaserte-websystemer/geojson/fylker.geojson",
  format: new GeoJSON(),
});
const fylkeLayer = new VectorLayer({
  source: fylkeSource,
});
const kommuneSource = new VectorSource({
  url: "/kws2100-kartbaserte-websystemer/geojson/kommuner.geojson",
  format: new GeoJSON(),
});
const kommuneLayer = new VectorLayer({
  source: kommuneSource,
});
const layers = [new TileLayer({ source: new OSM() }), kommuneLayer, fylkeLayer];
const view = new View({ center: [11, 59], zoom: 8 });
const map = new Map({ layers, view });

function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);

  // In React, we use a state to keep track of which fylke the user is hovering over
  const [activeFylke, setActiveFylke] = useState<Feature>();
  // In OpenLayers, we can define a style function which is evaluated for each feature with that style
  function activeFylkeStyle(fylke: FeatureLike) {
    // Features have properties in the GeoJSON file that we can inspect
    const fylkesnavn = fylke.getProperties()["fylkesnavn"];
    // We define a style that shows a text based on a feature property
    return new Style({ text: new Text({ text: fylkesnavn }) });
  }
  function handlePointerMove(event: MapBrowserEvent) {
    // We look for any features in the Vector Source that overlap the hovered coordinate
    // Depending on the data, this could be zero, one or more features
    const fylke = fylkeSource.getFeaturesAtCoordinate(event.coordinate);
    // If at least one feature is under the point, we mark the first one as active
    setActiveFylke(fylke.length > 0 ? fylke[0] : undefined);
  }
  // a useEffect can be set up to triggered when a state value changes.
  //  In this case, the value of `activeFylke`
  useEffect(() => {
    // We can override the style function for this one fylke
    activeFylke?.setStyle(activeFylkeStyle);
    // when useEffect returns a function, this function is called with the old value
    //  so that we can clean up any effect
    return () => activeFylke?.setStyle(undefined);
  }, [activeFylke]);
  // We use useEffect to add an event handler to the OpenLayers Map
  useEffect(() => {
    map.on("pointermove", handlePointerMove);
  }, []);

  // In React, we use a state variable to track the last variable moved
  const [selectedKommune, setSelectedKommune] = useState<Feature>();
  function handleClick(event: MapBrowserEvent) {
    // We look for any features in the Vector Source that overlap the clicked coordinate
    // Depending on the data, this could be zero, one or more features
    const kommune = kommuneSource.getFeaturesAtCoordinate(event.coordinate);
    // If at least one feature is clicked, we mark the first one as active
    setSelectedKommune(kommune.length > 0 ? kommune[0] : undefined);
  }
  // We use useEffect to add an event handler to the OpenLayers Map
  useEffect(() => {
    map.on("click", handleClick);
  }, []);

  // We define a React state to hold the list of kommuner
  const [allKommuner, setAllKommuner] = useState<Feature[]>([]);
  // We use a useEffect to handle OpenLayers' event when the data in the kommuneSource
  // is loaded (or otherwise changed)
  useEffect(() => {
    kommuneSource.on("change", () =>
      setAllKommuner(kommuneSource.getFeatures()),
    );
  }, []);
  // Zoom the map when the user clicks a kommune in the list
  function handleClickKommune(kommune: Record<string, any>) {
    view.animate({ center: getCenter(kommune["geometry"]!.getExtent()) });
  }

  return (
    <>
      <h1>
        {selectedKommune
          ? selectedKommune.getProperties()["kommunenavn"]
          : "Administrative regioner i Norge"}
      </h1>
      <main>
        <div ref={mapRef}></div>
        <aside>
          <h2>Alle kommuner</h2>
          <ul>
            {allKommuner
              .map((f) => f.getProperties())
              .sort((a, b) => a["kommunenavn"].localeCompare(b["kommunenavn"]))
              .map((k) => (
                <li key={k["kommunenummer"]}>
                  <a href={"#"} onClick={() => handleClickKommune(k)}>
                    {k["kommunenavn"]}
                  </a>
                </li>
              ))}
          </ul>
        </aside>
      </main>
    </>
  );
}

export default Application;
