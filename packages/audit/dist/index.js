import * as path from 'path';
import * as prompts from '@clack/prompts';
import { execaOptions } from '@tablecheck/frontend-utils';
import CVSS from '@turingpointde/cvss.js';
import definitions from '@turingpointde/cvss.js/lib/cvss_3_0.json' assert { type: 'json' };
import chalk from 'chalk';
import { execa } from 'execa';
import fs from 'fs-extra';
import treeify from 'treeify';
/**
 * Finds the vector's metric by it's abbreviation - moved from
 *
 * @param {String} abbr
 */
function findMetric(abbr) {
    return definitions.definitions.find((def) => def.abbr === abbr);
}
function getAuditjsArgs(useJunit) {
    const auditjsArgs = [
        'ossi',
        useJunit ? '--xml' : '--dev',
        '--quiet',
        '--cache=cache/audit',
    ];
    if (process.env.OSSI_USERNAME && process.env.OSSI_TOKEN) {
        auditjsArgs.push(`-u=${process.env.OSSI_USERNAME}`);
        auditjsArgs.push(`-p=${process.env.OSSI_TOKEN}`);
    }
    return auditjsArgs;
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
async function updateWhitelist(rootPath) {
    const auditjsConfig = path.resolve(rootPath, 'auditjs.json');
    prompts.intro('Running auditjs to detect and evaluate new vulnerabilities');
    const updateAuditSpinner = prompts.spinner();
    updateAuditSpinner.start('Running auditjs');
    const auditjsExec = await execa('auditjs', [...getAuditjsArgs(false), '--json'], {
        cwd: execaOptions.cwd,
        preferLocal: true,
        reject: false,
    });
    const report = JSON.parse(auditjsExec.stdout);
    const updatePackages = [];
    let config = {
        affected: [],
        ignore: [],
    };
    try {
        config = Object.assign(config, fs.readJsonSync(auditjsConfig));
    }
    catch (err) {
        // ignore error, probably hasn't been run yet
    }
    const foundVulnerabilities = report.length;
    let whitelistedVulnerabilities = 0;
    updateAuditSpinner.stop(foundVulnerabilities === 0
        ? 'No new vulnerabilities!'
        : `Found ${foundVulnerabilities} new vulnerabilities.`);
    if (foundVulnerabilities === 0) {
        prompts.outro('All OK! ✨');
        return;
    }
    function cancelAudit() {
        prompts.cancel('Audit cancelled');
        process.exit(0);
    }
    class VulnerabilityReport {
        dep;
        constructor(dep) {
            this.dep = dep;
        }
        async chooseAction() {
            prompts.note(this.getHeader());
            const spinner = prompts.spinner();
            spinner.start(`Finding npm usages`);
            const message = await this.loadDependencyDetails();
            spinner.stop(message);
            await this.promptWhitelist();
        }
        getHeader() {
            return [
                this.getScoreKey(),
                '',
                this.getDescription(),
                this.getVulnerabilities(),
            ].join('\n');
        }
        getScoreKey() {
            return `${chalk.bold('CVSS Score Reference: ')}
        ${[
                '0.0 None',
                '0.1 - 3.9 Low',
                '4.0 - 6.9 Medium',
                '7.0 - 8.9 High',
                '9.0 - 10.0 Critical',
            ]
                .map((message) => {
                const [value] = message.split(' ');
                return colouredByScore(parseFloat(value), message);
            })
                .join(', ')}`;
        }
        getDescription() {
            return [
                `${chalk.bold('Vulnerable package:')} ${this.dep.coordinates}`,
                `${chalk.bold('Package description:')} ${this.dep.description}`,
                `${chalk.bold('OSS Reference:')} ${this.dep.reference}`,
            ].join('\n');
        }
        getVulnerabilities() {
            return this.dep.vulnerabilities.map(({ title, description, cvssScore, cvssVector }) => `  ${chalk.bold(title)}
    ${description}
  ${chalk(`${chalk.bold('CVSS Score:')} ${colouredByScore(cvssScore)}`)}${this.getCvssVector(cvssVector)}
  `);
        }
        getCvssVector(cvssVector) {
            if (!cvssVector)
                return '';
            try {
                const vector = CVSS(cvssVector).getDetailedVectorObject();
                return `    ${chalk.bold(`CVSS Vector Details v${vector.CVSS}:`)}
${this.getVectorMetrics(vector)
                    .map((s) => `      ${s}`)
                    .join('\n')}`;
            }
            catch (err) {
                console.error(err);
            }
        }
        getVectorMetrics(vector) {
            let scopeKey = 'changed';
            if (vector.metrics.S && vector.metrics.S.value) {
                scopeKey = vector.metrics.S.value.toLowerCase();
            }
            return Object.keys(vector.metrics).map((metricKey) => this.getVectorMetricScore(scopeKey, vector.metrics[metricKey]));
        }
        getVectorMetricScore(scopeKey, { fullName, value, abbr, valueAbbr }) {
            const metricDefinition = findMetric(abbr);
            const valueDefinition = metricDefinition.metrics.find((def) => def.abbr === valueAbbr);
            if (!valueDefinition) {
                return colouredByScore(99, `${chalk.bold(`${fullName}:`)} ${value}`);
            }
            let score = valueDefinition.numerical;
            if (typeof score === 'object') {
                score = score[scopeKey] * 10;
            }
            else {
                score *= 10;
            }
            return colouredByScore(score, `${chalk.bold(`${fullName}:`)} ${value}`);
        }
        async loadDependencyDetails() {
            if (!this.dep.coordinates.match(/^pkg:npm\//))
                return this.getHeader();
            const dependencyVersion = this.getDependencyVersion();
            try {
                const usages = await this.loadNpmPackages(dependencyVersion);
                if (!usages)
                    return `Failed to load dependencies for ${dependencyVersion}`;
                const dependencyTree = treeify.asTree(this.buildDependenciesFromUsages(dependencyVersion, usages.dependencies), true, true);
                return `${chalk.bold('Dependency Path')}\n${dependencyTree.trim()}`;
            }
            catch (err) {
                return `Failed to load dependencies for ${dependencyVersion}`;
            }
        }
        getDependencyVersion() {
            return this.dep.coordinates.substring(8);
        }
        async loadNpmPackages(dependencyVersion) {
            const npmListExec = await execa('npm', [
                'ls',
                dependencyVersion,
                '--json',
            ]);
            return JSON.parse(npmListExec.stdout);
        }
        buildDependenciesFromUsages(dependencyVersion, dependencies) {
            return Object.keys(dependencies).reduce((tree, name) => {
                const { version, dependencies: childDeps } = dependencies[name];
                let displayName = `${name}@${version}`;
                if (displayName === dependencyVersion) {
                    displayName = chalk.bgWhiteBright.cyan(` ${displayName} `);
                }
                if (childDeps)
                    tree[displayName] = this.buildDependenciesFromUsages(dependencyVersion, childDeps);
                else
                    tree[displayName] = {};
                return tree;
            }, {});
        }
        async promptWhitelist() {
            const shouldWhitelist = await prompts.confirm({
                message: 'Do you want to whitelist this package?',
                active: 'Whitelist',
                inactive: 'Manually Upgrade',
            });
            if (prompts.isCancel(shouldWhitelist))
                return cancelAudit();
            if (shouldWhitelist) {
                whitelistedVulnerabilities += 1;
                this.dep.vulnerabilities.forEach(({ id }) => {
                    if (!config.ignore.find(({ id: listedId }) => listedId === id)) {
                        config.ignore.push({
                            id,
                        });
                    }
                });
                config.affected.push(this.dep);
            }
            else {
                updatePackages.push(this.getDependencyVersion());
            }
        }
    }
    for (let i = 0; i < foundVulnerabilities; i += 1) {
        await new VulnerabilityReport(report[i]).chooseAction();
    }
    const outputSpinner = prompts.spinner();
    outputSpinner.start('Updating auditjs files');
    fs.outputJsonSync(auditjsConfig, config, { spaces: 2 });
    outputSpinner.stop(`Updated auditjs files`);
    const outstandingCount = foundVulnerabilities - whitelistedVulnerabilities;
    const outstandingMessage = `Vulnerable packages: ${outstandingCount}`;
    const whitelistedMessage = `Whitelisted packages: ${whitelistedVulnerabilities}`;
    const updateMessage = updatePackages.length
        ? `Run the following to update non-updated packages\n${chalk.cyan.bold(`\`npm update ${updatePackages
            .reduce((acc, s) => {
            if (acc.includes(s))
                return acc;
            acc.push(s);
            return acc;
        }, [])
            .map((s) => `${s.split('@')[0]}@latest`)
            .join(' ')}\``)}\n`
        : '';
    prompts.note(`${updateMessage}${outstandingCount
        ? whitelistedMessage
        : chalk.bold.green(whitelistedMessage)}\n${outstandingCount ? chalk.bold.red(outstandingMessage) : outstandingMessage}`);
    prompts.outro('Done.');
}
export async function run({ rootPath, updatePrompts, }) {
    const packageLock = path.resolve(rootPath, 'package-lock.json');
    if (!fs.existsSync(packageLock)) {
        console.log(chalk.yellow('package-lock.json not found, no audit to run'));
        return true;
    }
    if (updatePrompts) {
        await updateWhitelist(rootPath);
        return true;
    }
    console.log(chalk.blue.bold('Scanning dependencies...'));
    const ciResult = await execa('auditjs', getAuditjsArgs(true), {
        cwd: rootPath,
        preferLocal: true,
        reject: false,
    });
    const junitFilePath = path.join(rootPath, 'junit', 'auditjs.xml');
    fs.outputFileSync(junitFilePath, ciResult.stdout);
    console.log(chalk.blue.bold(`Report written to ${junitFilePath}`));
    return !ciResult.failed;
}
//# sourceMappingURL=index.js.map