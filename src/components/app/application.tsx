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
import proj4 from "proj4";
import { register } from "ol/proj/proj4.js";

proj4.defs(
  "urn:ogc:def:crs:EPSG::25833",
  "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
);
proj4.defs(
  "EPSG:3571",
  "+proj=laea +lat_0=90 +lon_0=180 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs",
);
proj4.defs(
  "EPSG:3575",
  "+proj=laea +lat_0=90 +lon_0=10 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs",
);
register(proj4);

useGeographic();

const map = new Map();

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

  const [view, setView] = useState(new View({ zoom: 6, center: [15, 78] }));
  useEffect(() => map.setView(view), [view]);

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
          <BackgroundLayerSelect
            setBackgroundLayers={setBackgroundLayers}
            setView={setView}
          />
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
