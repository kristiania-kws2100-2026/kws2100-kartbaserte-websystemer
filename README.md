# Working with polygons in a map

This lecture shows how to display and interact with polygons on a map by hovering over featurings, clicking on a feature in the map and zooming to a feature selected from a list

## Quick setup of the application:

<details>

### React application with Vite, Prettier, TypeScript and Husky

```shell
npm init -y
npm pkg set type=module
npm install react react-dom
npm install -D vite prettier typescript @types/react @types/react-dom husky
npm pkg set scripts.dev=vite
npx tsc --init
npx husky init
npx prettier --write .
npm pkg set scripts.test="tsc --noEmit && prettier --check ."

```

### Initial files

**index.html**

```html
<!doctype html>
<html lang="en">
  <body>
    <div id="root"></div>
  </body>
  <script src="src/main.tsx" type="module"></script>
</html>
```

**src/main.tsx**

```tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { Application } from "./components/app/application.js";

createRoot(document.getElementById("root")!).render(<Application />);
```

**src/components/app/application.tsx**

```tsx
import React from "react";

export function Application() {
  return <h1>Map Application</h1>;
}
```

### Deploying the application to GitHub pages

- `npm pkg set scripts.build="vite build"`
- Add `dist` to `.gitignore`

**vite.config.ts**

```ts
import { defineConfig } from "vite";

export default defineConfig({
  // Change "/my-repo" to be the name of your GitHub repository. For example
  // when my code is at https://github.com/kristiania-kws2100-2025/kws2100-kartbaserte-websystemer/
  // I should have `base: "/kws2100-kartbaserte-websystemer"`
  base: "/my-repo",
});
```

**.github/workflows/publish-to-github-pages.yaml**

<details>

```yaml
on:
  push:
    # Only deploy when the branch name matches one of these
    # You probably only need `main`, the others are provided to work with the lectures
    branches: ["main", "reference/*", "lecture/*"]

# Jobs defines one or more actions that GitHub should execute when we push changes
jobs:
  # The name "build" is our name for this job. It can be anything you like
  build:
    # What operating system should it run on?
    runs-on: ubuntu-latest
    # The list of actions to execute in this job
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22.x, cache: "npm" }
      # "npm ci" is almost the same as "npm install". As `node_modules` is `.gitignore`-d,
      # this download the dependencies specified in `package.json` during the build process
      - run: npm ci
      # runs the script named "build" in `package.json`
      - run: npm run build
      # runs the script named "test" in `package.json`
      - run: npm test
      # saves the output of build (in `./dist`) for further use
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
      # publishes the uploaded code from the previous steps to GitHub Pages
      - uses: actions/deploy-pages@v4

    permissions:
      id-token: write # to verify the deployment originates from an appropriate source
      pages: write # to deploy to Pages
      contents: read # to check out private repositories
```

</details>

</details>

## The basic structure of a OpenLayers application:

- `npm install ol`

**Update src/components/app/application.tsx**

```tsx
import React, { useEffect, useRef, useState } from "react";
import { Feature, Map, MapBrowserEvent, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useGeographic } from "ol/proj.js";

useGeographic();

const layers = [new TileLayer({ source: new OSM() })];
const view = new View({ center: [11, 59], zoom: 8 });
const map = new Map({ layers, view });

export function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);

  return (
    <>
      <h1>Administrative regioner i Norge </h1>
      <main>
        <div ref={mapRef}></div>
      </main>
    </>
  );
}
```

### For TypeScript to support CSS-files

**global.d.ts**

```ts
declare module "*.css" {}
```

**in src/components/app/application.tsx**

```tsx
import "./application.css";
import "ol/ol.css";
```

**in src/components/app/application.css**

```css
* {
  margin: unset;
}

#root {
  height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr;
}

#root > h1 {
  padding: 0.5rem;
}
```

## Adding functionality to the map

### Hover over a feature

At the top level of `src/components/app/application.tsx`, update the layers to include fylker:

```tsx
const fylkeSource = new VectorSource({
  url: "/kws2100-kartbaserte-websystemer/geojson/fylker.geojson",
  format: new GeoJSON(),
});
const fylkeLayer = new VectorLayer({
  source: fylkeSource,
});
const layers = [new TileLayer({ source: new OSM() }), fylkeLayer];
```

In the same file, in `function Application()` add a handler for "pointermove":

```ts
function Application() {
  // In React, we use a state to keep track of which fylke the user is hovering over
  const [activeFylke, setActiveFylke] = useState<Feature>();

  // In OpenLayers, we can define a style function which is evaluated for each feature with that style
  function activeFylkeStyle(fylke: FeatureLike) {
    // Features have properties in the GeoJSON file that we can inspect
    const fylkesnavn = fylke.getProperties()["fylkesnavn"];
    // We define a style that shows a text based on a feature property
    return new Style({ text: new Text({ text: fylkesnavn }) });
  }

  function handlePointerMove(event: MapBrowserEvent) {
    // We look for any features in the Vector Source that overlap the hovered coordinate
    // Depending on the data, this could be zero, one or more features
    const fylke = fylkeSource.getFeaturesAtCoordinate(event.coordinate);
    // If at least one feature is under the point, we mark the first one as active
    setActiveFylke(fylke.length > 0 ? fylke[0] : undefined);
  }

  // a useEffect can be set up to triggered when a state value changes.
  //  In this case, the value of `activeFylke`
  useEffect(() => {
    // We can override the style function for this one fylke
    activeFylke?.setStyle(activeFylkeStyle);
    // when useEffect returns a function, this function is called with the old value
    //  so that we can clean up any effect
    return () => activeFylke?.setStyle(undefined);
  }, [activeFylke]);
  // We use useEffect to add an event handler to the OpenLayers Map
  useEffect(() => {
    map.on("pointermove", handlePointerMove);
  }, []);

  // Keep the old function here
}
```

### Click a feature

At the top level of `src/components/app/application.tsx`, update the layers to include fylker:

```tsx
const kommuneSource = new VectorSource({
  url: "/kws2100-kartbaserte-websystemer/geojson/kommuner.geojson",
  format: new GeoJSON(),
});
const kommuneLayer = new VectorLayer({
  source: kommuneSource,
});
const layers = [new TileLayer({ source: new OSM() }), kommuneLayer, fylkeLayer];
```

In the same file, in `function Application()` add a handler for "click":

```tsx
function Application() {
  // In React, we use a state variable to track the last variable moved
  const [selectedKommune, setSelectedKommune] = useState<Feature>();

  function handleClick(event: MapBrowserEvent) {
    // We look for any features in the Vector Source that overlap the clicked coordinate
    // Depending on the data, this could be zero, one or more features
    const kommune = kommuneSource.getFeaturesAtCoordinate(event.coordinate);
    // If at least one feature is clicked, we mark the first one as active
    setSelectedKommune(kommune.length > 0 ? kommune[0] : undefined);
  }

  // We use useEffect to add an event handler to the OpenLayers Map
  useEffect(() => {
    map.on("click", handleClick);
  }, []);

  // ...

  return (
    <>
      <h1>
        {selectedKommune
          ? selectedKommune.getProperties()["kommunenavn"]
          : "Administrative regioner i Norge"}
      </h1>
      <main>
        <div ref={mapRef}></div>
      </main>
    </>
  );
}
```

### Show the features in a web component and let the user click to zoom

```tsx
function Application() {
  // We define a React state to hold the list of kommuner
  const [allKommuner, setAllKommuner] = useState<Feature[]>([]);
  // We use a useEffect to handle OpenLayers' event when the data in the kommuneSource
  // is loaded (or otherwise changed)
  useEffect(() => {
    kommuneSource.on("change", () =>
      setAllKommuner(kommuneSource.getFeatures()),
    );
  }, []);
  // Zoom the map when the user clicks a kommune in the list
  function handleClickKommune(kommune: Record<string, any>) {
    view.animate({ center: getCenter(kommune["geometry"]!.getExtent()) });
  }

  return (
    <>
      <h1>Administrative regioner i Norge </h1>
      <main>
        <div ref={mapRef}></div>
        <aside>
          <h2>Alle kommuner</h2>
          <ul>
            {allKommuner
              .map((f) => f.getProperties())
              .sort((a, b) => a["kommunenavn"].localeCompare(b["kommunenavn"]))
              .map((k) => (
                <li key={k["kommunenummer"]}>
                  <a href={"#"} onClick={() => handleClickKommune(k)}>
                    {k["kommunenavn"]}
                  </a>
                </li>
              ))}
          </ul>
        </aside>
      </main>
    </>
  );
}
```

To stop the whole map from scrolling, you can use overflow in the `src/components/app/application.css`:

```css
main {
  display: grid;
  grid-template-columns: 1fr auto;
  min-height: 0;

  aside {
    padding: 0.5rem 1rem;
    min-height: 0;
    display: flex;
    flex-direction: column;
    ul {
      overflow-y: auto;
    }
  }
}
```
