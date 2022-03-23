require('jest-enzyme');
const { matchers } = require('@emotion/jest');
const Adapter = require('@wojtekmaj/enzyme-adapter-react-17');
const { configure } = require('enzyme');
const { replaceRaf } = require('raf-stub');
const { createSerializer } = require('enzyme-to-json');
const isObject = require('lodash/isObject');
const systemSettings = require('@tablecheck/scripts-utils/userConfig');
const prettier = require('prettier');

// needed for replaceRaf below
global.performance = require('perf_hooks').performance;
// mock out requestAnimationFrame for all tests
// eslint-disable-next-line no-undef
replaceRaf([global, typeof window !== 'undefined' ? window : {}]);

expect.extend(matchers);

// configure react-17 as adapter
configure({ adapter: new Adapter() });

let exclusionKeys = ['i18n'];
if (
  systemSettings &&
  systemSettings.test &&
  systemSettings.test.enzymePropSerializerExclusions
) {
  exclusionKeys = exclusionKeys.concat(
    systemSettings.test.enzymePropSerializerExclusions
  );
}

// The order of addSnapshotSerializer matters, only the last matched `map` is run

function filterProps(node) {
  const { children, props } = node;
  if (props) {
    Object.keys(props).forEach((key) => {
      if (exclusionKeys.indexOf(key) !== -1) {
        props[key] = {};
      } else if (key === 'icon' && props[key].iconName) {
        props[key] = `${props[key].prefix}-${props[key].iconName}`;
      } else if (isObject(props[key])) {
        Object.keys(props[key]).forEach((subKey) => {
          // Simplify snapshot output by removing the directory keys and Promises
          // Also keeps false positives to minimum
          if (props[key][subKey] instanceof Promise) {
            props[key][subKey] = {};
          }
          if (subKey === 'directory') {
            props[key] = {};
          }
        });
      }
    });
  }
  if (children && children.length) {
    children.forEach(filterProps);
  }
}

expect.addSnapshotSerializer(
  createSerializer({
    test: (node) => node && (node.type === 'ThemeProvider' || node.props),
    map: (node) => {
      const { type, props, children } = node;

      if (type === 'ThemeProvider') {
        const childNodes = children.filter(
          ({ type: childType, props: childProps }) => {
            if (childType === 'EmotionGlobal') return false;
            if (childProps && childProps.href) {
              return childProps.href.indexOf('tablecheck.com/common/fonts') < 0;
            }
            return true;
          }
        );
        filterProps({ children: childNodes });
        return childNodes.length === 1 ? childNodes[0] : childNodes;
      }

      if (typeof props === 'object') {
        filterProps(props);
      }

      return node;
    }
  })
);

const prettierOptions = prettier.resolveConfig.sync();

expect.addSnapshotSerializer({
  test: (value) => {
    if (typeof value !== 'object' || Object.keys(value).length > 5) {
      return false;
    }
    if (
      Object.keys(value).find(
        (key) =>
          ['name', 'styles', 'map', 'next', 'toString'].indexOf(key) === -1
      )
    ) {
      return false;
    }
    return value.name && value.styles;
  },
  print: (value) => {
    const strippedValue = value.styles
      .replace(/label:[^;]+;/gi, '')
      .replace(/;+/gi, ';')
      .replace(/^"|"$/gi, '');
    try {
      return prettier
        .format(strippedValue, {
          ...prettierOptions,
          parser: 'css'
        })
        .trim();
    } catch (e) {
      return strippedValue;
    }
  }
});

// for global package mocks we need to check if the dependency is actually in use
// if it isn't installed jest throws an error

let appPackage;
try {
  appPackage = require(`${process.cwd()}/package.json`);
} catch (e) {
  // no app package
}

if (
  (appPackage.dependencies && appPackage.dependencies['@tablekit/icon']) ||
  (appPackage.devDependencies && appPackage.devDependencies['@tablekit/icon'])
) {
  // Global mock reduces potential problems in snapshot testing
  jest.mock('@tablekit/icon', () => ({
    ...jest.requireActual('@tablekit/icon'),
    Icon: ({ icon }) =>
      icon && icon.iconName ? `icon-${icon.iconName}` : 'icon-UNKNOWN'
  }));
}
