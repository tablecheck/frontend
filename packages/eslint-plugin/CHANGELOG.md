# v6.1.0 (Thu Nov 02 2023)

#### 🚀 Enhancement

- docs: add docs for eslint-plugin [#93](https://github.com/tablecheck/frontend/pull/93) ([@SimeonC](https://github.com/SimeonC))
- fix: shortest import should prefer alias with `~` at the start [#93](https://github.com/tablecheck/frontend/pull/93) ([@SimeonC](https://github.com/SimeonC))

#### Authors: 1

- Simeon Cheeseman ([@SimeonC](https://github.com/SimeonC))

---

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [6.0.1](https://github.com/tablecheck/frontend/compare/@tablecheck/eslint-plugin@6.0.0...@tablecheck/eslint-plugin@6.0.1) (2023-10-26)


### Bug Fixes

* eslint rules around imports ([22b4e2a](https://github.com/tablecheck/frontend/commit/22b4e2ae1a40928545e914f8dbba99b268ffe6a1))





# [6.0.0](https://github.com/tablecheck/frontend/compare/@tablecheck/eslint-plugin@1.2.2...@tablecheck/eslint-plugin@6.0.0) (2023-10-11)


### Bug Fixes

* assorted bugfixes and rule tweaks ([5382129](https://github.com/tablecheck/frontend/commit/5382129275d2ed5d6c619ab1863fc2b8316e3b97))
* audit works and passes ([7332c20](https://github.com/tablecheck/frontend/commit/7332c2004082c17c20bd39fb3813d32a37af83d6))
* bump package versions in deps ([3e7a058](https://github.com/tablecheck/frontend/commit/3e7a0584f2a4e984a47c0d2431a2f6c532c6f794))
* bump packages and deps ([8f7d3ea](https://github.com/tablecheck/frontend/commit/8f7d3eade57beb24affa283690e907251a2345c1))
* downgrade prettier to v2 ([2afd53e](https://github.com/tablecheck/frontend/commit/2afd53e06da958e7211daf14bf24a0053ab55dba))
* eslint needs extra configs to resolve paths correctly ([253bb03](https://github.com/tablecheck/frontend/commit/253bb035111fe5031b621c7cf651ca99ffb68a15))
* hack the package.json versions to be correct ([1b858ea](https://github.com/tablecheck/frontend/commit/1b858eab9ba0de977087116603e4c1890b6d2afe))
* import esm/cjs bugs ([211bf95](https://github.com/tablecheck/frontend/commit/211bf95c64851427f47c33767194278f8f57d7a6))
* install from public npm and remove dist files ([034765e](https://github.com/tablecheck/frontend/commit/034765e7128a1e9e6fe5970d7dac57c207d0a221))
* mangle once more… ([2a269ac](https://github.com/tablecheck/frontend/commit/2a269ac580d662e0f63b9a90e2df96bc67dcd52c))
* mangle package versions again ([4513326](https://github.com/tablecheck/frontend/commit/4513326b88ed15769a35790ba0b6fea9af3648a7))
* prettier works with v2/v3 though v3 is preferred ([089c36b](https://github.com/tablecheck/frontend/commit/089c36b1fbbfd4583ed58f6a9570ecc980139abc))
* refactor around package names to reset some versions ([c6486be](https://github.com/tablecheck/frontend/commit/c6486be9e6e0f6ff2c79c48be484f99417db39b4))
* release publish fix ([f9e55e9](https://github.com/tablecheck/frontend/commit/f9e55e9cf3651cad4fd1d79d18735b9cea70396b))
* remove audit project and correct paths for nx schemas ([de3582f](https://github.com/tablecheck/frontend/commit/de3582f500210a398df306866072c66e89ea9668))
* shortest import path resolution ([dd9fe0b](https://github.com/tablecheck/frontend/commit/dd9fe0b1bd90611483ad33a6a254f925deb023ae))
* shortest-import rule failed with .env file ([580a1a8](https://github.com/tablecheck/frontend/commit/580a1a8620ba6365a126a433a7809eada56c4074))


### Features

* add prettier config file and bump prettier version ([7add52b](https://github.com/tablecheck/frontend/commit/7add52bfa6ffdaa065df490c8320f8025579a0d6))
* add shortest import eslint rule ([b08e2a3](https://github.com/tablecheck/frontend/commit/b08e2a370b162a85e28a3340c1cfaac289b5b8f7))
* add stylelint ([c09ff1a](https://github.com/tablecheck/frontend/commit/c09ff1a07bda4d410ec2859be8d2a8ebc2fd80ae))
* build runs and quality packages function ([694d732](https://github.com/tablecheck/frontend/commit/694d7327828f54794a5f4d9f6b56c116adb967d2))
* bump prettier and add lib publishing checks ([a81ed57](https://github.com/tablecheck/frontend/commit/a81ed574359fa226ca13f824a0c46cb94e524b69))
* full build and passing lint via nx!! ([8eb98c5](https://github.com/tablecheck/frontend/commit/8eb98c51c72335db82550536acb35881958eea8c))
* major upgrade ([265f2ff](https://github.com/tablecheck/frontend/commit/265f2ffe33dd2afbd7c41ec261558a405a6eb67f))
* move everything except quality ([a1e643e](https://github.com/tablecheck/frontend/commit/a1e643eb8f2299623d070b56fc85e982dd088655))
* scripts is dead, long live scripts! WIP! ([b248650](https://github.com/tablecheck/frontend/commit/b2486506f43f40ed98a602e309fe3b58dcb845d5))
* upgrade eslint dependencies ([e60604b](https://github.com/tablecheck/frontend/commit/e60604bcf9e5389f51cbe0b828d95198ab78931a))


### BREAKING CHANGES

* scripts package removed





## [1.2.2](https://github.com/tablecheck/frontend/compare/@tablecheck/eslint-plugin@1.2.1...@tablecheck/eslint-plugin@1.2.2) (2022-07-29)


### Bug Fixes

* **scripts:** github actions runner doesn’t correctly set systemDir ([1c55a8a](https://github.com/tablecheck/frontend/commit/1c55a8aa1a6a2e241746b8ba79fc7b8b10521a29))





## [1.2.1](https://github.com/tablecheck/frontend/compare/@tablecheck/eslint-plugin@1.2.0...@tablecheck/eslint-plugin@1.2.1) (2022-03-29)


### Bug Fixes

* **eslint-plugin:** correctly handle jsx fragments ([2b8205c](https://github.com/tablecheck/frontend/commit/2b8205c25e323cdbf7f4c7e5e86f5b5280100a80)), closes [#49](https://github.com/tablecheck/frontend/issues/49)





# [1.2.0](https://github.com/tablecheck/frontend/compare/@tablecheck/eslint-plugin@1.1.1...@tablecheck/eslint-plugin@1.2.0) (2022-03-24)


### Features

* upgrade all dependencies and add new consistent react import rule ([5e6c277](https://github.com/tablecheck/frontend/commit/5e6c277cc49fe7bb95aa266dc06894afa2e53d58))





## [1.1.1](https://github.com/tablecheck/frontend/compare/@tablecheck/eslint-plugin@1.1.0...@tablecheck/eslint-plugin@1.1.1) (2021-07-15)

**Note:** Version bump only for package @tablecheck/eslint-plugin





# [1.1.0](https://github.com/tablecheck/frontend/compare/@tablecheck/eslint-plugin@1.0.0...@tablecheck/eslint-plugin@1.1.0) (2021-07-15)


### Features

* **eslint-plugin:** add rule for limiting mixed css and jsx files ([e7acfb0](https://github.com/tablecheck/frontend/commit/e7acfb0e46b0d78211547be0282cedc679a31500))





# 1.0.0 (2021-07-13)


### Features

* migrate from gitlab to github ([9a6f3f6](https://github.com/tablecheck/frontend/commit/9a6f3f6cd0c1b6f6eb1bce216aa0d3e66dede442))


### BREAKING CHANGES

* migrated repo, now will use NPM





# v1.0.0 (Tue Jul 13 2021)

#### 💥 Breaking Change

- feat: migrate from gitlab to github [#1](https://github.com/tablecheck/frontend/pull/1) (simeon@tablecheck.com)

#### Authors: 1

- Simeon Cheeseman (simeon@tablecheck.com)
