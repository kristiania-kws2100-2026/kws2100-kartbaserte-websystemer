import type { FeatureLike } from "ol/Feature.js";
import { Fill, Stroke, Style } from "ol/style.js";
import type { RodeFeature } from "./rodeFeature.js";

export function rodeStyle(genericFeature: FeatureLike): Style {
  const feature = genericFeature as RodeFeature;
  const props = feature.getProperties();
  console.log({ props });

  if ("error" in props) {
    return new Style({
      fill: new Fill({ color: "red" }),
    });
  }
  if ("loading" in props && props.loading) {
    return new Style({
      fill: new Fill({ color: "rgb(0, 0, 0, 50%)" }),
      stroke: new Stroke({ color: "black" }),
    });
  }
  if ("adresser" in props) {
    return new Style({
      fill: new Fill({ color: "green" }),
    });
  }

  return new Style({
    fill: new Fill({ color: "rgb(255, 255, 0, 50%)" }),
    stroke: new Stroke({ color: "black" }),
  });
}
