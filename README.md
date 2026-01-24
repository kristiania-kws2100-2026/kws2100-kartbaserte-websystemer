# Selecting background layers

This lecture demonstrates selecting background layers

The basic technique we will be using is to have the layers represented as React state:

```tsx
const [backgroundLayers, setBackgroundLayers] = useState<Layer[]>([]);
const [fylkesLayers, setFylkesLayers] = useState<Layer[]>([]);
const [kommuneLayers, setKommuneLayers] = useState<Layer[]>([]);

const layers = useMemo(
  () => [...backgroundLayers, ...fylkesLayers, ...kommuneLayers],
  [backgroundLayers, fylkesLayers, kommuneLayers],
);
useEffect(() => map.setLayers(layers), [layers]);
```

We have a dropdown that selects the layer based on the user choice:

```tsx
const [layerName, setLayerName] =
  useState<keyof typeof LayerOptions>("osmLayer");
const layer = useMemo(() => layers[layerName]!, [layerName, layers]);

useEffect(() => {
  setBackgroundLayers([layer]);
}, [layer]);

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
```

We have a number of layers options:

```tsx
const LayerOptions = {
  osmLayer: "OpenStreetMap bakgrunnskart",
  arctic: "Arktisk bakgrunnskart",
  kartverket: "Kartverkets bakgrunnskart",
  flyfoto: "Flyfoto",
  stadiaLayer: "Stadia backgrunnskart",
};
```

The layers are based on the Layer Options:

```tsx
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
```

In this example, we change the StadiaMap layer based on the user color preference:

```tsx
const darkMode = useDarkMode();

const stadiaLayer = useMemo(() => {
  return new TileLayer({
    source: new StadiaMaps({
      layer: darkMode ? "alidade_smooth_dark" : "alidade_smooth",
    }),
  });
}, [darkMode]);
```

We load the kartverket layer based on the WMTS definition

```tsx
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
```

We load the arialLayer based on the WMTS definition:

```ts
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
```

This requires the definition of the UTM-33 projection (`npm install proj4`):

```tsx
proj4.defs(
  "EPSG:25833",
  "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
);
register(proj4);
```

The Arctic layer definition is downloaded from https://arctic-sdi.org/services/topografic-basemap/ and stored locally
in `public/wmts/arctic-sdi.xml` (due to CORS-issues). It is read as WMTS and we define the projection:

```tsx
const arctic = new TileLayer({});
const arcticUrl = "/kws2100-kartbaserte-websystemer/arctic-sdi.xml";
fetch(arcticUrl).then(async (response) => {
  const parser = new WMTSCapabilities();
  const capabilities = parser.read(await response.text());
  arctic.setSource(
    new WMTS(
      optionsFromCapabilities(capabilities, {
        layer: "arctic_cascading",
        matrixSet: "3575",
      })!,
    ),
  );
});

proj4.defs(
  "EPSG:3575",
  "+proj=laea +lat_0=90 +lon_0=10 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs",
);
register(proj4);
```

To display correctly, we need to update the view when we change the base map:

```tsx
useEffect(() => {
  if (layer.getSource()) {
    const projection = layer.getSource()!.getProjection()!;
    setView(
      (v) =>
        new View({
          center: v.getCenter()!,
          zoom: v.getZoom()!,
          projection,
        }),
    );
  }
  setBackgroundLayers([layer]);
}, [layer, layer.getSource()]);
```
