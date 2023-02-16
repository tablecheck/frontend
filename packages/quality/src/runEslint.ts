import fs from 'fs-extra';
import path from 'path';
import { ESLint } from 'eslint';
import { paths } from '@tablecheck/frontend-utils';

export async function runEslint(eslintPaths: string[], shouldAutoFix: boolean) {
  let results = [];
  try {
    const eslint = new ESLint({
      cwd: paths.cwd,
      fix: shouldAutoFix,
      overrideConfigFile: path.join(paths.cwd, '.eslintrc.js'),
      useEslintrc: false,
      errorOnUnmatchedPattern: false,
      reportUnusedDisableDirectives: 'error'
    });
    results = await eslint.lintFiles(eslintPaths);
    if (shouldAutoFix) {
      await ESLint.outputFixes(results);
    }
    const cliFormatter = await eslint.loadFormatter(
      new URL('./formatters/eslintStylishFormatter.js', import.meta.url)
        .pathname
    );
    const junitFormatter = await eslint.loadFormatter(
      new URL('./formatters/eslintJunitFormatter.js', import.meta.url).pathname
    );
    console.log(await cliFormatter.format(results));
    fs.outputFileSync(
      path.join(paths.cwd, 'junit', 'eslint.xml'),
      await junitFormatter.format(results),
      'utf8'
    );
  } catch (e) {
    console.error('eslint error', e);
    throw e;
  }
  for (let i = 0; i < results.length; i += 1) {
    const result = results[i];
    if (result.errorCount || result.fatalErrorCount) {
      throw new Error('Eslint detected errors');
    }
  }
}
