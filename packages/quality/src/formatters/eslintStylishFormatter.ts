import fs from 'fs';
import path from 'path';

import stripAnsi from 'strip-ansi';
import table from 'text-table';
import { ESLint } from 'eslint';
import { ChalkInstance } from 'chalk';

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Given a word and a count, append an s if count is not one.
 * @param {string} word A word in its singular form.
 * @param {int} count A number controlling whether word should be pluralized.
 * @returns {string} The original word with an s on the end if count is not one.
 */
function pluralize(word: string, count: number) {
  return count === 1 ? word : `${word}s`;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

function stylishFormatter(chalk: ChalkInstance, results: ESLint.LintResult[]) {
  let output = '\n';
  let errorCount = 0;
  let warningCount = 0;
  let fixableErrorCount = 0;
  let fixableWarningCount = 0;
  let summaryColor: keyof ChalkInstance = 'yellow';

  results.forEach((result) => {
    const { messages } = result;

    if (messages.length === 0) {
      return;
    }

    errorCount += result.errorCount;
    warningCount += result.warningCount;
    fixableErrorCount += result.fixableErrorCount;
    fixableWarningCount += result.fixableWarningCount;

    output += `${chalk.underline(result.filePath)}\n`;

    output += `${table(
      messages.map((message) => {
        let messageType;
        if (message.fatal || message.severity === 2) {
          messageType = chalk.red('error');
          summaryColor = 'red';
        } else {
          messageType = chalk.yellow('warning');
        }
        return [
          '',
          message.line || 0,
          message.column || 0,
          messageType,
          message.message.replace(/([^ ])\.$/u, '$1'),
          chalk.dim(message.ruleId || ''),
        ];
      }),
      {
        align: ['.', 'r', 'l'],
        stringLength(str) {
          return stripAnsi(str).length;
        },
      },
    )
      .split('\n')
      .map((el) =>
        el.replace(/(\d+)\s+(\d+)/u, (m, p1, p2) => chalk.dim(`${p1}:${p2}`)),
      )
      .join('\n')}\n\n`;
  });

  const total = errorCount + warningCount;

  if (total > 0) {
    output += chalk[summaryColor].bold(
      [
        '\u2716 ',
        total,
        pluralize(' problem', total),
        ' (',
        errorCount,
        pluralize(' error', errorCount),
        ', ',
        warningCount,
        pluralize(' warning', warningCount),
        ')\n',
      ].join(''),
    );

    if (fixableErrorCount > 0 || fixableWarningCount > 0) {
      output += chalk[summaryColor].bold(
        [
          '  ',
          fixableErrorCount,
          pluralize(' error', fixableErrorCount),
          ' and ',
          fixableWarningCount,
          pluralize(' warning', fixableWarningCount),
          ' potentially fixable with the `--fix` option.\n',
        ].join(''),
      );
    }
  }

  // Resets output color, for prevent change on top level
  return total > 0 ? chalk.reset(output) : '';
}

function comparePaths(pathA: string, pathB: string) {
  const aIsDir = fs.statSync(pathA).isDirectory();
  const bIsDir = fs.statSync(pathB).isDirectory();

  if (aIsDir && !bIsDir) {
    return -1;
  }

  if (!aIsDir && bIsDir) {
    return 1;
  }

  return pathA.localeCompare(pathB);
}

export default async function customStylish(results: ESLint.LintResult[]) {
  const chalk = await import('chalk');
  return stylishFormatter(
    chalk.default,
    results
      // sorts by output by folder first, then files
      // this should roughly mimic most IDE and file browser displays
      .sort(({ filePath: a }, { filePath: b }) => {
        const aParts = a.split('/');
        const bParts = b.split('/');
        for (let i = 0; i < aParts.length && i < bParts.length; i += 1) {
          if (aParts[i] !== bParts[i]) {
            return comparePaths(
              aParts.slice(0, i + 1).join('/'),
              bParts.slice(0, i + 1).join('/'),
            );
          }
        }
        return comparePaths(a, b);
      })
      .map((result) => ({
        ...result,
        // makes the path relative to cwd instead of absolute
        filePath: path.relative(process.cwd(), result.filePath),
      })),
  );
}
