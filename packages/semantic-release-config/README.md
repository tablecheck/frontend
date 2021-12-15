# `@tablecheck/semantic-release-config`

A [semantic-release](https://semantic-release.gitbook.io/semantic-release/) config, used with our commitlint settings and does the following steps.

1. Increments the version according to conventional-commits.
2. Publishes a "GitHub Release" with correctly linked JIRA tickets.
3. Publishes a message to a slack webhook.
4. Outputs the new version to `version.txt` for ease of use in other reports.

## Required CI Variables

| Variable      | Usage                                                                   | Where to get it from                                                                                                                                      |
| ------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GITHUB_TOKEN  | API Token Used for parsing previous releases and publishing the new one | Available in semaphoreci `github-releases` secret or see https://github.com/semantic-release/github#github-authentication                                 |
| SLACK_WEBHOOK | Used for posting slack updates                                          | Go to the `Semantic Release` App and generate a new webhook for the channel you wish to post to. https://api.slack.com/apps/A021U4J1CQ4/incoming-webhooks |

## Usage

Setup the configuration file of semantic-release as follows. For more details on configuration see [here (link)](https://semantic-release.gitbook.io/semantic-release/usage/configuration).

To run a release, simply run `npx semantic-release` (`semantic-release` is a required peer-dependency)

```
// release.config.js
module.exports = {
  extends: '@tablecheck/semantic-release-config'
};
```
