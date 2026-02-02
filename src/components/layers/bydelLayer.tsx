import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import { Stroke, Style } from "ol/style.js";

export const bydelLayer = new VectorLayer({
  source: new VectorSource({
    url: "/kws2100-kartbaserte-websystemer/bydeler.geojson",
    format: new GeoJSON(),
  }),
  style: new Style({
    stroke: new Stroke({ color: "black", width: 3 }),
  }),
});
