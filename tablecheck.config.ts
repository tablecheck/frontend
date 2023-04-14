import { buildUserConfig } from './packages/utils';

export default buildUserConfig({
  typescript: 'manual',
  quality: {
    projectType: 'cli',
    folderOverrides: {
      typescript: ['src', 'tsconfig'],
      quality: ['src', 'templates', 'formatters'],
      'eslint-config': ['overrides', 'rules'],
      codemods: ['bin', 'scripts', 'utils'],
    },
  },
});