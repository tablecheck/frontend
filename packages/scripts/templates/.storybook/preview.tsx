export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' }
};

export const decorators = [
  (Story: any) => (
    // TODO add any decorators like ThemeProviders here
    <Story />
  )
];
