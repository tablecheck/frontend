# vite-import-massager-plugin

This package is to allow easy use of libraries like lodash or carbon icons but still get the performance needed for efficient code splitting and bundling.

## Installation

To install the plugins, run the following command:

```sh
npm install --save-dev @tablecheck/vite-import-massager-plugin
```

## Usage

In the `vite.config.ts` vite config file, import the plugin and initialise it as follows;

```ts
import { defineConfig } from 'vite';
import ImportMassagerPlugin from '@tablecheck/vite-import-massager-plugin';

export default defineConfig({
  plugins: [
    new ImportMassagerPlugin([
      'lodash',
      '@fortawesome/pro-regular-svg-icons',
      '@fortawesome/pro-solid-svg-icons',
      '@fortawesome/free-regular-svg-icons',
      '@fortawesome/free-brands-svg-icons',
      {
        transformPackages: ['@tablecheck/tablekit'],
        packageName: '@carbon/icons-react',
        importTransform: (importName) => {
          if (importName.startsWith('WatsonHealth'))
            return `/es/watson-health/${importName.replace(
              'WatsonHealth',
              '',
            )}`;
          if (importName.startsWith('Q') && importName.match(/^Q[A-Z]/g))
            return `/es/Q/${importName.slice(1)}`;
          return `/es/${importName}`;
        },
      },
    ]),
  ],
});
```
