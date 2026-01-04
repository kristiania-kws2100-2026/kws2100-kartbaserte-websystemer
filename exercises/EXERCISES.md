# KWS2100 Kartbaserte Websystemer Exercises

## Exercise 1
###  Display a map in React

<details open>

Create a React application that displays information on a map

1. If you're using IntelliJ, I recommend creating a new Empty project for your application
2. Use [Vite](https://vitejs.dev/guide/) to create a React + TypeScript application
    * `npm install --save-dev vite && npm install react react-dom`
    * `npm pkg set scripts.dev="vite"`
    * Create `index.html` ([reference](../README.md#minimal-indexhtml),critical line `<script src="src/main.tsx" type="module"></script>`)
    * Create `src/main.tsx` ([reference](../README.md#minimal-srcmaintsx), critical line: `createRoot(document.getElementById("root")).render(<h1>Hello World</h1>)`)
3. Verify that you can make changes and see them displayed in the web page
    * If you want, you can [deploy the application to GitHub pages now](../README.md#a-deployment-to-github-pages)
4. Replace the App component with a component that uses OpenLayers to display a map
    * See [reference material](../README.md#creating-a-openlayers-map-in-react)
5. Add [fylker in Norway](https://github.com/robhop/fylker-og-kommuner/blob/main/Fylker-M.geojson) as a vector layer
    * Place the file in `public/geojson/fylker.json`
    * Add a layer to the map layers array: `new VectorLayer({source: new VectorSource({url: "/geojson/fylker.json", format: new GeoJSON()})})`
6. (Optional) Style the vector layer
7. (Optional) Change the style on hover
8. (Optional) Add schools from https://kart.dsb.no/ (Sårbare objekter > Videregående skoler)
9. (Optional) Deploy to GitHub pages

## Tips:

- In order to display a map with OpenLayers, you have to create a Map object with a View and at least one layer.
  The view must have center and zoom
- You can use `new OSM()` (for Open Street Maps) as your first layer
- Make sure you call the OpenLayers function `useGeographic()` at the top of your file. Otherwise, positions will be
  displayed as meters from the equator instead of degrees latitude and longitude
- If things are working weird, make sure you have `import {Map} from "ol"`, as there is a core JavaScript object that
  is also called `Map`. Also, avoid calling your React component ~~`Map`~~ (as I once did and struggled with for a
  long time)
- A common error is for the map `<div>` to have zero size. Make sure you style it with `height` and `width`

For a solution, check out [the reference code for lecture 1](https://github.com/kristiania-kws2100-2024/kristiania-kws2100-2024.github.io/tree/reference/01)

</details>
