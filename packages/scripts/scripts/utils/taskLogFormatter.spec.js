const chalk = require('chalk');

const { logTaskStart, logTaskEnd } = require('./taskLogFormatter');

describe('scripts/taskLogFormatter', () => {
  beforeEach(() => {
    jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });
  afterEach(() => jest.clearAllMocks());

  describe('single task', () => {
    test('should handle correctly', () => {
      logTaskStart('Task');
      logTaskEnd(true);
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        1,
        chalk.blue('Task...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        2,
        chalk.green(`${chalk.blue`  `}Done!\n`)
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(3, '\n');
      expect(process.stdout.write).toHaveBeenCalledTimes(3);
    });

    test('should handle end as undefined end param', () => {
      logTaskStart('Task');
      logTaskEnd();
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        1,
        chalk.blue('Task...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        2,
        chalk.green(`${chalk.blue`  `}Done!\n`)
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(3, '\n');
      expect(process.stdout.write).toHaveBeenCalledTimes(3);
    });

    test('should handle end as undefined empty array', () => {
      logTaskStart('Task');
      logTaskEnd([]);
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        1,
        chalk.blue('Task...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        2,
        chalk.green(`${chalk.blue`  `}Done!\n`)
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(3, '\n');
      expect(process.stdout.write).toHaveBeenCalledTimes(3);
    });

    test('should handle end as failure', () => {
      logTaskStart('Task');
      logTaskEnd(false);
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        1,
        chalk.blue('Task...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        2,
        chalk.red(`${chalk.blue`  `}Failed!\n`)
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(3, '\n');
      expect(process.stdout.write).toHaveBeenCalledTimes(3);
    });

    test('should handle end as with warnings', () => {
      logTaskStart('Task');
      logTaskEnd(['Warning']);
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        1,
        chalk.blue('Task...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        2,
        chalk.yellow`${chalk.blue`  `}Done with warnings!\n`
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(3, `  - Warning\n`);
      expect(process.stdout.write).toHaveBeenNthCalledWith(4, '\n');
      expect(process.stdout.write).toHaveBeenCalledTimes(4);
    });

    test('should handle multiline warnings', () => {
      logTaskStart('Task');
      logTaskEnd(['Warning\nSecond line']);
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        1,
        chalk.blue('Task...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        2,
        chalk.yellow`${chalk.blue`  `}Done with warnings!\n`
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(3, `  - Warning\n`);
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        4,
        `    Second line\n`
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(5, '\n');
      expect(process.stdout.write).toHaveBeenCalledTimes(5);
    });

    test('should handle multiple warnings', () => {
      logTaskStart('Task');
      logTaskEnd(['Warning', 'Second']);
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        1,
        chalk.blue('Task...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        2,
        chalk.yellow`${chalk.blue`  `}Done with warnings!\n`
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(3, `  - Warning\n`);
      expect(process.stdout.write).toHaveBeenNthCalledWith(4, `\n  - Second\n`);
      expect(process.stdout.write).toHaveBeenNthCalledWith(5, '\n');
      expect(process.stdout.write).toHaveBeenCalledTimes(5);
    });
  });

  describe('nested task', () => {
    test('should handle success', () => {
      logTaskStart('Task 1');
      logTaskStart('Task 2');
      logTaskStart('Task 3');
      logTaskEnd();
      logTaskEnd();
      logTaskEnd();
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        1,
        chalk.blue('Task 1...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        2,
        chalk.blue('\n| Task 2...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        3,
        chalk.blue('\n| | Task 3...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        4,
        chalk.green(`${chalk.blue`  `}Done!\n`)
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        5,
        chalk.green(`${chalk.blue`| └ `}Done!\n`)
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        6,
        chalk.green(`${chalk.blue`└ `}Done!\n`)
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(7, '\n');
      expect(process.stdout.write).toHaveBeenCalledTimes(7);
    });

    test('should handle subsequent nested tasks', () => {
      logTaskStart('Task 1');
      logTaskStart('Task 2');
      logTaskEnd();
      logTaskStart('Task 3');
      logTaskEnd();
      logTaskEnd();
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        1,
        chalk.blue('Task 1...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        2,
        chalk.blue('\n| Task 2...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        3,
        chalk.green(`${chalk.blue`  `}Done!\n`)
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        4,
        chalk.blue('| Task 3...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        5,
        chalk.green(`${chalk.blue`  `}Done!\n`)
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        6,
        chalk.green(`${chalk.blue`└ `}Done!\n`)
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(7, '\n');
      expect(process.stdout.write).toHaveBeenCalledTimes(7);
    });

    test('should handle error', () => {
      logTaskStart('Task 1');
      logTaskStart('Task 2');
      logTaskStart('Task 3');
      logTaskEnd(false);
      logTaskEnd(false);
      logTaskEnd(false);
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        1,
        chalk.blue('Task 1...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        2,
        chalk.blue('\n| Task 2...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        3,
        chalk.blue('\n| | Task 3...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        4,
        chalk.red(`${chalk.blue`  `}Failed!\n`)
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        5,
        chalk.red(`${chalk.blue`| └ `}Failed!\n`)
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        6,
        chalk.red(`${chalk.blue`└ `}Failed!\n`)
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(7, '\n');
      expect(process.stdout.write).toHaveBeenCalledTimes(7);
    });

    test('should handle warnings', () => {
      logTaskStart('Task 1');
      logTaskStart('Task 2');
      logTaskStart('Task 3');
      logTaskEnd(['Warning']);
      logTaskEnd(['Warning']);
      logTaskEnd(['Warning']);
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        1,
        chalk.blue('Task 1...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        2,
        chalk.blue('\n| Task 2...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        3,
        chalk.blue('\n| | Task 3...')
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        4,
        chalk.yellow`${chalk.blue`  `}Done with warnings!\n`
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        5,
        `      - Warning\n`
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        6,
        chalk.yellow`${chalk.blue`| └ `}Done with warnings!\n`
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        7,
        `      - Warning\n`
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        8,
        chalk.yellow`${chalk.blue`└ `}Done with warnings!\n`
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(
        9,
        `    - Warning\n`
      );
      expect(process.stdout.write).toHaveBeenNthCalledWith(10, '\n');
      expect(process.stdout.write).toHaveBeenCalledTimes(10);
    });
  });
});
