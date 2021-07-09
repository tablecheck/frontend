const { execa, execaOptions } = require('./utils/execa');

execa('razzle', ['build'], execaOptions);
