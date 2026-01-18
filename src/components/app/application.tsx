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
const view = new View({ center: [11, 59], zoom: 8 });
const map = new Map({
  layers: [new TileLayer({ source: new OSM() }), kommuneLayer, fylkeLayer],
  view,
});

function activeFylkeStyle(fylke: FeatureLike) {
  return new Style({
    text: new Text({
      text: fylke.getProperties()["fylkesnavn"],
    }),
  });
}

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [activeFylke, setActiveFylke] = useState<Feature>();
  const [selectedKommune, setSelectedKommune] = useState<Feature>();
  const [allKommuner, setAllKommuner] = useState<Feature[]>([]);

  function handlePointerMove(event: MapBrowserEvent) {
    const fylke = fylkeSource.getFeaturesAtCoordinate(event.coordinate);
    setActiveFylke(fylke.length > 0 ? fylke[0] : undefined);
  }

  function handleClick(event: MapBrowserEvent) {
    const kommune = kommuneSource.getFeaturesAtCoordinate(event.coordinate);
    setSelectedKommune(kommune.length > 0 ? kommune[0] : undefined);
  }

  function handleKommuneSourceChange() {
    setAllKommuner(kommuneSource.getFeatures());
  }

  function handleClickKommune(kommune: Feature) {
    view.animate({
      center: getCenter(kommune.getGeometry()!.getExtent()),
    });
  }

  useEffect(() => {
    activeFylke?.setStyle(activeFylkeStyle);
    return () => activeFylke?.setStyle(undefined);
  }, [activeFylke]);

  useEffect(() => {
    map.setTarget(mapRef.current!);
    map.on("pointermove", handlePointerMove);
    map.on("click", handleClick);

    kommuneSource.on("change", handleKommuneSourceChange);
  }, []);

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
              .sort((a, b) =>
                a
                  .getProperties()
                  [
                    "kommunenavn"
                  ].localeCompare(b.getProperties()["kommunenavn"]),
              )
              .map((k) => (
                <li key={k.getProperties()["kommunenummer"]}>
                  <a href={"#"} onClick={() => handleClickKommune(k)}>
                    {k.getProperties()["kommunenavn"]}
                  </a>
                </li>
              ))}
          </ul>
        </aside>
      </main>
    </>
  );
}
