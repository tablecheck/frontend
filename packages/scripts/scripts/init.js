const path = require('path');

const chalk = require('chalk');
const fs = require('fs-extra');
const inquirer = require('inquirer');

const paths = require('../config/paths');

const { getArgv } = require('./utils/argv');
const { execa } = require('./utils/execa');
const { execaOptions } = require('./utils/execa');
const { isLerna } = require('./utils/lerna');
const {
  format: formatPackages,
  processAllPackages
} = require('./utils/package');

function writeRazzleConfig(version) {
  let isValidVersion = !!version;
  try {
    if (isValidVersion) {
      require.resolve(`../razzle/${version}`);
      isValidVersion = true;
    }
  } catch (error) {
    isValidVersion = false;
  }
  if (!isValidVersion) {
    console.error(chalk.red.bold(`There is no razzle config for "${version}"`));
    throw new Error();
  }
  const fileContent = `module.exports = require('@tablecheck/scripts/razzle/${version}');\n`;
  fs.writeFileSync(
    path.join(paths.cwd, 'razzle.config.js'),
    fileContent,
    'utf8'
  );
}

function setPackageScripts(packageScripts) {
  const appPackage = require(paths.appPackageJson);
  if (appPackage.scripts && appPackage.scripts['update-audit']) {
    // for upgrading projects
    delete appPackage.scripts['update-audit'];
  }
  appPackage.scripts = {
    ...appPackage.scripts,
    ...packageScripts
  };

  console.log(chalk.blue.bold('Setting npm scripts in package.json...\n'));
  fs.outputJsonSync(paths.appPackageJson, appPackage);
}

const SCRIPTS = {
  CYPRESS: 'cypress',
  STORYBOOK: 'storybook',
  LERNA: 'lerna',
  LIB: 'lib',
  SPA: 'spa',
  SSPA: 'sspa',
  SSR: 'ssr'
};

const additionalPrompts = [
  {
    name: 'Cypress',
    value: SCRIPTS.CYPRESS,
    short: SCRIPTS.CYPRESS
  },
  {
    name: 'Storybook',
    value: SCRIPTS.STORYBOOK,
    short: SCRIPTS.STORYBOOK
  }
];

const promptChoices = [
  {
    name: 'Lerna Mono-repository of libraries',
    value: SCRIPTS.LERNA,
    short: SCRIPTS.LERNA
  },
  {
    name: 'Library',
    value: SCRIPTS.LIB,
    short: SCRIPTS.LIB
  },
  {
    name: 'Single Page App',
    value: SCRIPTS.SPA,
    short: SCRIPTS.SPA
  },
  {
    name: 'Portal Sub Application (sspa)',
    value: SCRIPTS.SSPA,
    short: SCRIPTS.SSPA
  },
  {
    name: 'Server Side Rendered app (SSR)',
    value: SCRIPTS.SSR,
    short: SCRIPTS.SSR
  }
].concat(additionalPrompts);

const cypressScripts = {
  'build:test': 'PORT=8089 NODE_CONFIG_ENV=test razzle build --standalone',
  'cypress:open': 'cypress open',
  'cypress:open-component': 'cypress open-ct',
  'cypress:run': 'cypress run',
  'cypress:run-component': 'cypress run-ct',
  'start:build':
    'http-server ./build/public -p 8089 --proxy http://localhost:8089? --silent',
  'start:test': 'PORT=8089 NODE_CONFIG_ENV=test razzle start --standalone',
  'test:integration':
    'start-server-and-test start:build http://localhost:8089/ cypress:run',
  'test:integration:debug':
    'start-server-and-test start:build http://localhost:8089/ cypress:open',
  'test:integration:dev':
    'start-server-and-test start:test http://localhost:8089/ cypress:open'
};
const cypressDevDependencies = ['cypress@^8.3.0'];

const storybookScripts = {
  'build:storybook': 'build-storybook -o docs',
  'start:storybook': 'start-storybook -p 6006'
};
const storybookDevDependencies = [
  '@storybook/addon-a11y@^6.4.10',
  '@storybook/addon-actions@^6.4.10',
  '@storybook/addon-essentials@^6.4.10',
  '@storybook/addon-links@^6.4.10',
  '@storybook/addons@^6.4.10',
  '@storybook/react@^6.4.10',
  'storybook@^6.4.10'
];

function copyCypressAppFiles(templatesDirectory) {
  fs.copyFileSync(
    path.join(templatesDirectory, 'cypress.json'),
    path.join(paths.cwd, 'cypress.json')
  );
  fs.copyFileSync(
    path.join(templatesDirectory, 'StandaloneApp.tsx'),
    path.join(paths.appSrc, 'StandaloneApp.tsx')
  );
  fs.copyFileSync(
    path.join(templatesDirectory, 'CypressApp.tsx'),
    path.join(paths.appSrc, 'CypressApp.tsx')
  );
  fs.copyFileSync(
    path.join(templatesDirectory, 'cypressClient.tsx'),
    path.join(paths.appSrc, 'client.standalone.tsx')
  );
  const definitionsDirectory = path.join(paths.appSrc, 'definitions');
  if (!fs.existsSync(definitionsDirectory)) {
    fs.mkdirSync(definitionsDirectory);
  }
  fs.copyFileSync(
    path.join(templatesDirectory, 'cypressWindowDefinition.d.ts'),
    path.join(paths.appSrc, 'definitions/window.d.ts')
  );
}

function copyStorybookFiles(templatesDirectory) {
  if (!fs.existsSync(paths.storybook)) {
    fs.mkdirSync(paths.storybook);
  }
  fs.copySync(path.join(templatesDirectory, '.storybook'), paths.storybook);
}

async function initProject() {
  const templatesDirectory = path.dirname(
    require.resolve('../templates/.prettierrc.json')
  );

  const argv = getArgv();
  let scriptType;
  if (argv._ && argv._.length) {
    const argChoice = argv._[0].trim();
    const matchedChoice = promptChoices.find(
      ({ value, short }) => argChoice === value || argChoice === short
    );
    if (matchedChoice) {
      scriptType = matchedChoice.value;
    }
  }

  if (!scriptType) {
    ({ scriptType } = await inquirer.prompt([
      {
        type: 'list',
        name: 'scriptType',
        message: 'What kind of project do you want to setup?',
        choices: promptChoices
      }
    ]));
  }
  let additionalInstalls = [];

  if ([SCRIPTS.CYPRESS, SCRIPTS.STORYBOOK].indexOf(scriptType) === -1) {
    ({ additionalInstalls } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'additionalInstalls',
        message: 'Optionally included tooling:',
        choices: additionalPrompts
      }
    ]));
  }

  if (scriptType === SCRIPTS.CYPRESS) {
    copyCypressAppFiles(templatesDirectory);
    setPackageScripts(cypressScripts);
    console.log(chalk.blue.bold('Installing required dependencies\n'));
    console.log('npm install --save-dev', cypressDevDependencies.join(' '));
    await execa(
      'npm',
      ['install', '--save-dev', '--save-exact', '--legacy-peer-deps'].concat(
        cypressDevDependencies
      ),
      execaOptions
    );
    console.log('Installing cypress');
    await execa('npx', ['cypress install'], execaOptions);
    await formatPackages();
    process.exit(0);
    return;
  }

  if (scriptType === SCRIPTS.STORYBOOK) {
    copyStorybookFiles(templatesDirectory);
    setPackageScripts(storybookScripts);
    console.log(chalk.blue.bold('Installing required dependencies\n'));
    console.log('npm install --save-dev', storybookDevDependencies.join(' '));
    await execa(
      'npm',
      ['install', '--save-dev', '--save-exact', '--legacy-peer-deps'].concat(
        storybookDevDependencies
      ),
      execaOptions
    );
    await formatPackages();
    process.exit(0);
    return;
  }

  console.log(chalk.blue.bold('Preinstalling prettier and husky...'));

  fs.copyFileSync(
    path.join(templatesDirectory, '.prettierrc.json'),
    path.join(paths.cwd, '.prettierrc.json')
  );
  fs.copyFileSync(
    path.join(templatesDirectory, '.prettierignore'),
    path.join(paths.cwd, '.prettierignore')
  );

  await execa(
    'npm',
    ['install', '--save-dev', '--save-exact', 'prettier@2', 'husky@7'],
    execaOptions
  );

  console.log(chalk.blue.bold('Copying default files and configurations'));

  fs.copyFileSync(
    path.join(templatesDirectory, '.eslintrc.js'),
    path.join(paths.cwd, '.eslintrc.js')
  );
  fs.copyFileSync(
    path.join(templatesDirectory, '.eslintignore'),
    path.join(paths.cwd, '.eslintignore')
  );
  fs.copyFileSync(
    path.join(templatesDirectory, '.nvmrc'),
    path.join(paths.cwd, '.nvmrc')
  );
  fs.copyFileSync(
    path.join(templatesDirectory, '.gitignore.template'),
    path.join(paths.cwd, '.gitignore')
  );

  await execa('npx', ['husky', 'install'], execaOptions);

  fs.copyFileSync(
    path.join(templatesDirectory, 'commit-msg'),
    path.join(paths.cwd, '.husky', 'commit-msg')
  );
  fs.copyFileSync(
    path.join(templatesDirectory, 'pre-commit'),
    path.join(paths.cwd, '.husky', 'pre-commit')
  );

  const {
    peerDependencies,
    optionalDependencies,
    dependencies
  } = require(require.resolve('../package.json'));
  const devDependencies = [
    `babel-preset-razzle@${optionalDependencies.razzle}`,
    // technically this isn't necessary but a lot of other apps use this dependency inside package.json as a typescript check
    `typescript@${dependencies.typescript}`
  ].concat(
    Object.keys(peerDependencies).map(
      (key) => `${key}@${peerDependencies[key]}`
    )
  );
  const appDependencies = Object.keys(optionalDependencies).map(
    (key) => `${key}@${optionalDependencies[key]}`
  );

  devDependencies.push('@tablecheck/scripts', '@commitlint/cli');

  appDependencies.push(
    'concurrently',
    'start-server-and-test',
    '@types/webpack-env'
  );

  const basePackageScripts = {
    audit: 'tablecheck-scripts auditjs',
    'audit:ci': 'tablecheck-scripts auditjs --ci',
    'coverage-summary': 'tablecheck-scripts coverage-summary',
    lint: 'tablecheck-scripts lint',
    test: 'tablecheck-scripts test --coverage --env=jsdom',
    'test:watch': 'tablecheck-scripts test --env=jsdom',
    format: 'tablecheck-scripts lint --fix --skip-typescript',
    tsc: 'tablecheck-scripts tsc',
    'tsc:watch': 'tablecheck-scripts tsc -w',
    preinstall: 'npm run co:login',
    'co:login':
      'aws codeartifact login --tool npm --repository tablecheck --domain tablecheck'
  };

  const appPackageScripts = {
    start:
      'concurrently --kill-others "npm run start:tsc" "npm run start:razzle"',
    'start:razzle': 'razzle start',
    'start:tsc':
      'tablecheck-scripts tsc -w --incremental --preserveWatchOutput',
    test: 'tablecheck-scripts test --coverage --env=jsdom',
    'test:watch': 'tablecheck-scripts test --env=jsdom'
  };

  const sspaPackageScripts = {
    'start:razzle': 'razzle start --standalone',
    'start:sspa': 'razzle start'
  };

  const libPackageScripts = {
    build: 'tablecheck-scripts build-lib',
    prepare: 'npm run co:login && npm run build'
  };

  const lernaPackageScript = {
    postinstall: 'lerna bootstrap'
  };

  let packageScripts = { ...basePackageScripts };

  if (scriptType === SCRIPTS.LERNA) {
    devDependencies.push('@commitlint/config-lerna-scopes');
    fs.copyFileSync(
      path.join(templatesDirectory, 'commitlint.lerna.config.js'),
      path.join(paths.cwd, 'commitlint.config.js')
    );
  } else {
    devDependencies.push('@tablecheck/commitlint-config');
    fs.copyFileSync(
      path.join(templatesDirectory, 'commitlint.config.js'),
      path.join(paths.cwd, 'commitlint.config.js')
    );
  }

  const lernaPackagesDirPath = path.join(paths.cwd, 'packages');
  if (scriptType === SCRIPTS.LERNA) {
    if (!fs.existsSync(lernaPackagesDirPath)) {
      fs.mkdirSync(lernaPackagesDirPath);
    }
  } else if (!fs.existsSync(paths.appSrc)) {
    fs.mkdirSync(paths.appSrc);
  }

  switch (scriptType) {
    case SCRIPTS.LERNA:
      fs.copyFileSync(
        path.join(templatesDirectory, 'lerna.json'),
        path.join(paths.cwd, 'lerna.json')
      );
      packageScripts = {
        ...packageScripts,
        ...libPackageScripts,
        ...lernaPackageScript
      };
      devDependencies.push('lerna@3');
      break;
    case SCRIPTS.LIB:
      fs.copyFileSync(
        path.join(templatesDirectory, 'libIndex.ts'),
        path.join(paths.appSrc, 'index.ts')
      );
      packageScripts = { ...packageScripts, ...libPackageScripts };
      break;
    case SCRIPTS.SPA:
      fs.copyFileSync(
        path.join(templatesDirectory, 'spaClient.tsx'),
        path.join(paths.appSrc, 'client.tsx')
      );
      if (!fs.existsSync(path.join(paths.cwd, 'public'))) {
        fs.mkdirSync(path.join(paths.cwd, 'public'));
      }
      fs.copySync(
        path.join(templatesDirectory, 'public'),
        path.join(paths.cwd, 'public')
      );
      fs.copyFileSync(
        path.join(templatesDirectory, 'index.html'),
        path.join(paths.cwd, 'public', 'index.html')
      );
      packageScripts = { ...packageScripts, ...appPackageScripts };
      writeRazzleConfig('spa');
      break;
    case SCRIPTS.SSPA:
      fs.copyFileSync(
        path.join(templatesDirectory, 'sspaClient.tsx'),
        path.join(paths.appSrc, 'client.tsx')
      );
      fs.copyFileSync(
        path.join(templatesDirectory, 'spaClient.tsx'),
        path.join(paths.appSrc, 'client.standalone.tsx')
      );
      devDependencies.push('single-spa-react');
      packageScripts = {
        ...packageScripts,
        ...appPackageScripts,
        ...sspaPackageScripts
      };
      writeRazzleConfig('sspa');
      break;
    case SCRIPTS.SSR:
      devDependencies.push('express', '@types/express');
      fs.copyFileSync(
        path.join(templatesDirectory, 'ssrClient.tsx'),
        path.join(paths.appSrc, 'client.tsx')
      );
      fs.copyFileSync(
        path.join(templatesDirectory, 'ssrIndex.ts'),
        path.join(paths.appSrc, 'index.ts')
      );
      fs.copyFileSync(
        path.join(templatesDirectory, 'ssrServer.tsx'),
        path.join(paths.appSrc, 'server.tsx')
      );
      packageScripts = { ...packageScripts, ...appPackageScripts };
      writeRazzleConfig('ssr');
      break;
    default:
      process.exit(0);
      return;
  }
  if ([SCRIPTS.SPA, SCRIPTS.SSPA, SCRIPTS.SSR].indexOf(scriptType) >= 0) {
    devDependencies.push(...appDependencies);
    const definitionsDirectory = path.join(paths.appSrc, 'definitions');
    if (!fs.existsSync(definitionsDirectory)) {
      fs.mkdirSync(definitionsDirectory);
    }
    fs.copyFileSync(
      path.join(templatesDirectory, 'windowDefinition.d.ts'),
      path.join(paths.appSrc, 'definitions/window.d.ts')
    );
    fs.copyFileSync(
      path.join(templatesDirectory, '.babelrc'),
      path.join(paths.cwd, '.babelrc')
    );
    fs.copyFileSync(
      path.join(templatesDirectory, 'App.tsx'),
      path.join(paths.appSrc, 'App.tsx')
    );
  }

  if (!fs.existsSync(paths.appPackageJson)) {
    console.log(chalk.blue.bold('Setting up default package.json\n'));
    await execa('npm', ['init', '-y'], execaOptions);
    const packageJson = require(paths.appPackageJson);
    fs.outputJsonSync(paths.appPackageJson, {
      ...packageJson,
      name: path.basename(path.dirname(paths.cwd))
    });
  }

  const configPath = path.join(paths.cwd, 'config');
  if (!fs.existsSync(configPath)) {
    console.log(chalk.blue.bold('Setting up default config files\n'));
    fs.mkdirSync(configPath);
    fs.copySync(path.join(templatesDirectory, 'config'), configPath);
  }

  if (additionalInstalls.indexOf(SCRIPTS.CYPRESS) !== -1) {
    copyCypressAppFiles(templatesDirectory);
    packageScripts = { ...packageScripts, ...cypressScripts };
    devDependencies.push(...cypressDevDependencies);
  }

  if (additionalInstalls.indexOf(SCRIPTS.STORYBOOK) !== -1) {
    copyStorybookFiles(templatesDirectory);
    packageScripts = { ...packageScripts, ...storybookScripts };
    devDependencies.push(...storybookDevDependencies);
  }

  const mainDependenciesRegex =
    /^(@emotion\/(react|styled)|react(-dom)?|express)[@$]/gi;
  const devInstalls = devDependencies.filter(
    (dep) => !dep.match(mainDependenciesRegex)
  );
  const mainInstalls = devDependencies.filter((dep) =>
    dep.match(mainDependenciesRegex)
  );
  console.log(chalk.blue.bold('Installing required dependencies\n'));
  console.log('npm install --save-dev', devInstalls.join(' '));
  await execa(
    'npm',
    ['install', '--save-dev', '--save-exact'].concat(devInstalls),
    execaOptions
  );
  console.log('npm install', mainInstalls.join(' '));
  await execa(
    'npm',
    ['install', '--save', '--save-exact'].concat(mainInstalls),
    execaOptions
  );

  if (additionalInstalls.indexOf(SCRIPTS.CYPRESS) !== -1) {
    console.log('Installing cypress');
    await execa('npx', ['cypress install'], execaOptions);
  }

  setPackageScripts(packageScripts);
  if (isLerna()) {
    // this is a cleanup script, we generally don't use in package scripts anymore
    await processAllPackages(
      ({ scripts, ...packageContent }) => packageContent
    );
  }
  await formatPackages();

  console.log(chalk.blue.bold('Formatting files'));
  try {
    await execa('npm', ['run', 'format'], execaOptions);
  } catch (e) {
    // quite likely this fails, just ignore any weird failures...
    // probably some unexpected folder from upgrade
  }
  process.exit(0);
}

(async () => {
  try {
    await initProject();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
