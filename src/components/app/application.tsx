import React, { useEffect, useMemo, useRef, useState } from "react";
import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import "./application.css";
import { getCenter } from "ol/extent.js";
import { Layer } from "ol/layer.js";
import { FylkesLayerCheckbox } from "../layer/fylkesLayerCheckbox.js";
import { KommuneLayerCheckbox } from "../layers/kommuneLayerCheckbox.js";
import { BackgroundLayerSelect } from "../layers/backgroundLayerSelect.js";

useGeographic();

const view = new View({ zoom: 5, center: [10, 78], projection: "EPSG:3575" });
const map = new Map({ view });

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [alleKommuner, setAlleKommuner] = useState<Feature[]>([]);
  const [selectedKommune, setSelectedKommune] = useState<Feature>();

  const [fylkesLayers, setFylkesLayers] = useState<Layer[]>([]);
  const [kommuneLayers, setKommuneLayers] = useState<Layer[]>([]);
  const [backgroundLayer, setBackgroundLayer] = useState<Layer>(
    new TileLayer({ source: new OSM() }),
  );
  const layers = useMemo(
    () => [backgroundLayer, ...fylkesLayers, ...kommuneLayers],
    [backgroundLayer, fylkesLayers, kommuneLayers],
  );
  useEffect(() => map.setLayers(layers), [layers]);

  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);

  function handleClick(kommuneProperties: Record<string, any>) {
    const { geometry } = kommuneProperties;
    view.animate({ center: getCenter(geometry.getExtent()) });
  }

  return (
    <>
      <header>
        <h1>
          {selectedKommune
            ? selectedKommune.getProperties()["kommunenavn"]
            : "Kart over administrative områder i Norge"}
        </h1>
        <div>
          <BackgroundLayerSelect setBackgroundLayer={setBackgroundLayer} />
          <FylkesLayerCheckbox setFylkesLayers={setFylkesLayers} map={map} />
          <KommuneLayerCheckbox
            setKommuneLayers={setKommuneLayers}
            map={map}
            setAlleKommuner={setAlleKommuner}
            setSelectedKommune={setSelectedKommune}
          />
        </div>
      </header>
      <main>
        <div ref={mapRef}></div>
        {alleKommuner.length > 0 && (
          <aside>
            <h2>Alle kommuner</h2>

            <ul>
              {alleKommuner
                .map((f) => f.getProperties())
                .sort((a, b) =>
                  a["kommunenavn"].localeCompare(b["kommunenavn"]),
                )
                .map((k) => (
                  <li>
                    <a href={"#"} onClick={() => handleClick(k)}>
                      {k["kommunenavn"]}
                    </a>
                  </li>
                ))}
            </ul>
          </aside>
        )}
      </main>
    </>
  );
}
