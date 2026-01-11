# KWS2100 Kartbaserte Websystemer Exercises

## Exercise 1

### Display a map in React

<details>

Create a React application that displays information on a map

1. If you're using IntelliJ, I recommend creating a new Empty project for your application
2. Use [Vite](https://vitejs.dev/guide/) to create a React + TypeScript application
   - `npm install --save-dev vite`
   - `npm install react react-dom`
   - `npm pkg set scripts.dev="vite"`
   - Create `index.html` ([reference](../README.md#minimal-indexhtml),critical line `<script src="src/main.tsx" type="module"></script>`)
   - Create `src/main.tsx` ([reference](../README.md#minimal-srcmaintsx), critical line: `createRoot(document.getElementById("root")).render(<h1>Hello World</h1>)`)
3. Verify that you can make changes and see them displayed in the web page
   - If you want, you can [deploy the application to GitHub pages now](../README.md#a-deployment-to-github-pages)
4. Replace the App component with a component that uses OpenLayers to display a map
   - See [reference material](../README.md#creating-a-openlayers-map-in-react)
5. Add [fylker in Norway](https://github.com/robhop/fylker-og-kommuner/blob/main/Fylker-M.geojson) as a vector layer
   - Place the file in `public/geojson/fylker.json`
   - Add a layer to the map layers array: `new VectorLayer({source: new VectorSource({url: "/geojson/fylker.json", format: new GeoJSON()})})`
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
- If you add `<DOCTYPE html>` to your `index.html`, the browser will stop the default behavior of making the `<body>` element fill the viewport. Because of this, the OpenLayers map will have height 0 and be invisible. To fix, add CSS for `body { height: 100dvh; }`

For a solution, check out [the reference code for lecture 1](https://github.com/kristiania-kws2100-2024/kristiania-kws2100-2024.github.io/tree/reference/01)

</details>

## Exercise 2

### Developing, verifying and deploying an application with Github

<details open>

The goal of this exercise is the following:

- You should be able to display a React application in the web browser
- When you make a change to the application, you should see this change automatically
- The resulting application should be built with vite to a distribution folder
- You should be able to push changes to the web
- When you introduce an error, you don't want to break a working website
- You want to avoid introducing errors in the first place
- You should be able to cooperate with your team in a structured way

In the exercise, we will follow the official [Thinking in React](https://react.dev/learn/thinking-in-react) tutorial, and add TypeScript, GitHub and code reviews.

### Step 0: Install NodeJS and IntelliJ and sign up for student benefits

1. Install [NodeJS](https://nodejs.org/en/download/package-manager) (if you don't already have it)
2. Sign up for [GitHub student developer pack](https://education.github.com/pack/join) which gives you access to
   important resources like IntelliJ Ultimate and Heroku for free. Make sure to use your school email address for the
   registration and to follow all the steps of the application process.
3. Download [IntelliJ IDEA Ultimate](https://www.jetbrains.com/idea/download/). You can use a Trial license until your
   GitHub student pack is registered. You can then
   use [the IntelliJ student page](https://www.jetbrains.com/shop/eform/students)
   to get a long term license

### Step 1: Create and commit a simple React application

1. [Create a new repository](https://github.com/new) on GitHub
2. In IntelliJ, select ☰ > File > New Project from Version Control and copy your new GitHub repo as the URL
3. Create the `package.json` files for your React application and a dev-script
   1. `npm init -y`
   2. `npm i -D vite`
   3. `npm i react react-dom`
   4. `npm pkg set scripts.dev=vite`
4. Open `package.json` in IntelliJ and press the green "play button" by "dev"
5. Click on the URL in the console output to open a 404 page to the app
6. Create `index.html` (ideally, you use the `doc` template, but this is the minimal code needed)
   ```html
   <div id="root"></div>
   <script src="src/main.jsx" type="module"></script>
   ```
7. Create `src/main.jsx`:

   ```jsx
   import { createRoot } from "react-dom/client";
   import React from "react";

   createRoot(document.getElementById("root")).render(<h1>Hello World</h1>);
   ```

8. Commit and push the code

### Start collaboration

1. Join up with another student and share their project. One student should create a new IntelliJ project from the repository of the other (see step 2)
2. Add a GitHub Action New workflow at GitHub.com. Search for the Node.js template
3. This workflow will fail because you are missing a `test` script
4. Add a test script to execute [Prettier](https://prettier.io/)
   1. `npm i -D prettier`
   2. `npm pkg set scripts.test="prettier --check ."`
5. Run `npm test` locally. This is the same as what GitHub will run. This will fail because your code formatting isn't pretty yes
6. Run `npx prettier --write .` to fix your code formatting
7. Commit to Git and push
8. The project should now build with GitHub

To avoid commiting with errors, you should install the Prettier IntelliJ plugin:

1. Open IntelliJ Settings, go to Plugins, search for and install Prettier
2. Open IntelliJ Settings, go to Languages & Frameworks > JavaScript > Prettier and enable the prettier configuration (either Automatic or Manual)
3. Open your `package.json`-file, right click and select Apply Prettier Code Style Rules

### Deploy your application with GitHub pages

There is one tricky step to deployment. When your repository is named for example `https://github.com/kristiania-kws2100-2025/kws2100-kartbaserte-websystemer`,
GitHub pages will deploy to `https://kristiania-kws2100-2025.github.io/kws2100-kartbaserte-websystemer`. By default your JavaScript will be loaded from files like `/asset.js`, but GitHub pages will move this file to a subdirectory. To fix, this you have to instruct Vite to locate your application in a subdirectory, by specifying the `base` configuration property.

1. Create a `vite.config.js` file that specifies your base path:

   ```js
   import { defineConfig } from "vite";

   export default defineConfig({
     // Change "/my-repo" to be the name of your GitHub repository. For example
     // when my code is at https://github.com/kristiania-kws2100-2025/kws2100-kartbaserte-websystemer/
     // I should have `base: "/kws2100-kartbaserte-websystemer"`
     base: "/my-repo",
   });
   ```

2. Add a build script:
   - `npm pkg set scripts.build="vite build"`
3. Test this out by running `npm run build`. This should create some files under `dist/`. Add `dist/` to `.gitignore`
4. Add GitHub pages deployment scripts to your workflow file (under `.github/workflows/`)

   ```yaml
   # Most of the file is unchanged

   steps:
     # ...
     # keep the existing steps and add the following
     - run: npm run build
     - uses: actions/upload-pages-artifact@v3
       with:
         path: ./dist
     - uses: actions/deploy-pages@v4
   ```

5. You also have to give your workflow permissions to update GitHub pages for your project:

   ```yaml
   # Most of the file is unchanged

   # Add to the job section (under the jobs: keyword, at the same level as `steps` and `runs-on`)
   permissions:
     id-token: write
     pages: write
   ```

6. Turn on GitHub pages in your repository on GitHub: Under Settings > Pages, update Build and deployment > Source to be "GitHub Actions"
7. Commit and push the changes to `package.json`, `vite.config.js`, `.gitignore` and your workflow under `.github/workflows/`

Your project should now be deployed and available on the web.

### Do some React development

Follow the official [Thinking in React](https://react.dev/learn/thinking-in-react) tutorial, and add TypeScript, GitHub and code reviews.

1. You can copy the code from "Step 2: Build a static version in React" into a file named `App.jsx`, but add the React import line to the top:
   - `import React from "react"`
2. Update `main.jsx` to use `App.jsx`

   ```jsx
   import { createRoot } from "react-dom/client";
   import React from "react";
   import App from "./App";

   createRoot(document.getElementById("root")).render(<App />);
   ```

3. When you have gotten the code to work locally, you can commit and push and the application should update

### Introduce TypeScript on a branch

1. In IntelliJ: Go to the Git view ☰ > View > Tool Windows > Git
2. Right-click the `main` branch in the Git Windows and select "New branch from main..."
3. Enter a branch name
4. Install TypeScript: `npm i -D typescript`
5. Setup TypeScript's `tsconfig.json`-file: `npx tsc --init --jsx react`
6. Format `tsconfig.json`-file: `npx prettier --write tsconfig.json`
7. Add TypeScript checking to the `npm test`: `npm pkg set scripts.test="tsc --noEmit && prettier --check ."`
8. Rename `src/App.jsx` to `src/App.tsx`

You now get a lot of errors when you run `npm test`. Here is how to fix them:

1. Install the TypeScript definitions for React and React-DOM: `npm install -D @types/react @types/react-dom`
2. Define the TypeScript types in `App.tsx`. `function ProductCategoryRow`:
   ```tsx
   function ProductCategoryRow({ category }: { category: ReactNode }) {
     return (
       <tr>
         <th colSpan={2}>{category}</th>
       </tr>
     );
   }
   ```
3. For `function ProductRow`, you need to define the Product type based on PRODUCTS:

   ```tsx
   type Product = (typeof PRODUCTS)[number];

   function ProductRow({ product }: { product: Product }) {
     // ..
   }
   ```

4. `function ProductTable`:
   ```tsx
   function ProductTable({ products }: { products: Product[] }) {
     const rows: ReactNode[] = [];
     let lastCategory: ReactNode = null;
     // ..
   }
   ```
5. `function FilterableProductTable`:
   ```tsx
   function FilterableProductTable({ products }: { products: Product[] }) {
     // ...
   }
   ```
6. `npm test` should now run without error
7. Rename `main.tsx` and update the reference to this in `index.html`. This should leave you with one simple issue to fix
8. Commit and push the branch
9. In GitHub go to Pull requests and press New pull request
10. The other developer can now view the pull request, comment and ultimately merge the pull request into main
11. GitHub Actions will build the project based on which trigger (`on`) rules you have defined. You should try to customize this to only deploy when the pull request is merged
12. To avoid commiting changes with TypeScript errors, you can install [Husky](https://typicode.github.io/husky/) which runs `npm test` for you before each commit
    1. `npm install -D husky`
    2. `npx husky init`

### Develop a feature on a branch

1. Create a new branch (as in the last step)
2. Develop the [FilterableProductTable](https://react.dev/learn/thinking-in-react#step-3-find-the-minimal-but-complete-representation-of-ui-state) feature in the React tutorial
3. Commit and push as normal
4. Create a pull request, do a code review and merge the pull request

### Implement multiple languages by using TypeScript

The browser lets you determine the users preferred language by using `navigator.language` (when the user changes this, you can detect this by listening to `"languagechange"`).

You can use this to localize the texts in the UI by using React's context mechanism together with TypeScript. The details are left as part of the exercise, but here is an example of the effect we want:

```tsx
function SearchBar(/* ... parameter definition ... */) {
  const applicationText = useContext(ApplicationTextContext);
  return (
    <form>
      <input
        // ...  other attributes
        placeholder={applicationText.actions.searchPlaceholder}
      />
      <label>
        <input
        // ... other attributes
        />
        {applicationText.actions.onlyShowStock}
      </label>
    </form>
  );
}
```

</details>
