# Drawing features on the map with the mouse

## Drawing a feature

```tsx
const drawingVectorSource = new VectorSource();
const drawingLayer = new VectorLayer({
  source: drawingVectorSource,
});

const map = new Map({
  view: new View({ center: [10.7, 59.9], zoom: 12 }),
  layers: [new TileLayer({ source: new OSM() }), drawingLayer],
});

function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    map.setTarget(mapRef.current!);
    map.on("click", handleMapClick);
  }, []);

  function handleClick() {
    const draw = new Draw({ type: "Point", source: drawingVectorSource });
    map.addInteraction(draw);
    drawingVectorSource.once("addfeature", () => map.removeInteraction(draw));
  }

  return (
    <>
      <nav>
        <button onClick={handleClick}>Draw point</button>
      </nav>
      <div ref={mapRef}></div>
    </>
  );
}
```

## Saving the features to localStorage

```tsx
const geojson = new GeoJSON();

const features = localStorage.getItem("features");
if (features) {
  drawingVectorSource.addFeatures(geojson.readFeatures(features));
}

function Application() {
  useEffect(() => {
    drawingVectorSource.on("change", () => {
      localStorage.setItem(
        "features",
        geojson.writeFeatures(drawingVectorSource.getFeatures()),
      );
    });
  }, []);
}
```

## Updating feature properties

```tsx
const drawingLayer = new VectorLayer({
  source: drawingVectorSource,
  style,
});

function style(feature: FeatureLike) {
  const color = feature.getProperties()["color"] || "blue";
  return [
    new Style({
      image: new RegularShape({
        points: 4,
        radius: 10,
        fill: new Fill({ color }),
      }),
    }),
  ];
}

const [feature, setFeature] = useState<Feature>();

const [color, setColor] = useState<string>("blue");
useEffect(() => feature?.setProperties({ color }), [color]);
useEffect(() => {
  if (feature) {
    setColor(feature.getProperties()["color"] || "blue");
  }
}, [feature]);

<input type="color" value={color} onChange={(e) => setColor(e.target.value)} />;
```
