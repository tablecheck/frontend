const chalk = require('chalk');

// can probably improve this by utilising these two packages
// https://github.com/jcarpanelli/spinnies
// https://github.com/sindresorhus/cli-spinners

const taskList = [];
let greatestDepth = 0;

function getIndentSpaces(depth, postfix = '└ ', separator = '|') {
  const isSubMessage = taskList.length < greatestDepth;
  let string = '';
  for (let i = 1; i < depth; i += 1)
    string += `${depth > 1 ? separator : ' '} `;
  return isSubMessage ? `${string}${postfix}` : string;
}

function logTaskStart(message) {
  if (taskList.length === 0) greatestDepth = 0;
  const prefix =
    taskList.length && greatestDepth <= taskList.length ? '\n' : '';
  taskList.push(message);
  process.stdout.write(
    chalk.blue(`${prefix}${getIndentSpaces(taskList.length, '|')}${message}...`)
  );
  greatestDepth = taskList.length;
}
function logTaskEnd(isSuccessOrWarnings) {
  const depth =
    taskList.length === 1 && greatestDepth === 1 ? 2 : taskList.length;
  const indent =
    taskList.length === greatestDepth ? '  ' : getIndentSpaces(depth);
  const warningIndent =
    taskList.length === greatestDepth && greatestDepth === 1
      ? '  '
      : getIndentSpaces(depth + 1, '  ', ' ');
  if (Array.isArray(isSuccessOrWarnings) && isSuccessOrWarnings.length) {
    process.stdout.write(
      chalk.yellow(`${chalk.blue(indent)}Done with warnings!\n`)
    );
    isSuccessOrWarnings.forEach((warning, warningIndex) => {
      const warningLines = warning.split('\n');
      warningLines.forEach((line, lineIndex) => {
        let prefix = warningIndex > 0 ? '\n' : '';
        prefix += warningIndent;
        prefix += lineIndex > 0 ? ' ' : '-';
        process.stdout.write(`${prefix} ${line}\n`);
      });
    });
  } else if (
    isSuccessOrWarnings ||
    typeof isSuccessOrWarnings === 'undefined'
  ) {
    process.stdout.write(chalk.green(`${chalk.blue(indent)}Done!\n`));
  } else {
    process.stdout.write(chalk.red(`${chalk.blue(indent)}Failed!\n`));
  }
  taskList.pop();
  if (!taskList.length) process.stdout.write('\n');
}

module.exports = {
  logTaskStart,
  logTaskEnd
};
