import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import { Circle, Fill, Stroke, Style, Text } from "ol/style.js";
import type { FeatureLike } from "ol/Feature.js";

interface SkoleProperties {
  antall_ansatte: number;
  antall_elever: number;
  eierforhold: "Offentlig" | "Privat";
  navn: string;
}

function skoleStyle(feature: FeatureLike) {
  const props = feature.getProperties() as SkoleProperties;

  return new Style({
    image: new Circle({
      radius: 4 + props.antall_elever / 100,
      stroke: new Stroke({ width: 2, color: "white" }),
      fill: new Fill({
        color: props.eierforhold === "Offentlig" ? "blue" : "purple",
      }),
    }),
  });
}

export const skoleLayer = new VectorLayer({
  source: new VectorSource({
    url: "/kws2100-kartbaserte-websystemer/skoler.geojson",
    format: new GeoJSON(),
  }),
  style: skoleStyle,
});
export function activeSkoleStyle(feature: FeatureLike) {
  const props = feature.getProperties() as SkoleProperties;

  return [
    new Style({
      image: new Circle({
        radius: 4 + props.antall_elever / 100,
        stroke: new Stroke({ width: 5, color: "white" }),
        fill: new Fill({
          color: props.eierforhold === "Offentlig" ? "blue" : "purple",
        }),
      }),
    }),
    new Style({
      text: new Text({
        text: props.navn,
        font: "30px sans-serif",
        stroke: new Stroke({ color: "white", width: 3 }),
      }),
    }),
  ];
}
