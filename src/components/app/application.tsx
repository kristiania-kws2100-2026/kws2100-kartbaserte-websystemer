import React, { useEffect, useRef } from "react";

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mapRef.current!.innerText = "Hello JavaScript";
    mapRef.current!.style.backgroundColor = "lightblue";
    mapRef.current!.style.height = "100%";
  }, []);

  return <div ref={mapRef}>MAP HERE</div>;
}
