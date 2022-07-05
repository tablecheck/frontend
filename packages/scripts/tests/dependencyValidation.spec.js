import path from 'path';

import { evaluatePackage } from '../scripts/utils/package';

const absoluteVersion = '2.3.5';
const tildeVersion = '~3.0.0';
const caretVersion = '^1.0.0';
const anyVersion = '*';
const anyEmptyVersion = '';
const xVersion = '1.x';
const gtVersion = '>1.2.3';
const gteVersion = '>=5.0.0';
const ltVersion = '<1.2.3';
const lteVersion = '<=5.0.0';

const dashRangeVersion = '1.0.0 - 3.0.0';
const betweenVersion = '>=1.0.0 <3.0.0';
const multiRangeVersion = '>=1.0.0 <3.0.0 || >=4 <5';
const multiDashRangeVersion = '1 - 3 || 4 - 5';

const httpVersion = 'http://some.url.com';
const gitVersion = 'git:some-git-tag-path';
const repoVersion = 'username/repo';
const tagVersion = 'some-tag';
const filePathVersion = '/some/path/to/consider';

const mockPath = path;

jest.mock('../scripts/utils/lerna', () => ({
  getLernaPaths: () => Promise.resolve(['test-package', 'package'])
}));
jest.mock('fs-extra', () => ({
  readJsonSync: (packagePath) => ({
    name: `@lerna-repo/${mockPath.parse(packagePath).name}`
  }),
  existsSync: () => false
}));

describe('lintPackageVersions', () => {
  test.each([
    ['handles empty package', 'any-package', undefined, []],
    ['handles empty dependencies', 'any-package', {}, []],
    [
      'handles valid dependencies',
      'any-package',
      {
        absoluteVersion,
        httpVersion,
        gitVersion,
        repoVersion,
        tagVersion,
        filePathVersion
      },
      []
    ],
    [
      'handles invalid dependencies',
      'any-package',
      {
        tildeVersion,
        caretVersion,
        anyVersion,
        anyEmptyVersion,
        xVersion,
        gtVersion,
        gteVersion,
        ltVersion,
        lteVersion,
        dashRangeVersion,
        betweenVersion,
        multiRangeVersion,
        multiDashRangeVersion
      },
      [
        `tildeVersion@${tildeVersion}`,
        `caretVersion@${caretVersion}`,
        `anyVersion@${anyVersion}`,
        `anyEmptyVersion@${anyEmptyVersion}`,
        `xVersion@${xVersion}`,
        `gtVersion@${gtVersion}`,
        `gteVersion@${gteVersion}`,
        `ltVersion@${ltVersion}`,
        `lteVersion@${lteVersion}`,
        `dashRangeVersion@${dashRangeVersion}`,
        `betweenVersion@${betweenVersion}`,
        `multiRangeVersion@${multiRangeVersion}`,
        `multiDashRangeVersion@${multiDashRangeVersion}`
      ]
    ],
    [
      'handles lerna mono repo packages',
      '@lerna-repo/package',
      {
        '@lerna-repo/test-package': '^1.3.0'
      },
      []
    ]
  ])('%s', async (testName, packageName, input, output) => {
    expect(
      await evaluatePackage({
        name: packageName,
        dependencies: input,
        devDependencies: input
      })
    ).toEqual(output.concat(output));
  });
});
