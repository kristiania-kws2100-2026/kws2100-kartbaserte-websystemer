import React, { useEffect, useRef } from "react";
import { Map } from "ol";

const map = new Map();

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);
  return (
    <>
      <h1>Hello OpenLayers</h1>
      <div ref={mapRef}>Here is the map</div>
    </>
  );
}
