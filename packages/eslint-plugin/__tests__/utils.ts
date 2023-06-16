import { ESLintUtils } from '@typescript-eslint/utils';
import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';

export function initRuleTester(
  options: Parameters<(typeof ESLintUtils.RuleTester)['call']>[0],
): ESLintUtils.RuleTester {
  const ruleTester = new RuleTester(options);
  ESLintUtils.RuleTester.it = it;
  ESLintUtils.RuleTester.describe = describe;
  ruleTester.it = it;
  ruleTester.describe = describe;
  ruleTester.itOnly = (name, fn, timeout) => it.only(name, fn, timeout);
  return ruleTester;
}
