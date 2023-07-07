module.exports = {
  stories: [
    '../README.stories.mdx',
    '../packages/*/*.stories.mdx',
    '../packages/*/scripts/*.stories.mdx',
  ],
  addons: [
    '@storybook/addon-links',
    {
      name: '@storybook/addon-essentials',
      options: {
        backgrounds: false,
        actions: false,
        controls: false,
        viewport: false,
        toolbars: false,
      },
    },
  ],
};
