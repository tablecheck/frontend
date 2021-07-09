const constToEnum = require('../utils/constToEnum');
const getUsages = require('../utils/getUsages');
const mergeImports = require('../utils/mergeImports');
const renameImports = require('../utils/renameImports');
const replaceDefaultExport = require('../utils/replaceDefaultExport');

const themeUpdate = require('./tablekit-theme-10');
const utilsUpdate = require('./tablekit-utils-3');
const typescript = require('./typescript-2020');

module.exports = function tablekitTypescript2020(file, api, options) {
  const resolvedSource = [typescript, utilsUpdate, themeUpdate].reduce(
    (source, codemod) => codemod({ ...file, source }, api, options),
    file.source
  );

  const root = api.jscodeshift(resolvedSource);

  function replaceConstWithEnum(packageName, oldName, newName, memberMap) {
    const newImportMap = renameImports(root, api, packageName, {
      [oldName]: newName
    });
    getUsages(root, api, newImportMap[oldName]).forEach((path) => {
      constToEnum(api.jscodeshift, path, newImportMap[oldName], memberMap);
    });
  }

  // all default export transforms here
  replaceDefaultExport(root, api, '@tablekit/button', 'Button');
  replaceConstWithEnum(
    '@tablekit/button',
    'BUTTON_APPEARANCES',
    'ButtonAppearance',
    {
      PRIMARY: 'Primary',
      OUTLINE: 'Outline',
      SUBTLE: 'Subtle',
      GHOST: 'Ghost',
      INVERSE: 'Inverse',
      SUCCESS: 'Success',
      WARNING: 'Warning',
      DANGER: 'Danger'
    }
  );
  replaceDefaultExport(root, api, '@tablekit/input', 'Input');
  renameImports(root, api, '@tablekit/input', {
    BaseInputPropsType: 'BaseInputProps'
  });
  replaceDefaultExport(root, api, '@tablekit/alert', 'Alert');
  replaceConstWithEnum(
    '@tablekit/alert',
    'ALERT_APPEARANCES',
    'AlertAppearance',
    {
      INFO: 'Primary',
      SUCCESS: 'Success',
      WARNING: 'Warning',
      ERROR: 'Danger'
    }
  );
  replaceDefaultExport(root, api, '@tablekit/avatar', 'Avatar');
  replaceDefaultExport(root, api, '@tablekit/badge', 'Badge');
  replaceConstWithEnum('@tablekit/badge', 'BADGE_TYPES', 'BadgeType', {
    SOLID: 'Solid',
    OUTLINE: 'Outline'
  });
  replaceDefaultExport(root, api, '@tablekit/banner', 'Banner');
  replaceConstWithEnum(
    '@tablekit/banner',
    'BANNER_APPEARANCES',
    'BannerAppearance',
    {
      PRIMARY: 'Primary',
      SUCCESS: 'Success',
      WARNING: 'Warning',
      ERROR: 'Error'
    }
  );
  replaceDefaultExport(root, api, '@tablekit/buttongroup', 'ButtonGroup');
  mergeImports(root, api, '@tablekit/button-group', ['@tablekit/buttongroup']);
  replaceDefaultExport(root, api, '@tablekit/checkbox', 'Checkbox');
  replaceDefaultExport(root, api, '@tablekit/datepicker', 'Datepicker');
  replaceDefaultExport(root, api, '@tablekit/footer', 'Footer');
  replaceDefaultExport(root, api, '@tablekit/gallery', 'Gallery');
  replaceDefaultExport(root, api, '@tablekit/icon', 'Icon');
  replaceDefaultExport(root, api, '@tablekit/inline-dialog', 'InlineDialog');
  replaceDefaultExport(root, api, '@tablekit/item', 'Item');
  replaceDefaultExport(
    root,
    api,
    '@tablekit/language-selector',
    'LanguageSelector'
  );
  replaceDefaultExport(root, api, '@tablekit/modal-dialog', 'ModalDialog');
  replaceDefaultExport(root, api, '@tablekit/panel', 'Panel');
  replaceDefaultExport(
    root,
    api,
    '@tablekit/panel/ResizablePanel',
    'ResizablePanel'
  );
  replaceDefaultExport(root, api, '@tablekit/password-field', 'PasswordField');
  replaceDefaultExport(root, api, '@tablekit/phone-input', 'PhoneInput');
  replaceDefaultExport(root, api, '@tablekit/radio', 'Radio');
  replaceDefaultExport(root, api, '@tablekit/select', 'Select');
  replaceDefaultExport(root, api, '@tablekit/sidenav', 'SideNav');
  replaceConstWithEnum('@tablekit/sidenav', 'SIDE_NAV_STATES', 'SideNavState', {
    COLLAPSED: 'Collapsed',
    EXPANDED: 'Expanded'
  });
  replaceDefaultExport(root, api, '@tablekit/spinner', 'Spinner');
  replaceDefaultExport(root, api, '@tablekit/tabs', 'Tabs');
  replaceDefaultExport(root, api, '@tablekit/tag', 'Tag');
  replaceConstWithEnum('@tablekit/tag', 'TAG_SIZE', 'TagSize', {
    SMALL: 'Small',
    REGULAR: 'Regular'
  });
  replaceConstWithEnum('@tablekit/tag', 'TAG_APPEARANCE', 'TagAppearance', {
    OUTLINE: 'Outline',
    SOLID: 'Solid'
  });
  replaceDefaultExport(root, api, '@tablekit/textarea', 'Textarea');
  replaceDefaultExport(root, api, '@tablekit/toggle', 'Toggle');
  replaceDefaultExport(root, api, '@tablekit/tooltip', 'Tooltip');
  replaceDefaultExport(root, api, '@tablekit/topnav', 'Topnav');

  return root.toSource();
};
