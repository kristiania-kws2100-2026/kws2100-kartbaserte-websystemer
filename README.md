# Creating a React Application

This demonstration shows how to create and deploy a simple React application, using the
official [Thinking in React tutorial](https://react.dev/learn/thinking-in-react) as a basis and adding TypeScript,
Prettier and Husky.

To get started [create a new repository](https://github.com/new) on GitHub. In IntelliJ, select ☰ > File > New Project from Version Control and copy your new GitHub repo as the URL

## Creating a minimal React Application

Create the `package.json` files for your React application and a dev-script:

```shell
npm init -y
npm i -D vite
npm i react react-dom
npm pkg set scripts.dev=vite

```

Create `index.html` (ideally, you use the `doc` template, but this is the minimal code needed)

```html
<div id="root"></div>
<script src="src/main.jsx" type="module"></script>
```

Create `src/main.jsx`:

```jsx
import { createRoot } from "react-dom/client";
import React from "react";

createRoot(document.getElementById("root")).render(<h1>Hello World</h1>);
```

You can now see your React application by running `npm run dev`.

## Deploy to GitHub pages with GitHub Actions

### Add formatting validation

Add a test script to execute [Prettier](https://prettier.io/) and fix your current formatting:

```shell
npm i -D prettier
npm pkg set scripts.test="prettier --check ."
npx prettier --write .

```

### Make vite build to the correct location for GitHub pages:

Create a file `vite.config.tx` in the top level project folder.

```ts
import { defineConfig } from "vite";

export default defineConfig({
  // Change "/my-repo" to be the name of your GitHub repository. For example
  // when my code is at https://github.com/kristiania-kws2100-2025/kws2100-kartbaserte-websystemer/
  // I should have `base: "/kws2100-kartbaserte-websystemer"`
  base: "/my-repo",
});
```

Add a build script:

- `npm pkg set scripts.build="vite build"`

### Create a GitHub actions workflow

Create the following `.github/workflows/publish.yml`

```yaml
on:
  push:
    branches: ["main", "reference/*", "lecture/*"]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22.x
          cache: "npm"
      - run: npm ci
      - run: npm run build --if-present
      - run: npm test
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
      - uses: actions/deploy-pages@v4
    permissions:
      id-token: write
      pages: write
      contents: read # to check out private repositories
```

Turn on GitHub pages in your repository on GitHub: Under Settings > Pages, update Build and deployment > Source to be "GitHub Actions".

If you have done everything correctly, you should be able to push your code and have it be deployed to a website on GitHub Pages.

## Do some React development

Follow the official [Thinking in React](https://react.dev/learn/thinking-in-react) tutorial until you have completed "Step 3: Find the minimal but complete representation of the UI state". When you are done, you can continue this exercise to add TypeScript, GitHub and code reviews.

### Install TypeScript

1. Install TypeScript: `npm i -D typescript`
2. Setup TypeScript's `tsconfig.json`-file: `npx tsc --init`
3. Format `tsconfig.json`-file: `npx prettier --write tsconfig.json`
4. Add TypeScript checking to the `npm test`: `npm pkg set scripts.test="tsc --noEmit && prettier --check ."`
5. Rename `src/App.jsx` to `src/App.tsx`

## Learn to think in TypeScript and useContext by translating your application

To provide a translated version of the application to match the users preferences. We want to be able to write code like this:

```tsx
function ProductTableHeader() {
  const {
    applicationTexts: { nameHeader, priceHeader },
  } = useContext(LanguageContext);
  return (
    <thead>
      <tr>
        <th>{nameHeader}</th>
        <th>{priceHeader}</th>
      </tr>
    </thead>
  );
}
```

The applicationText that will be shown should adapt to the users preference. Here is how we can create `LanguageContext`:

```tsx
export interface ApplicationTexts {
  nameHeader: string;
  priceHeader: string;
  // Here you can put more properties
}

// Typescript will ensure that you don't forget any properties
const english: ApplicationTexts = {
  nameHeader: "Name",
  priceHeader: "Price",
};

// Here you can add additional languages

export const LanguageContext = React.createContext<{
  language: string;
  applicationTexts: ApplicationTexts;
}>({ language: "en", applicationTexts: english });

export function LanguageContextProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(navigator.language);
  const applicationTexts = useMemo(() => {
    if (language === "no") return norwegian;
    return english;
  }, [language]);
  useEffect(() => {
    window.addEventListener("languagechange", () =>
      setLanguage(navigator.language),
    );
  }, []);
  return (
    <LanguageContext.Provider value={{ language, applicationTexts }}>
      {children}
    </LanguageContext.Provider>
  );
}
```
