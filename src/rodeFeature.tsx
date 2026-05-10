import { Feature } from "ol";
import { Polygon } from "ol/geom.js";

export type RodeProperties =
  | {
      adresser: {
        adresseid: number;
        adressenavn: string;
        antall_bruksenheter: number;
      }[];
    }
  | { loading: true }
  | { error: string };
export type RodeFeature = Feature<Polygon, RodeProperties> & {
  getProperties(): RodeProperties;
};
