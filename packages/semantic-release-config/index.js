module.exports = {
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'main', // modified to follow the github new standard of "main" rather than "master"
    'next',
    'next-major',
    { name: 'beta', prerelease: true },
    { name: 'alpha', prerelease: true },
  ],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        releaseRules: [
          { type: 'docs', release: 'patch' },
          { type: 'refactor', release: 'patch' },
          { type: 'ci', release: 'patch' },
        ],
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        parserOpts: {
          issuePrefixes: ['[A-Z]+-(?=[0-9]+)'],
          referenceActions: [
            'close',
            'closes',
            'closed',
            'fix',
            'fixes',
            'fixed',
            'resolve',
            'resolves',
            'resolved',
            'complete',
            'completes',
          ],
        },
        writerOpts: {
          types: [
            { type: 'feat', section: 'Features' },
            { type: 'feature', section: 'Features' },
            { type: 'fix', section: 'Bug Fixes' },
            { type: 'perf', section: 'Performance Improvements' },
            { type: 'revert', section: 'Reverts' },
            { type: 'docs', section: 'Documentation' },
            { type: 'chore', section: 'Miscellaneous Chores', hidden: true },
            { type: 'refactor', section: 'Code Refactoring' },
            { type: 'test', section: 'Tests', hidden: true },
            { type: 'build', section: 'Build System' },
            { type: 'ci', section: 'Continuous Integration' },
          ],
          commitPartial: `* {{header}}

{{~!-- commit link --}} {{#if @root.linkReferences~}}
  ([commit](
  {{~#if @root.repository}}
    {{~#if @root.host}}
      {{~@root.host}}/
    {{~/if}}
    {{~#if @root.owner}}
      {{~@root.owner}}/
    {{~/if}}
    {{~@root.repository}}
  {{~else}}
    {{~@root.repoUrl}}
  {{~/if}}/
  {{~@root.commit}}/{{hash}}))
{{~else}}
  {{~hash}}
{{~/if}}

{{~!-- commit references --}}
{{~#if references~}}
  {{~#each references~}}
    , {{#if this.action~}}
      {{this.action}}
    {{~else~}}
      References
    {{~/if}} {{#if @root.linkReferences~}}
      [{{this.prefix}}{{this.issue}}](https://tablecheck.atlassian.net/browse/{{this.prefix}}{{this.issue}})
    {{~else~}}
      {{this.prefix}}{{this.issue}}
    {{~/if~}}
  {{~/each~}}
{{~/if}}

`,
        },
      },
    ],
    '@semantic-release/github',
    [
      'semantic-release-slack-bot',
      // make sure that SLACK_WEBHOOK env var is set in CI config
      {
        notifyOnSuccess: true,
        notifyOnFail: false,
        markdownReleaseNotes: true,
      },
    ],
    [
      '@semantic-release/exec',
      {
        successCmd:
          // eslint-disable-next-line no-template-curly-in-string
          'echo "${nextRelease.name}" > version.txt',
      },
    ],
  ],
};
