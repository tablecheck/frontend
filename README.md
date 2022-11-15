# TableCheck React System

For Documentation please see https://tablecheck.github.io/tablecheck-react-system

## Development setup

#### Prerequisites

- Install [nvm](https://github.com/nvm-sh/nvm)

#### Installation

To setup your development environment please run these commands in order. We develop using storybook as our main development environment.

```shell
nvm use
npm ci
npm start
```

#### Setting up VSCode Jest runner

To use this project with the [VSCode Jest Extension](https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest) follow the instructions below.
In your Workspace Settings, setup the folders to be the following;

```json
  "folders": [
    {
      "name": "root",
      "path": "."
    },
    {
      "name": "@tablecheck/scripts",
      "path": "./packages/scripts"
    },
    {
      "name": "@tablecheck/codemods",
      "path": "./packages/codemods"
    },
    {
      "name": "@tablecheck/eslint-plugin",
      "path": "./packages/eslint-plugin"
    }
  ],
```

In each of the `packages/*` folders mentioned above, create a `.vscode/settings.json` file with the following content;

```json
{
  "jest.jestCommandLine": "npm test --"
}
```

At the root of this project add a `.vscode/settings.json` file with the following content to disable the top level test.

```json
{
  "jest.jestCommandLine": "echo ''"
}
```

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/SimeonC"><img src="https://avatars.githubusercontent.com/u/1085899?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Simeon Cheeseman</b></sub></a><br /><a href="https://github.com/tablecheck/@tablecheck/tablecheck-react-system/commits?author=SimeonC" title="Documentation">📖</a> <a href="#infra-SimeonC" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/tablecheck/@tablecheck/tablecheck-react-system/commits?author=SimeonC" title="Tests">⚠️</a> <a href="https://github.com/tablecheck/@tablecheck/tablecheck-react-system/commits?author=SimeonC" title="Code">💻</a> <a href="#example-SimeonC" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/SashaShostyr"><img src="https://avatars.githubusercontent.com/u/19342294?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alex</b></sub></a><br /><a href="https://github.com/tablecheck/@tablecheck/tablecheck-react-system/commits?author=SashaShostyr" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
