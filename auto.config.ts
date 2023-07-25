import type { IAllContributorsPluginOptions } from '@auto-it/all-contributors';
import type { INpmConfig } from '@auto-it/npm';
import type { ISlackPluginOptions } from '@auto-it/slack';
import type { AutoRc } from 'auto';

export default function rc(): AutoRc {
  return {
    plugins: [
      [
        'npm',
        {
          forcePublish: true,
        } satisfies INpmConfig,
      ],
      [
        'all-contributors',
        {
          types: {
            doc: ['**/*.mdx', '**/*.md'],
            example: ['**/*.stories.*', '**/*.story.*', '**/.storybook/**/*'],
            infra: ['**/.github/**/*'],
            test: ['**/*.test.*', '**/*.spec.*', 'cypress/**/*'],
            code: ['**/src/**/*'],
          },
        } satisfies IAllContributorsPluginOptions,
      ],
      'first-time-contributor',
      'released',
      [
        'slack',
        {
          auth: 'app',
          channels: ['bot-frontend'],
          atTarget: 'frontend-team',
        } satisfies ISlackPluginOptions,
      ],
    ],
  };
}
