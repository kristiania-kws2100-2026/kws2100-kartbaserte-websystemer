import { Layer } from "ol/layer.js";
import { useEffect, useState } from "react";
import TileLayer from "ol/layer/Tile.js";
import { OSM, StadiaMaps, WMTS } from "ol/source.js";
import { WMTSCapabilities } from "ol/format.js";
import { optionsFromCapabilities } from "ol/source/WMTS.js";
import proj4 from "proj4";
import { register } from "ol/proj/proj4.js";

proj4.defs(
  "EPSG:25832",
  "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
);
proj4.defs(
  "EPSG:3575",
  "+proj=laea +lat_0=90 +lon_0=10 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs",
);

register(proj4);

const osmLayer = new TileLayer({ source: new OSM() });

const stadiaLayer = new TileLayer({
  source: new StadiaMaps({
    layer: "alidade_smooth",
  }),
});

const kartverketLayer = new TileLayer();
fetch("https://cache.kartverket.no/v1/wmts/1.0.0/WMTSCapabilities.xml").then(
  async (res) => {
    const parser = new WMTSCapabilities();
    const capabilities = parser.read(await res.text());
    kartverketLayer.setSource(
      new WMTS(
        optionsFromCapabilities(capabilities, {
          layer: "toporaster",
          matrixSet: "webmercator",
        })!,
      ),
    );
  },
);
const aerialLayer = new TileLayer();
fetch(
  "http://opencache.statkart.no/gatekeeper/gk/gk.open_nib_utm32_wmts_v2?SERVICE=WMTS&REQUEST=GetCapabilities",
).then(async (res) => {
  const parser = new WMTSCapabilities();
  const capabilities = parser.read(await res.text());
  aerialLayer.setSource(
    new WMTS(
      optionsFromCapabilities(capabilities, {
        layer: "Nibcache_UTM32_EUREF89_v2",
        matrixSet: "default028mm",
      })!,
    ),
  );
});
const arcticLayer = new TileLayer();
fetch("/kws2100-kartbaserte-websystemer/arctic-sdi.xml").then(async (res) => {
  const parser = new WMTSCapabilities();
  const capabilities = parser.read(await res.text());
  arcticLayer.setSource(
    new WMTS(
      optionsFromCapabilities(capabilities, {
        layer: "arctic_cascading",
        matrixSet: "3575",
      })!,
    ),
  );
});

export function BackgroundLayerSelect({
  setBackgroundLayer,
}: {
  setBackgroundLayer: (value: Layer) => void;
}) {
  const [backgroundLayerValue, setBackgroundLayerValue] =
    useState<string>("osm");
  useEffect(() => {
    setBackgroundLayer(osmLayer);
  }, []);
  useEffect(() => {
    if (backgroundLayerValue === "stadia") {
      setBackgroundLayer(stadiaLayer);
    } else if (backgroundLayerValue === "osm") {
      setBackgroundLayer(osmLayer);
    } else if (backgroundLayerValue === "arctic") {
      setBackgroundLayer(arcticLayer);
    } else if (backgroundLayerValue === "aerial") {
      setBackgroundLayer(aerialLayer);
    } else if (backgroundLayerValue === "kartverket") {
      setBackgroundLayer(kartverketLayer);
    }
  }, [backgroundLayerValue]);

  return (
    <select
      value={backgroundLayerValue}
      onChange={(e) => setBackgroundLayerValue(e.target.value)}
    >
      <option value={"osm"}>OpenStreetMap bakgrunn</option>
      <option value={"arctic"}>Arktisk bakgrunnskart</option>
      <option value={"stadia"}>Stadia bakgrunnskart</option>
      <option value={"kartverket"}>Kartverket bakgrunnskart</option>
      <option value={"aerial"}>Kartverket flyfoto</option>
    </select>
  );
}
