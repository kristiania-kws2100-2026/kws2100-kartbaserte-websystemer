import React, { useEffect, useMemo, useRef, useState } from "react";
import { Map, View } from "ol";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import "./application.css";
import { getCenter } from "ol/extent.js";
import { Layer } from "ol/layer.js";
import { FylkeLayerCheckbox } from "../layers/fylkeLayer.js";
import {
  KommuneLayerCheckbox,
  type KommuneProperties,
} from "../layers/kommuneLayer.js";
import { BackgroundLayerSelect } from "../layers/backgroundLayers.js";

useGeographic();

const view = new View({ zoom: 9, center: [10, 59.5] });
const map = new Map({ view });

function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [alleKommuner, setAlleKommuner] = useState<KommuneProperties[]>([]);
  const [backgroundLayers, setBackgroundLayers] = useState<Layer[]>([]);
  const [fylkesLayers, setFylkesLayers] = useState<Layer[]>([]);
  const [kommuneLayers, setKommuneLayers] = useState<Layer[]>([]);

  const layers = useMemo(
    () => [...backgroundLayers, ...fylkesLayers, ...kommuneLayers],
    [backgroundLayers, fylkesLayers, kommuneLayers],
  );
  useEffect(() => map.setLayers(layers), [layers]);

  const [selectedKommune, setSelectedKommune] = useState<KommuneProperties>();

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
            ? selectedKommune.kommunenavn
            : "Kart over administrative områder i Norge"}
        </h1>
        <nav>
          <BackgroundLayerSelect setBackgroundLayers={setBackgroundLayers} />
          <KommuneLayerCheckbox
            map={map}
            setKommuneLayers={setKommuneLayers}
            setAlleKommuner={setAlleKommuner}
            setSelectedKommune={setSelectedKommune}
          />
          <FylkeLayerCheckbox setFylkesLayers={setFylkesLayers} map={map} />
        </nav>
      </header>
      <main>
        <div ref={mapRef}></div>
        {alleKommuner.length > 0 && (
          <aside>
            <h2>Alle kommuner</h2>
            <ul>
              {alleKommuner
                .sort((a, b) => a.kommunenavn.localeCompare(b.kommunenavn))
                .map((k) => (
                  <li>
                    <a href={"#"} onClick={() => handleClick(k)}>
                      {k.kommunenavn}
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

export default Application;
