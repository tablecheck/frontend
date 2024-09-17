import { beforeEach, describe, expect, it } from 'vitest';

import ImportMassagingPlugin from './index.js';

let plugin: ImportMassagingPlugin;

describe('@carbon/icons-react', () => {
  beforeEach(() => {
    plugin = new ImportMassagingPlugin([
      {
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
    ]);
  });

  it('should not rewrite non matching imports', () => {
    const { code } = plugin.transform(
      `import * as React from "react";`,
      'src/index.ts',
    );
    expect(code).toMatchInlineSnapshot(`"import * as React from "react";"`);
  });

  it('should rewrite single carbon icon', () => {
    const { code } = plugin.transform(
      `import { Text } from "@carbon/icons-react";`,
      'src/index.ts',
    );
    expect(code).toMatchInlineSnapshot(
      `"import Text from "@carbon/icons-react/es/Text";"`,
    );
  });

  it('should rewrite watson health', () => {
    const { code } = plugin.transform(
      `import { WatsonHealthAiResults } from "@carbon/icons-react";`,
      'src/index.ts',
    );
    expect(code).toMatchInlineSnapshot(
      `"import WatsonHealthAiResults from "@carbon/icons-react/es/watson-health/AiResults";"`,
    );
  });

  it('should rewrite Q', () => {
    const { code } = plugin.transform(
      `import { QHinton } from "@carbon/icons-react";`,
      'src/index.ts',
    );
    expect(code).toMatchInlineSnapshot(
      `"import QHinton from "@carbon/icons-react/es/Q/Hinton";"`,
    );
  });

  it('should rewrite multiple carbon icon', () => {
    const { code } = plugin.transform(
      `import { Text, Close } from "@carbon/icons-react";`,
      'src/index.ts',
    );
    expect(code).toMatchInlineSnapshot(
      `"import Text from "@carbon/icons-react/es/Text";import Close from "@carbon/icons-react/es/Close";"`,
    );
  });

  it('should rewrite alias', () => {
    const { code } = plugin.transform(
      `import { Text as TextAlias } from "@carbon/icons-react";`,
      'src/index.ts',
    );
    expect(code).toMatchInlineSnapshot(
      `"import TextAlias from "@carbon/icons-react/es/Text";"`,
    );
  });

  it('should handle real-world example', () => {
    const { code } = plugin.transform(
      `import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  TextAlignCenter,
  TextAlignLeft as Left,
  TextAlignRight as Right,
  Close,
} from "@carbon/icons-react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { getCarbonIconSize } from "@tablecheck/tablekit-react";
import { type Editor } from "@tiptap/react";`,
      'src/index.ts',
    );
    expect(code).toMatchInlineSnapshot(
      `"import * as React from "react";
import { useTranslation } from "react-i18next";
import TextAlignCenter from "@carbon/icons-react/es/TextAlignCenter";import Left from "@carbon/icons-react/es/TextAlignLeft";import Right from "@carbon/icons-react/es/TextAlignRight";import Close from "@carbon/icons-react/es/Close";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { getCarbonIconSize } from "@tablecheck/tablekit-react";
import { type Editor } from "@tiptap/react";"`,
    );
  });
});

describe('lodash', () => {
  beforeEach(() => {
    plugin = new ImportMassagingPlugin([
      {
        packageName: 'lodash',
        importTransform: (importName) => `/${importName}`,
      },
    ]);
  });

  it('should not rewrite correct imports', () => {
    const { code } = plugin.transform(
      `import merge from "lodash/merge";`,
      'src/index.ts',
    );
    expect(code).toMatchInlineSnapshot(`"import merge from "lodash/merge";"`);
  });

  it('should rewrite aliased imports', () => {
    const { code } = plugin.transform(
      `import { merge as _merge } from "lodash";`,
      'src/index.ts',
    );
    expect(code).toMatchInlineSnapshot(`"import _merge from "lodash/merge";"`);
  });

  it('should rewrite default imports', () => {
    const { code } = plugin.transform(
      `import lodash from "lodash";lodash.merge();lodash.slice();`,
      'src/index.ts',
    );
    expect(code).toMatchInlineSnapshot(
      `"import __lodash_merge from "lodash/merge";import __lodash_slice from "lodash/slice";__lodash_merge();__lodash_slice();"`,
    );
  });

  it('should rewrite default _ import', () => {
    const { code } = plugin.transform(
      `import _ from "lodash";_.merge();_.slice();`,
      'src/index.ts',
    );
    expect(code).toMatchInlineSnapshot(
      `"import __lodash_merge from "lodash/merge";import __lodash_slice from "lodash/slice";__lodash_merge();__lodash_slice();"`,
    );
  });

  it('should rewrite glob imports', () => {
    const { code } = plugin.transform(
      `import * as lodash from "lodash";lodash.merge();lodash.slice();`,
      'src/index.ts',
    );
    expect(code).toMatchInlineSnapshot(
      `"import __lodash_merge from "lodash/merge";import __lodash_slice from "lodash/slice";__lodash_merge();__lodash_slice();"`,
    );
  });
});

describe('other tests', () => {
  it('should accept string config', () => {
    plugin = new ImportMassagingPlugin(['@carbon/icons-react']);
    const { code } = plugin.transform(
      `import { Text } from "@carbon/icons-react";`,
      'src/index.js',
    );
    expect(code).toMatchInlineSnapshot(
      `"import Text from "@carbon/icons-react/Text";"`,
    );
  });

  it('should support non-default exports', () => {
    plugin = new ImportMassagingPlugin([
      {
        packageName: '@tablecheck/tablekit-react',
        importTransform: (importName) => `/es/${importName}.js`,
        exportTransform: (exportName) => `{ ${exportName} }`,
      },
    ]);
    const { code } = plugin.transform(
      `import { Text } from "@tablecheck/tablekit-react";`,
      'src/index.js',
    );
    expect(code).toMatchInlineSnapshot(
      `"import { Text } from "@tablecheck/tablekit-react/es/Text.js";"`,
    );
  });

  it('should support non-default alias exports', () => {
    plugin = new ImportMassagingPlugin([
      {
        packageName: '@tablecheck/tablekit-react',
        importTransform: (importName) => `/es/${importName}.js`,
        exportTransform: (exportName, alias) =>
          alias ? `{ ${exportName} as ${alias} }` : `{ ${exportName} }`,
      },
    ]);
    const { code } = plugin.transform(
      `import { Text as T2 } from "@tablecheck/tablekit-react";`,
      'src/index.js',
    );
    expect(code).toMatchInlineSnapshot(
      `"import { Text as T2 } from "@tablecheck/tablekit-react/es/Text.js";"`,
    );
  });

  it('should handle real-world non-default exports', () => {
    plugin = new ImportMassagingPlugin([
      {
        packageName: '@tablecheck/tablekit-react',
        importTransform: (importName) => `/es/${importName}.js`,
        exportTransform: (exportName, alias) =>
          alias ? `{ ${exportName} as ${alias} }` : `{ ${exportName} }`,
      },
    ]);
    const { code } = plugin.transform(
      `import {
  Button,
  IconButton,
  TabContent,
  Tabs as TablekitTabs,
} from "@tablecheck/tablekit-react";`,
      'src/index.js',
    );
    expect(code).toMatchInlineSnapshot(
      `"import { Button } from "@tablecheck/tablekit-react/es/Button.js";import { IconButton } from "@tablecheck/tablekit-react/es/IconButton.js";import { TabContent } from "@tablecheck/tablekit-react/es/TabContent.js";import { Tabs as TablekitTabs } from "@tablecheck/tablekit-react/es/Tabs.js";"`,
    );
  });

  it('should not transform node_modules', () => {
    plugin = new ImportMassagingPlugin([
      {
        packageName: '@carbon/icons-react',
        importTransform: (importName) => `/es/${importName}`,
      },
    ]);
    const { code } = plugin.transform(
      `import { Text } from "@carbon/icons-react";`,
      'package/node_modules/pack-name/dist/index.js',
    );
    expect(code).toMatchInlineSnapshot(
      `"import { Text } from "@carbon/icons-react";"`,
    );
  });

  it('should transform node_modules', () => {
    plugin = new ImportMassagingPlugin([
      {
        packageName: '@carbon/icons-react',
        transformPackages: ['pack-name'],
        importTransform: (importName) => `/es/${importName}`,
      },
    ]);
    const { code } = plugin.transform(
      `import { Text } from "@carbon/icons-react";`,
      'package/node_modules/pack-name/index.js',
    );
    expect(code).toMatchInlineSnapshot(
      `"import Text from "@carbon/icons-react/es/Text";"`,
    );
  });

  it('should run both transforms', () => {
    plugin = new ImportMassagingPlugin([
      {
        packageName: 'lodash',
      },
      {
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
    ]);
    const { code } = plugin.transform(
      `import { Text } from "@carbon/icons-react";
import _ from "lodash";
_.merge();`,
      'src/index.tsx',
    );
    expect(code).toMatchInlineSnapshot(
      `"import Text from "@carbon/icons-react/es/Text";
import __lodash_merge from "lodash/merge";
__lodash_merge();"`,
    );
  });
});
