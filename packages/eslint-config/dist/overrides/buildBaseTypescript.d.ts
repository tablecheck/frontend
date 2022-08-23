import type { Linter } from 'eslint';
/**
 *
 * @param files - file globs
 * @param rules - here should be the basic rules
 * @param forcedRules - this is the place to override any ts rules
 * @returns eslint-config
 */
export declare function buildBaseTypescript(files: Linter.ConfigOverride['files'], rules: Linter.RulesRecord, forcedRules?: Linter.RulesRecord): Linter.ConfigOverride | undefined;
