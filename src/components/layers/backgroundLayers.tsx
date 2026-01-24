import React, { useEffect, useMemo, useState } from "react";
import type { Layer } from "ol/layer.js";
import TileLayer from "ol/layer/Tile.js";
import { OSM, StadiaMaps, WMTS } from "ol/source.js";
import { WMTSCapabilities } from "ol/format.js";
import { optionsFromCapabilities } from "ol/source/WMTS.js";
import proj4 from "proj4";
import { register } from "ol/proj/proj4.js";
import { useDarkMode } from "../../hooks/useDarkMode.js";

proj4.defs(
  "urn:ogc:def:crs:EPSG::25833",
  "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
);
proj4.defs(
  "EPSG:3571",
  "+proj=laea +lat_0=90 +lon_0=180 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs",
);
register(proj4);

const osmLayer = new TileLayer({ source: new OSM() });

const kartverket = new TileLayer({});
const kartverketUrl =
  "https://cache.kartverket.no/v1/wmts/1.0.0/WMTSCapabilities.xml";
fetch(kartverketUrl).then(async (response) => {
  const parser = new WMTSCapabilities();
  kartverket.setSource(
    new WMTS(
      optionsFromCapabilities(parser.read(await response.text()), {
        layer: "toporaster",
        matrixSet: "webmercator",
      })!,
    ),
  );
});

const flyfoto = new TileLayer({});
const flyfotoUrl =
  "http://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm33_wmts_v2?SERVICE=WMTS&REQUEST=GetCapabilities";
fetch(flyfotoUrl).then(async (response) => {
  const parser = new WMTSCapabilities();
  const capabilities = parser.read(await response.text());
  flyfoto.setSource(
    new WMTS(
      optionsFromCapabilities(capabilities, {
        layer: "Nibcache_UTM33_EUREF89_v2",
        matrixSet: "default028mm",
      })!,
    ),
  );
});

const arctic = new TileLayer({});
const arcticUrl = "/kws2100-kartbaserte-websystemer/arctic-sdi.xml";
fetch(arcticUrl).then(async (response) => {
  const parser = new WMTSCapabilities();
  const capabilities = parser.read(await response.text());
  arctic.setSource(
    new WMTS(
      optionsFromCapabilities(capabilities, {
        layer: "arctic_cascading",
        matrixSet: "3571",
      })!,
    ),
  );
});

const LayerOptions = {
  osmLayer: "OpenStreetMap bakgrunnskart",
  arctic: "Arktisk bakgrunnskart",
  kartverket: "Kartverkets bakgrunnskart",
  flyfoto: "Flyfoto",
  stadiaLayer: "Stadia backgrunnskart",
};
type LayerName = keyof typeof LayerOptions;

export function BackgroundLayerSelect({
  setBackgroundLayers,
}: {
  setBackgroundLayers: (value: Layer[]) => void;
}) {
  const darkMode = useDarkMode();

  const stadiaLayer = useMemo(() => {
    return new TileLayer({
      source: new StadiaMaps({
        layer: darkMode ? "alidade_smooth_dark" : "alidade_smooth",
      }),
    });
  }, [darkMode]);

  const layers = useMemo<Record<LayerName, Layer>>(
    () => ({
      osmLayer,
      arctic,
      kartverket,
      flyfoto,
      stadiaLayer,
    }),
    [stadiaLayer],
  );

  const [layerName, setLayerName] =
    useState<keyof typeof LayerOptions>("arctic");
  useEffect(
    () => setBackgroundLayers([layers[layerName]!]),
    [layerName, layers],
  );

  return (
    <select
      onChange={(e) => setLayerName(e.target.value as LayerName)}
      value={layerName}
    >
      {Object.entries(LayerOptions).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}
