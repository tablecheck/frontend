const mainConfig = require('@tablecheck/scripts/config/storybook.main');

module.exports = {
  ...mainConfig,
  features: {
    babelModeV7: true
  },
  addons: [...mainConfig.addons]
};
