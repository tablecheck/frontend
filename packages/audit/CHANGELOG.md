# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [6.1.0](https://github.com/tablecheck/frontend/compare/@tablecheck/frontend-audit@6.0.1...@tablecheck/frontend-audit@6.1.0) (2024-02-06)


### Bug Fixes

* correctly define quality:format so it can be cached ([791d58f](https://github.com/tablecheck/frontend/commit/791d58fac0bf61416a90e90c0fef1308db7fdbfd))





## [6.0.1](https://github.com/tablecheck/frontend/compare/@tablecheck/frontend-audit@6.0.0...@tablecheck/frontend-audit@6.0.1) (2024-01-31)

**Note:** Version bump only for package @tablecheck/frontend-audit





# [6.0.0](https://github.com/tablecheck/tablecheck-react-system/compare/@tablecheck/frontend-audit@5.0.0...@tablecheck/frontend-audit@6.0.0) (2023-10-13)


### Bug Fixes

* audit should exit based on success ([b91ab05](https://github.com/tablecheck/tablecheck-react-system/commit/b91ab05e883ee3b0bbe0063465421655266541c7))





# 5.0.0 (2023-10-11)


### Bug Fixes

* audit works and passes ([7332c20](https://github.com/tablecheck/tablecheck-react-system/commit/7332c2004082c17c20bd39fb3813d32a37af83d6))
* bump package versions in deps ([3e7a058](https://github.com/tablecheck/tablecheck-react-system/commit/3e7a0584f2a4e984a47c0d2431a2f6c532c6f794))
* hack the package.json versions to be correct ([1b858ea](https://github.com/tablecheck/tablecheck-react-system/commit/1b858eab9ba0de977087116603e4c1890b6d2afe))
* import esm/cjs bugs ([211bf95](https://github.com/tablecheck/tablecheck-react-system/commit/211bf95c64851427f47c33767194278f8f57d7a6))
* install from public npm and remove dist files ([034765e](https://github.com/tablecheck/tablecheck-react-system/commit/034765e7128a1e9e6fe5970d7dac57c207d0a221))
* mangle once more… ([2a269ac](https://github.com/tablecheck/tablecheck-react-system/commit/2a269ac580d662e0f63b9a90e2df96bc67dcd52c))
* mangle package versions again ([4513326](https://github.com/tablecheck/tablecheck-react-system/commit/4513326b88ed15769a35790ba0b6fea9af3648a7))
* migrate script updates and remove dead packages ([df8be2f](https://github.com/tablecheck/tablecheck-react-system/commit/df8be2fb6b4e4bf0eac7a0adc7a3343915c35189))
* nx requires commonjs or weird node memory errors occur ([8085395](https://github.com/tablecheck/tablecheck-react-system/commit/808539508a5b80b7e247dfd58504470cbf221a2d))
* prettier works with v2/v3 though v3 is preferred ([089c36b](https://github.com/tablecheck/tablecheck-react-system/commit/089c36b1fbbfd4583ed58f6a9570ecc980139abc))
* refactor around package names to reset some versions ([c6486be](https://github.com/tablecheck/tablecheck-react-system/commit/c6486be9e6e0f6ff2c79c48be484f99417db39b4))
* release publish fix ([f9e55e9](https://github.com/tablecheck/tablecheck-react-system/commit/f9e55e9cf3651cad4fd1d79d18735b9cea70396b))
* remove audit project and correct paths for nx schemas ([de3582f](https://github.com/tablecheck/tablecheck-react-system/commit/de3582f500210a398df306866072c66e89ea9668))


### Features

* build runs and quality packages function ([694d732](https://github.com/tablecheck/tablecheck-react-system/commit/694d7327828f54794a5f4d9f6b56c116adb967d2))
* full build and passing lint via nx!! ([8eb98c5](https://github.com/tablecheck/tablecheck-react-system/commit/8eb98c51c72335db82550536acb35881958eea8c))
* major upgrade ([265f2ff](https://github.com/tablecheck/tablecheck-react-system/commit/265f2ffe33dd2afbd7c41ec261558a405a6eb67f))
* move everything except quality ([a1e643e](https://github.com/tablecheck/tablecheck-react-system/commit/a1e643eb8f2299623d070b56fc85e982dd088655))
* scripts is dead, long live scripts! WIP! ([b248650](https://github.com/tablecheck/tablecheck-react-system/commit/b2486506f43f40ed98a602e309fe3b58dcb845d5))
* upgrade eslint dependencies ([e60604b](https://github.com/tablecheck/tablecheck-react-system/commit/e60604bcf9e5389f51cbe0b828d95198ab78931a))


### BREAKING CHANGES

* scripts package removed





# v5.0.0 (Wed Oct 11 2023)

#### 💥 Breaking Change

- ci: fix builds with tsconfig dancing [#87](https://github.com/tablecheck/tablecheck-react-system/pull/87) ([@SimeonC](https://github.com/SimeonC))
- ci: fix release by upgrading dependencies [#87](https://github.com/tablecheck/tablecheck-react-system/pull/87) ([@SimeonC](https://github.com/SimeonC))
- fix: prettier works with v2/v3 though v3 is preferred [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- feat: upgrade eslint dependencies [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: remove audit project and correct paths for nx schemas [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: nx requires commonjs or weird node memory errors occur [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: bump package versions in deps [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: migrate script updates and remove dead packages [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: install from public npm and remove dist files [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: audit works and passes [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: import esm/cjs bugs [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- feat: full build and passing lint via nx!! [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- feat: build runs and quality packages function [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- feat: move everything except quality [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- chore: deps upgrade [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- feat: major upgrade [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- refactor: get the ts to js build working nicely [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- feat: scripts is dead, long live scripts! WIP! [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))

#### 🐛 Bug Fix

- fix: hack the package.json versions to be correct [#88](https://github.com/tablecheck/tablecheck-react-system/pull/88) ([@SimeonC](https://github.com/SimeonC))

#### ⚠️ Pushed to `main`

- fix: mangle once more… ([@SimeonC](https://github.com/SimeonC))
- fix: mangle package versions again ([@SimeonC](https://github.com/SimeonC))
- fix: refactor around package names to reset some versions ([@SimeonC](https://github.com/SimeonC))
- fix: release publish fix ([@SimeonC](https://github.com/SimeonC))
- chore: hack versions due to bad release ([@SimeonC](https://github.com/SimeonC))

#### Authors: 1

- Simeon Cheeseman ([@SimeonC](https://github.com/SimeonC))
