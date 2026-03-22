# React + TypeScript + Vite + shadcn

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
## Project structure

A common, easy-to-navigate layout for this React + TypeScript + Vite + shadcn project:

```
src/
├─ main.tsx                 # app bootstrap (BrowserRouter, Provider wrappers)
├─ App.tsx                  # top-level routes entry (useRoutes / Routes)
├─ app-router.tsx           # app route rendering helper (renders routes config)
├─ index.css                # global styles / tailwind entry
├─ lib/
│  └─ supabase.ts           # supabase client initializer
├─ auth/
│  └─ auth-provider.tsx     # auth context/provider (useAuth)
├─ config/
│  └─ routes.tsx            # route metadata (path, component/ref, layout, name, icon)
├─ store/
│  ├─ index.ts              # redux store config & hooks
│  ├─ revenue.ts            # revenue slice + thunks
│  └─ ...                   # other slices
├─ components/
│  ├─ layouts/
│  │  └─ main-layout.tsx    # main layout (sidebar + header + <Outlet />)
│  ├─ app-sidebar.tsx       # sidebar that reads routes config
│  ├─ error-dialog.tsx      # reusable dialog for errors
│  └─ ui/
│     ├─ sidebar.tsx
│     ├─ dialog.tsx
│     ├─ textarea.tsx
│     └─ ...                # shared UI primitives
├─ app/
│  ├─ sign-in/
│  │  └─ page.tsx
│  ├─ sign-up/
│  │  └─ page.tsx
│  ├─ dashboard/
│  │  └─ page.tsx
│  ├─ revenue/
│  │  └─ page.tsx
│  └─ errors/
│     └─ not-found/
│        └─ not-found-error.tsx
└─ interfaces/
   └─ routes.ts             # types for route config
```

Notes
- Keep a single BrowserRouter in `src/main.tsx`. Layouts must use `<Outlet />` for nested routes — do not render a second Router.
- Put API clients under `src/lib/` (supabase, fetch helpers).
- Route metadata (labels/icons/layout) belongs in `src/config/routes.tsx` and UI (sidebar) should read from it.
- Store async logic in RTK thunks or RTK Query (`src/store/`); keep slices focused per domain.
- For a real project, include `README` sections for:
  - env vars required (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_BASENAME)
  - dev commands: `npm run dev`, `npm run build`, `npm run lint`
  - how to inspect the runtime tree: `find src -type f | sed 's|^./||' | sort`

## Install dependencies

npm install

## Run the App

npm run dev

Notes
- App will be available at: http://localhost:5173

## Run the ESLint

npm run lint

## Build for production

npm run build

## Live Demo

URL: 

## Technologies Used

<details><summary><b>Personal Finance Application</b> is built using the following technologies:</summary>

- [TypeScript](https://www.typescriptlang.org/): TypeScript is a typed superset of JavaScript that
  compiles to plain JavaScript.
- [Vite](https://vitejs.dev/): Vite is a build tool that aims to provide a faster and leaner
  development experience for modern web projects.
- [React.js](https://reactjs.org/): React is a free and open-source front-end JavaScript library for
  building user interfaces or UI components.
- [Tailwind CSS](https://tailwindcss.com/): Tailwind CSS is a utility-first CSS framework for
  rapidly building custom user interfaces.
- [Shadcn](https://ui.shadcn.com/): shadcn/ui is a set of beautifully-designed, accessible components and a code distribution
  platform. Works with your favorite frameworks and AI models. Open Source. Open Code.
- [ESLint](https://eslint.org/): ESLint is a static code analysis tool for identifying problematic
  patterns found in JavaScript code.
- [Prettier](https://prettier.io/): Prettier is an opinionated code formatter.
- [Vercel](https://vercel.com/): Vercel is a cloud platform for frontend developers, providing the
  frameworks, workflows, and infrastructure to build a faster, more personalized Web.
