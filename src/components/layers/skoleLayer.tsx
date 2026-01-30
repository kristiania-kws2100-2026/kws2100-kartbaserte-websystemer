import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import { Circle, Fill, Stroke, Style } from "ol/style.js";
import { Feature } from "ol";
import type { FeatureLike } from "ol/Feature.js";

interface SchoolProperties {
  navn: string;
  antall_elever: number;
  antall_ansatte: number;
  lavest_trinn: number;
  hoyeste_trinn: number;
  eierforhold: "Privat" | "Offentlig";
}

function style(school: FeatureLike) {
  const props = school.getProperties() as SchoolProperties;
  return new Style({
    image: new Circle({
      radius: 5 + props.antall_elever / 100,
      fill: new Fill({
        color: props.eierforhold === "Privat" ? "purple" : "blue",
      }),
      stroke: new Stroke({ color: "white", width: 2 }),
    }),
  });
}

export const skoleLayer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: "/kws2100-kartbaserte-websystemer/geojson/skoler.geojson",
  }),
  style,
});
