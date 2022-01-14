const buildBaseTypescript = require('./buildBaseTypescript');

module.exports = buildBaseTypescript(['**/*.ts', '**/*.tsx'], {
  ...require('../rules/general'),
  ...require('../rules/react'),
  ...require('../rules/promise'),
  ...require('../rules/emotion'),
  ...require('../rules/namingConvention')
});
