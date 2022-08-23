"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageCheck = void 0;
const path = require("path");
const chalk = require("chalk");
const fs = require("fs-extra");
async function evaluatePackage({ dependencies, devDependencies, name, }) {
    const { getLernaPaths } = await import('@tablecheck/frontend-utils');
    // package.json version keys check
    const invalidVersionValues = [];
    const lernaPaths = getLernaPaths();
    const lernaPackageNames = lernaPaths.map((lernaPath) => {
        const packageJson = fs.readJsonSync(path.join(lernaPath, 'package.json'));
        return packageJson.name;
    });
    function validateVersion(key, version, packageName) {
        if (!version) {
            invalidVersionValues.push(`${key}@${version}`);
            return;
        }
        // lerna sibling package check
        const isLernaDependency = lernaPackageNames.indexOf(packageName) > -1;
        if (isLernaDependency && /^\^/i.test(version)) {
            return;
        }
        const isValidVersion = /^([0-9]|http|git|(\/|)[a-z-_]+(\/[a-z-_]+)*)/gi.test(version);
        const isRange = / (-|\|\|) /gi.test(version);
        const hasLooseMatch = /\.x$/gi.test(version);
        if (!isValidVersion || isRange || hasLooseMatch) {
            invalidVersionValues.push(`${key}@${version}`);
        }
    }
    Object.keys(dependencies || {}).forEach((key) => validateVersion(key, dependencies?.[key], name));
    Object.keys(devDependencies || {}).forEach((key) => validateVersion(key, devDependencies?.[key], name));
    return invalidVersionValues;
}
async function packageCheck({ directory, shouldFix, }) {
    const { processPackage, unicodeEmoji: icons } = await import('@tablecheck/frontend-utils');
    console.log(chalk.cyan(`  ${icons.info}  We recommend using \`npm-upgrade\` to manage dependencies.\n`));
    const result = await processPackage({
        packageDir: directory,
        shouldWriteFile: shouldFix,
        packageProcessor: async (appPackage, packagePath) => {
            const displayPath = path.relative(process.cwd(), packagePath);
            const invalidVersionValues = await evaluatePackage(appPackage);
            if (invalidVersionValues.length) {
                console.error(chalk.red(`${icons.error} Invalid Package: ${displayPath}`));
                console.log('Dependencies in package.json must be absolute. The only exception are sibling lerna monorepo packages, which may use `^`.');
                console.log(`The following dependencies are invalid;\n - ${invalidVersionValues.join('\n - ')}`);
                throw new Error('Invalid dependencies');
            }
            return appPackage;
        },
    });
    if (result.success) {
        console.log(chalk.green(`${icons.check} Package dependencies validated`));
    }
    return result;
}
exports.packageCheck = packageCheck;
//# sourceMappingURL=package.js.map