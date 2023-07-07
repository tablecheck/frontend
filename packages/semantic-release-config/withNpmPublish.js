const baseConfig = require('./index');

module.exports = {
  ...baseConfig,
  plugins: baseConfig.plugins.concat(['@semantic-release/npm']),
};
