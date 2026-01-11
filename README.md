# Demo of geographical web applications - lecture 1

A basic map application deployed to GitHub pages. Demonstrates:

- A basic React application
- Using GitHub Actions to deploy to GitHub pages
- Using TypeScript, prettier and Husky for code style and verification
- Displaying an OpenLayers map focused on Oslo
- OpenStreetMap background tile layer
- Show Norwegian counties and high schools from GeoJSON vector layers
- Style counties
- Display county names when user hovers over them
- Display high school names in overlay when user clicks

## Reference materials

### Creating a basic React application

```shell
npm init -y
npm pkg set type=module
npm install -D vite
npm install react react-dom
npm pkg set scripts.dev=vite

npm install -D typescript
npm install -D @types/react @types/react-dom
npx tsc --init --jsx react

npm install -D prettier
npx prettier --write .
npm pkg set scripts.test="tsc --noEmit && prettier --check ."

npm install -D husky
npx husky init

```

#### `index.html`

```html
<html lang="en">
  <body>
    <div id="root"></div>
  </body>
  <script src="src/main.tsx" type="module"></script>
</html>
```

#### Minimal `src/main.tsx`

```tsx
import React from "react";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(<h1>Hello React</h1>);
```

NB: In order to use `import "./application.css"`, you need to have the following in your `global.d.ts`:

```ts
declare module "*.css" {}
```

### Showing a simple map

```tsx
import React, { useEffect, useRef } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { useGeographic } from "ol/proj";

// Styling of OpenLayers components like zoom and pan controls
import "ol/ol.css";

// By calling the "useGeographic" function in OpenLayers, we tell that we want coordinates to be in degrees
//  instead of meters, which is the default. Without this `center: [10.6, 59.9]` brings us to "null island"
useGeographic();

// Here we create a Map object. Make sure you `import { Map } from "ol"`. Otherwise, the standard Javascript
//  map data structure will be used
const map = new Map({
  // The map will be centered on a position in longitude (x-coordinate, east) and latitude (y-coordinate, north),
  //   with a certain zoom level
  view: new View({ center: [11, 60], zoom: 8 }),
  // map tile images will be from the Open Street Map (OSM) tile layer
  layers: [new TileLayer({ source: new OSM() })],
});

// A functional React component
export function Application() {
  // `useRef` bridges the gap between JavaScript functions that expect DOM objects and React components
  const mapRef = useRef<HTMLDivElement | null>(null);
  // When we display the page, we want the OpenLayers map object to target the DOM object refererred to by the
  // map React component
  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);

  // This is the location (in React) where we want the map to be displayed
  return <div ref={mapRef}></div>;
}
```

### Deploying to GitHub pages

1. In the settings for your GitHub repository, make sure Build and deployment > Source is set to GitHub Actions
2. `npm pkg set scripts.build="vite build"`
3. Create a `vite.config.ts` file to use the repository name as your base URL:

   ```ts
   import { defineConfig } from "vite";

   export default defineConfig({
     // This has to be equal to the name of your repository
     // For example, since this repository is https://github.com/kristiania-kws2100-2026/kws2100-kartbaserte-websystemer,
     //  `base` has to be `/kws2100-kartbaserte-websystemer`
     base: "/kws2100-kartbaserte-websystemer",
   });
   ```

4. Create a workflow file: `.github/workflows/publish.yaml`

   ```yaml
   on:
     push:
       branches: [main, lectures/*, reference/*]

   jobs:
     publish:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v6
           with: { node-version: 22.x, cache: "npm" }
         - run: npm ci
         - run: npm run build
         - uses: actions/upload-pages-artifact@v3
           with: { path: "./dist" }
         - uses: actions/deploy-pages@v4

   permissions:
     id-token: write
     pages: write
   ```

### Display and style vector layers

Using `import.meta.env.BASE_URL` requires the following line in `global.d.ts`

```ts
/// <reference types="vite/client" />
```

```tsx
// A VectorSource defines an object defined by its coordinates.
// It can be a polygon (or more precisely a multi-polygon) such as administrative regions
const fylkeSource = new VectorSource({
  // Download https://github.com/robhop/fylker-og-kommuner/blob/main/Fylker-M.geojson as /public/geojson/fylker.geojson
  url: `${import.meta.env.BASE_URL}/geojson/fylker.geojson`,
  format: new GeoJSON(),
});
// A VectorSource can also be defined as points, for example schools
const vgsSource = new VectorSource({
  // Download schools from https://kart.dsb.no as /public/geojson/vgs.geojson
  url: `${import.meta.env.BASE_URL}/geojson/vgs.geojson`,
  format: new GeoJSON(),
});
const map = new Map({
  layers: [
    new TileLayer({ source: new OSM() }),
    // We add more layers to our map
    new VectorLayer({
      source: fylkeSource,
      // The style describes how to draw the polygon
      style: new Style({
        // Draw fylker with a thin black outline
        stroke: new Stroke({ color: "black", width: 1 }),
      }),
    }),
    new VectorLayer({
      source: vgsSource,
      style: new Style({
        // Points, like a school have 0 size, so we must use an image to represent it
        // We draw schools as circles with radius 6 with a black outline and red fill
        image: new Circle({
          radius: 6,
          stroke: new Stroke({ color: "black" }),
          fill: new Fill({ color: "red" }),
        }),
      }),
    }),
  ],
  view: new View({ center: [11, 60], zoom: 9 }),
});
```

### Change style on hover

We can change the style of a feature, for example administrative regions, based on user interaction.
This example changes the style when the user hovers over a feature

```tsx
export function Application() {
  // React state to keep track of which feature is currently under the cursor
  const [activeFylke, setActiveFylke] = useState<Feature>();

  // event handler for OpenLayers. Bound with `map.on("pointermove")` below
  function handlePointerMove(e: MapBrowserEvent) {
    // Find the features under the cursor (using the geographical coordinate)
    const features = fylkeSource.getFeaturesAtCoordinate(e.coordinate);
    setActiveFylke(features.length > 0 ? features[0] : undefined);
  }

  // useEffect can a have dependencies - what triggers the effect to run again
  // In this case, specifying `[activeFylke]` means that each time activeFylke is changed
  // the effect is run again
  useEffect(() => {
    // Set the style of the active fylke explicitly
    activeFylke?.setStyle(activeFylkeStyle);
    // the function returned by `useEffect` is executed just before `useEffect`
    // is called again. This is used to clean up
    return () => activeFylke?.setStyle(undefined);
  }, [activeFylke]);

  // OpenLayers style can take features (the geographical object) as input,
  // deciding how to style based on the properties of that feature
  function activeFylkeStyle(feature: FeatureLike): Style {
    // The property "fylkesnavn" is a JSON property on each
    //  object in `/public/geojson/fylker.geojson`
    const fylkesnavn = feature.getProperties()["fylkesnavn"];
    return new Style({
      // Make the active fylke have a wider outline
      stroke: new Stroke({ color: "black", width: 3 }),
      // Display the name of the feature as a text
      text: new Text({
        text: fylkesnavn,
        stroke: new Stroke({ color: "white", width: 2 }),
        font: "bold 24px serif",
      }),
    });
  }

  useEffect(() => {
    map.setTarget(mapRef.current!);
    // Here, we bind the `handlePointerMove` handler to the "pointermove" OpenLayers event
    map.on("pointermove", handlePointerMove);
  }, []);
  return <div ref={mapRef} />;
}
```

### Show overlay on click

An overlay is a dialog displayed in the map. It is associated with a geographical location, so
it will move as the user zooms and pans the map. In this example, we use an overlay to show what
school the user clicked.

```tsx
// An Overlay is element to be displayed over the map and attached to a single map location
const overlay = new Overlay({positioning: "bottom-center"});

export function Application() {
    const mapRef = useRef<HTMLDivElement | null>(null);

    // activeFylke, handlePointerMove, useEffect to bind activeFylkeStyle and activeFylkeStyle is omitted for brevity

    // the overlay (above should be displayed as HTML, so we need a reference to bind it to the DOM)
    const overlayRef = useRef<HTMLDivElement | null>(null);

    // React state to keep track of which feature was clicked
    const [selectedSchools, setSelectedSchools] = useState<FeatureLike[]>([]);

    // event handler for OpenLayers. Bound with `map.on("click")` below
    function handleClick(e: MapBrowserEvent) {
        // Since schools are point-features, they have zero size and cannot be hit
        // Instead, we ask the map what features are displayed at a pixel point
        const features = map.getFeaturesAtPixel(e.pixel, {
            // adding a filter avoids returning fylker as well as schools
            layerFilter: (l) => l.getSource() === vgsSource,
        });
        setSelectedSchools(features);
        // if at least one feature was selected, show an overlay where the user clicked
        // if no feature was selected, hide the overlay by unsetting its position
        overlay.setPosition(features.length > 0 ? e.coordinate : undefined);
    }

    useEffect(() => {
        // old stuff
        map.setTarget(mapRef.current!);
        map.on("pointermove", handlePointerMove);

        // bind the overlay object to the React element that should be displayed
        overlay.setElement(overlayRef.current!);

        // bind OpenLayer click events to the click handler
        map.on("click", handleClick);
        // adding the overlay to the map removes it from the DOM.
        // its location and visibility will be controlled by OpenLayers
        map.addOverlay(overlay);
    }, []);
    return (
        <>
            <div ref={mapRef}/>
            <!-- The overlay functions as a normal React element, displaying HTML based on state -->
            <div ref={overlayRef}>
                {selectedSchools.length === 1
                    ? selectedSchools[0]!.getProperties()["skolenavn"]
                    : `${selectedSchools.length} valgte skoler`}
            </div>
        </>
    );
}
```

#### Bonus: Show a cute CSS arrow with a border-trick

By default, the overlay is displayed without any styling. But OpenLayers
renders it within an element with the class name `ol-overlay-container`

We can make it a bit nicer by giving it a background, padding and rounded corners

```CSS
.ol-overlay-container {
  background-color: white;
  padding: 0.25em;
  border-radius: 8px;
  margin-top: -1.2rem;
}
```

It can be a bit hard to see which feature an overlay is associated. This
is an old CSS trick to display an arrow under a CSS element:

```CSS
.ol-overlay-container {
   &::before {
      content: "";
      border-style: solid;
      position: absolute;
      /* this makes the bottom border disappear, so the top border will appear as an arrow */
      border-width: 0.8em 0.5em 0 0.5em;
      /* only the top border should be displayed (try to play with "border-color: white red green blue" to see what's happening */
      border-color: white transparent transparent transparent;
      /* this places the arrow directly below its parent (the ol-overlay-container) */
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
   }
}
```
