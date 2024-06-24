# v7.0.0 (Mon Jun 24 2024)

#### 💥 Breaking Change

- fix: upgrade dependencies [#110](https://github.com/tablecheck/frontend/pull/110) ([@SimeonC](https://github.com/SimeonC))

#### Authors: 1

- Simeon Cheeseman ([@SimeonC](https://github.com/SimeonC))

---

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [6.2.0](https://github.com/tablecheck/frontend/compare/@tablecheck/nx@6.1.4...@tablecheck/nx@6.2.0) (2024-02-06)


### Bug Fixes

* correctly define quality:format so it can be cached ([791d58f](https://github.com/tablecheck/frontend/commit/791d58fac0bf61416a90e90c0fef1308db7fdbfd))





## [6.1.4](https://github.com/tablecheck/frontend/compare/@tablecheck/nx@6.1.3...@tablecheck/nx@6.1.4) (2024-01-11)


### Bug Fixes

* **nx:** eslint config generation should use relative paths ([b7f14a4](https://github.com/tablecheck/frontend/commit/b7f14a4085bdd78f6b8dd5e0c326ae8f02a6e640))





## [6.1.3](https://github.com/tablecheck/frontend/compare/@tablecheck/nx@6.1.2...@tablecheck/nx@6.1.3) (2023-12-15)


### Bug Fixes

* **nx:** generators correctly respect “dry-run” ([115e91e](https://github.com/tablecheck/frontend/commit/115e91e997a420cf4ed08bf901cdbf3099706943))
* **nx:** quality generator should use more generic tsconfig definition ([8f9c849](https://github.com/tablecheck/frontend/commit/8f9c849162d2855ee31e25b3bb684c3305d980b7))





## [6.1.2](https://github.com/tablecheck/frontend/compare/@tablecheck/nx@6.1.1...@tablecheck/nx@6.1.2) (2023-11-20)


### Bug Fixes

* eslint configs/presets and setup ([d9ef4a1](https://github.com/tablecheck/frontend/commit/d9ef4a12e928eb8cfe67196eb282f9137b9ab3a1))





## [6.1.1](https://github.com/tablecheck/frontend/compare/@tablecheck/nx@6.1.0...@tablecheck/nx@6.1.1) (2023-11-15)


### Bug Fixes

* loosen eslint-config dependency version ([5f91c78](https://github.com/tablecheck/frontend/commit/5f91c783bfaa31d2888b41a7e03a509b758fcb41))





# [6.1.0](https://github.com/tablecheck/frontend/compare/@tablecheck/nx@6.0.1...@tablecheck/nx@6.1.0) (2023-11-02)


### Bug Fixes

* drop the migration script that never worked anyway ([865a151](https://github.com/tablecheck/frontend/commit/865a151082120593a68e1f498ec65aa506ee48ec))


### Features

* add a wrapper around @nx/js generator ([979ce0e](https://github.com/tablecheck/frontend/commit/979ce0edf4db1de667027ff579159286ed15a2ac))
* add more eslint config presets ([c29dba9](https://github.com/tablecheck/frontend/commit/c29dba9916c407ee372f93f171b335ce44f7308f))





## [6.0.1](https://github.com/tablecheck/frontend/compare/@tablecheck/nx@6.0.0...@tablecheck/nx@6.0.1) (2023-10-26)


### Bug Fixes

* eslint rules around imports ([22b4e2a](https://github.com/tablecheck/frontend/commit/22b4e2ae1a40928545e914f8dbba99b268ffe6a1))





# 6.0.0 (2023-10-11)


### Bug Fixes

* add nx meta files to bundle for detection ([8d29608](https://github.com/tablecheck/tablecheck-react-system/commit/8d29608b7e17aa492ffba51f82723f41449f086c))
* assorted bugfixes and rule tweaks ([5382129](https://github.com/tablecheck/tablecheck-react-system/commit/5382129275d2ed5d6c619ab1863fc2b8316e3b97))
* audit works and passes ([7332c20](https://github.com/tablecheck/tablecheck-react-system/commit/7332c2004082c17c20bd39fb3813d32a37af83d6))
* bump package versions in deps ([3e7a058](https://github.com/tablecheck/tablecheck-react-system/commit/3e7a0584f2a4e984a47c0d2431a2f6c532c6f794))
* bump packages and deps ([8f7d3ea](https://github.com/tablecheck/tablecheck-react-system/commit/8f7d3eade57beb24affa283690e907251a2345c1))
* downgrade prettier to v2 ([2afd53e](https://github.com/tablecheck/tablecheck-react-system/commit/2afd53e06da958e7211daf14bf24a0053ab55dba))
* eslint needs extra configs to resolve paths correctly ([253bb03](https://github.com/tablecheck/tablecheck-react-system/commit/253bb035111fe5031b621c7cf651ca99ffb68a15))
* esm/cjs interop fixes ([3819043](https://github.com/tablecheck/tablecheck-react-system/commit/38190433943af513b77f5224d8d18a2e4cc74b00))
* hack the package.json versions to be correct ([1b858ea](https://github.com/tablecheck/tablecheck-react-system/commit/1b858eab9ba0de977087116603e4c1890b6d2afe))
* install from public npm and remove dist files ([034765e](https://github.com/tablecheck/tablecheck-react-system/commit/034765e7128a1e9e6fe5970d7dac57c207d0a221))
* mangle once more… ([2a269ac](https://github.com/tablecheck/tablecheck-react-system/commit/2a269ac580d662e0f63b9a90e2df96bc67dcd52c))
* mangle package versions again ([4513326](https://github.com/tablecheck/tablecheck-react-system/commit/4513326b88ed15769a35790ba0b6fea9af3648a7))
* migrate script updates and remove dead packages ([df8be2f](https://github.com/tablecheck/tablecheck-react-system/commit/df8be2fb6b4e4bf0eac7a0adc7a3343915c35189))
* nx quality scripts and prettier fixes ([519e6fb](https://github.com/tablecheck/tablecheck-react-system/commit/519e6fb1d857b8a8dca128c26668f5e6a661c254))
* nx requires commonjs or weird node memory errors occur ([8085395](https://github.com/tablecheck/tablecheck-react-system/commit/808539508a5b80b7e247dfd58504470cbf221a2d))
* **nx:** quality executor should run prettier from root cwd to correctly resolve configs and ignores ([cd50a5d](https://github.com/tablecheck/tablecheck-react-system/commit/cd50a5d1480cdd50c996a85064e5a516a14a8479))
* **nx:** quality script should run correctly ([2d777db](https://github.com/tablecheck/tablecheck-react-system/commit/2d777db9fb0bd5c4f4d83bbacfaaa611861dd2d2))
* pre-commit scripts and apply formatting ([f7cbd53](https://github.com/tablecheck/tablecheck-react-system/commit/f7cbd53a71e3c59ad13268ec925ed269b2a7ff02))
* prettier works with v2/v3 though v3 is preferred ([089c36b](https://github.com/tablecheck/tablecheck-react-system/commit/089c36b1fbbfd4583ed58f6a9570ecc980139abc))
* quality generator and migration include file-types ([461de28](https://github.com/tablecheck/tablecheck-react-system/commit/461de282474f56aba795a5ff2af8272f472f56c4))
* quality generator bugfixes ([3424468](https://github.com/tablecheck/tablecheck-react-system/commit/34244680c8118b3bcb24087a346960c7af8d6fb9))
* quality generator fixes and cleanups ([5c3b461](https://github.com/tablecheck/tablecheck-react-system/commit/5c3b4612ec4ff765f160b8773940dd604cfbb086))
* refactor around package names to reset some versions ([c6486be](https://github.com/tablecheck/tablecheck-react-system/commit/c6486be9e6e0f6ff2c79c48be484f99417db39b4))
* release publish fix ([f9e55e9](https://github.com/tablecheck/tablecheck-react-system/commit/f9e55e9cf3651cad4fd1d79d18735b9cea70396b))
* remove audit project and correct paths for nx schemas ([de3582f](https://github.com/tablecheck/tablecheck-react-system/commit/de3582f500210a398df306866072c66e89ea9668))
* shortest-import rule failed with .env file ([580a1a8](https://github.com/tablecheck/tablecheck-react-system/commit/580a1a8620ba6365a126a433a7809eada56c4074))


### Features

* add prettier config file and bump prettier version ([7add52b](https://github.com/tablecheck/tablecheck-react-system/commit/7add52bfa6ffdaa065df490c8320f8025579a0d6))
* add stylelint ([c09ff1a](https://github.com/tablecheck/tablecheck-react-system/commit/c09ff1a07bda4d410ec2859be8d2a8ebc2fd80ae))
* build runs and quality packages function ([694d732](https://github.com/tablecheck/tablecheck-react-system/commit/694d7327828f54794a5f4d9f6b56c116adb967d2))
* bump prettier and add lib publishing checks ([a81ed57](https://github.com/tablecheck/tablecheck-react-system/commit/a81ed574359fa226ca13f824a0c46cb94e524b69))
* full build and passing lint via nx!! ([8eb98c5](https://github.com/tablecheck/tablecheck-react-system/commit/8eb98c51c72335db82550536acb35881958eea8c))
* move everything except quality ([a1e643e](https://github.com/tablecheck/tablecheck-react-system/commit/a1e643eb8f2299623d070b56fc85e982dd088655))
* remove library build (use nx rollup) fixes for monorepo ([3a9d9a6](https://github.com/tablecheck/tablecheck-react-system/commit/3a9d9a625ae903dbb6e023cf8301251c433491c7))
* remove stylelint and fix lint/ts issues ([45d668a](https://github.com/tablecheck/tablecheck-react-system/commit/45d668a3cd220a5d112f1a3fcef8c2a0ee100933))
* scripts is dead, long live scripts! WIP! ([b248650](https://github.com/tablecheck/tablecheck-react-system/commit/b2486506f43f40ed98a602e309fe3b58dcb845d5))
* upgrade eslint dependencies ([e60604b](https://github.com/tablecheck/tablecheck-react-system/commit/e60604bcf9e5389f51cbe0b828d95198ab78931a))


### BREAKING CHANGES

* scripts package removed





# v6.0.0 (Wed Oct 11 2023)

#### 💥 Breaking Change

- ci: fix builds with tsconfig dancing [#87](https://github.com/tablecheck/tablecheck-react-system/pull/87) ([@SimeonC](https://github.com/SimeonC))
- ci: fix release by upgrading dependencies [#87](https://github.com/tablecheck/tablecheck-react-system/pull/87) ([@SimeonC](https://github.com/SimeonC))
- fix: eslint needs extra configs to resolve paths correctly [#86](https://github.com/tablecheck/tablecheck-react-system/pull/86) ([@SimeonC](https://github.com/SimeonC))
- fix: quality generator fixes and cleanups [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: prettier works with v2/v3 though v3 is preferred [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- feat: remove library build (use nx rollup) fixes for monorepo [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix(nx): quality executor should run prettier from root cwd to correctly resolve configs and ignores [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- feat: bump prettier and add lib publishing checks [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: assorted bugfixes and rule tweaks [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- feat: upgrade eslint dependencies [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: quality generator bugfixes [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix(nx): quality script should run correctly [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: bump packages and deps [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: quality generator and migration include file-types [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: nx quality scripts and prettier fixes [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: downgrade prettier to v2 [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: remove audit project and correct paths for nx schemas [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: esm/cjs interop fixes [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: nx requires commonjs or weird node memory errors occur [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: bump package versions in deps [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: migrate script updates and remove dead packages [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: add nx meta files to bundle for detection [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- ci: fix github release action [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- feat: add prettier config file and bump prettier version [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: install from public npm and remove dist files [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: audit works and passes [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- fix: pre-commit scripts and apply formatting [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- feat: full build and passing lint via nx!! [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- feat: remove stylelint and fix lint/ts issues [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- feat: add stylelint [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- feat: build runs and quality packages function [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- feat: move everything except quality [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))
- feat: scripts is dead, long live scripts! WIP! [#83](https://github.com/tablecheck/tablecheck-react-system/pull/83) ([@SimeonC](https://github.com/SimeonC))

#### 🐛 Bug Fix

- fix: hack the package.json versions to be correct [#88](https://github.com/tablecheck/tablecheck-react-system/pull/88) ([@SimeonC](https://github.com/SimeonC))
- fix: shortest-import rule failed with .env file [#88](https://github.com/tablecheck/tablecheck-react-system/pull/88) ([@SimeonC](https://github.com/SimeonC))

#### ⚠️ Pushed to `main`

- fix: mangle once more… ([@SimeonC](https://github.com/SimeonC))
- fix: mangle package versions again ([@SimeonC](https://github.com/SimeonC))
- fix: refactor around package names to reset some versions ([@SimeonC](https://github.com/SimeonC))
- fix: release publish fix ([@SimeonC](https://github.com/SimeonC))
- chore: hack versions due to bad release ([@SimeonC](https://github.com/SimeonC))

#### Authors: 1

- Simeon Cheeseman ([@SimeonC](https://github.com/SimeonC))
