const { execSync } = require('child_process');
const path = require('path');

const CVSS = require('@turingpointde/cvss.js');
const { findMetric } = require('@turingpointde/cvss.js/lib/util');
const execa = require('execa');
const chalk = require('chalk');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const treeify = require('treeify');
const { execaOptions } = require('./utils/execa');
const { getArgv } = require('./utils/argv');
const paths = require('../config/paths');

const auditjsConfig = path.resolve(process.cwd(), 'auditjs.json');

const argv = getArgv({
  boolean: ['ci', 'junit'],
  default: {
    ci: false,
    junit: false
  }
});

const auditjsArgs = [
  'ossi',
  argv.junit ? '--xml' : '--dev',
  '--quiet',
  '--cache=cache/audit'
];
if (process.env.OSSI_USERNAME && process.env.OSSI_TOKEN) {
  auditjsArgs.push(`-u=${process.env.OSSI_USERNAME}`);
  auditjsArgs.push(`-p=${process.env.OSSI_TOKEN}`);
}

function colouredByScore(score, string = `${score}`) {
  if (score >= 9) {
    return chalk.bold.red(string);
  }
  if (score >= 7) {
    return chalk.magenta(string);
  }
  if (score >= 4) {
    return chalk.yellow(string);
  }
  if (score >= 0.1) {
    return chalk.cyan(string);
  }
  return chalk.green(string);
}

async function updateWhitelist() {
  const auditjsExec = await execa('auditjs', [...auditjsArgs, '--json'], {
    cwd: execaOptions.cwd,
    preferLocal: true,
    reject: false
  });
  const report = JSON.parse(auditjsExec.stdout);
  let config = {};
  try {
    config = fs.readJsonSync(auditjsConfig);
  } catch (err) {
    // ignore error, probably hasn't been run yet
  }

  const foundVulnerabilities = report.length;
  let whitelistedVulnerabilities = 0;

  if (foundVulnerabilities === 0) {
    console.log(chalk.green.bold('No new vulnerabilities.'));
    return;
  }

  if (!config.affected) {
    config.affected = [];
  }
  if (!config.ignore) {
    config.ignore = [];
  }

  for (let i = 0; i < foundVulnerabilities; i += 1) {
    const dep = report[i];
    if (!argv.verbose) console.clear();
    console.log(
      `Vulnerable Packages: ${chalk.bold.red(
        foundVulnerabilities
      )}. Whitelisted Packages: ${chalk.bold.green(
        whitelistedVulnerabilities
      )}.`
    );
    process.stdout.write(chalk.bold('CVSS Score Reference: '));
    [
      '0.0 None',
      '0.1 - 3.9 Low',
      '4.0 - 6.9 Medium',
      '7.0 - 8.9 High',
      '9.0 - 10.0 Critical'
    ].forEach((message, index) => {
      const [value] = message.split(' ');
      if (index > 0) {
        process.stdout.write(', ');
      }
      process.stdout.write(colouredByScore(parseFloat(value), message));
    });
    process.stdout.write('\n');
    console.log('');
    console.log(chalk.bold('Vulnerable package:'), dep.coordinates);
    console.log(chalk.bold('Package description:'), dep.description);
    console.log(chalk.bold('OSS Reference:'), dep.reference);
    console.log(
      chalk.bold(
        `\nAffected by ${dep.vulnerabilities.length} vulnerabilities;\n`
      )
    );
    dep.vulnerabilities.forEach(
      ({ title, description, cvssScore, cvssVector }) => {
        console.group();
        console.log(chalk.bold(title));
        console.group();
        console.log(description);
        console.groupEnd();
        const scoreString = colouredByScore(cvssScore);
        console.log(chalk`{bold CVSS Score:} ${scoreString}`);
        try {
          if (cvssVector) {
            const vector = CVSS(cvssVector).getDetailedVectorObject();
            console.log(chalk.bold(`CVSS Vector Details v${vector.CVSS}:`));
            console.group();
            let scopeKey = 'changed';
            if (vector.metrics.S && vector.metrics.S.value) {
              scopeKey = vector.metrics.S.value.toLowerCase();
            }
            Object.keys(vector.metrics).forEach((metricKey) => {
              const { fullName, value, abbr, valueAbbr } =
                vector.metrics[metricKey];
              const metricDefinition = findMetric(abbr);
              const valueDefinition = metricDefinition.metrics.find(
                (def) => def.abbr === valueAbbr
              );
              let score = valueDefinition.numerical;
              if (typeof score === 'object') {
                score = score[scopeKey] * 10;
              } else {
                score *= 10;
              }
              console.log(
                colouredByScore(score, chalk`{bold ${fullName}:} ${value}`)
              );
            });
            console.groupEnd();
          }
        } catch (e) {
          // ignore errors
          console.error(e);
        }
        console.log();
        console.groupEnd();
      }
    );
    if (dep.coordinates.match(/^pkg:npm\//)) {
      process.stdout.write('Finding usages...');
      const dependencyVersion = dep.coordinates.substring(8);
      try {
        const usages = execSync(
          `npm ls ${dependencyVersion} --json`
        ).toString();
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(chalk.bold('Dependency Path\n'));
        const buildDependencies = (dependencies) => {
          if (!dependencies) return null;
          return Object.keys(dependencies).reduce((tree, name) => {
            const { version, dependencies: childDeps } = dependencies[name];
            let displayName = `${name}@${version}`;
            if (displayName === dependencyVersion) {
              displayName = chalk.bgWhiteBright.cyan(` ${displayName} `);
            }

            tree[displayName] = buildDependencies(childDeps);
            return tree;
          }, {});
        };
        console.log(
          treeify.asTree(buildDependencies(JSON.parse(usages).dependencies))
        );
      } catch (err) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        console.log(`Failed to load dependencies for ${dependencyVersion}`);
      }
    }
    // eslint-disable-next-line no-await-in-loop
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Do you want to whitelist this package?'
      }
    ]);
    if (confirm) {
      whitelistedVulnerabilities += 1;
      dep.vulnerabilities.forEach(({ id }) => {
        if (!config.ignore.find(({ id: listedId }) => listedId === id)) {
          config.ignore.push({
            id
          });
        }
      });
      config.affected.push(dep);
    }
  }
  if (!argv.verbose) console.clear();
  console.log(
    chalk.bold.green(`Whitelisted packages: ${whitelistedVulnerabilities}`)
  );

  fs.outputJsonSync(auditjsConfig, config, { spaces: 2 });
  console.log(
    chalk.bold.red(
      `Vulnerable packages: ${
        foundVulnerabilities - whitelistedVulnerabilities
      }`
    )
  );
}

(async () => {
  if (argv.ci || argv.junit) {
    console.log(chalk.blue.bold('Scanning dependencies...'));
    const ciResult = await execa(
      'auditjs',
      auditjsArgs,
      argv.junit
        ? {
            cwd: paths.cwd,
            preferLocal: true,
            reject: false
          }
        : execaOptions
    );
    if (argv.junit) {
      const junitFilePath = path.join(paths.cwd, 'junit', 'auditjs.xml');
      fs.outputFileSync(junitFilePath, ciResult.stdout);
      console.log(chalk.blue.bold(`Report written to ${junitFilePath}`));
    }
    return;
  }
  console.log(
    chalk.blue.bold('Running Auditjs to get most up to date report.')
  );
  console.log(
    chalk.blue.bold(
      'If there are new vulnerabilities update prompts will be shown afterwards.'
    )
  );
  await updateWhitelist();
})();
