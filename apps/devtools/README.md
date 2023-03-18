# devtools

## Usage Notes

The extension manifest is defined in `src/manifest.ts`
Background, content scripts, options, and popup entry points exist in the `src/entries` directory. 


Otherwise, the project functions just like a regular Vite project.



HMR during development in Manifest V3 requires Chromium version >= 110.0.5480.0.

## Project Setup

```sh
pnpm install
```

## Commands
### Build
#### Development, HMR

Hot Module Reloading is used to load changes inline without requiring extension rebuilds and extension/page reloads
Currently only works in Chromium based browsers.
```sh
pnpm dev
```

#### Development, Watch

Rebuilds extension on file changes. Requires a reload of the extension (and page reload if using content scripts)
```sh
pnpm watch
```

#### Production

Minifies and optimizes extension build
```sh
pnpm build
```

### Load extension in browser

Loads the contents of the dist directory into the specified browser
```sh
pnpm serve:chrome
```

```sh
pnpm serve:firefox
```
