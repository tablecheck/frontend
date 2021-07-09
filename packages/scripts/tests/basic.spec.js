describe('run a basic test', () => {
  test('should execute a jest test and setup correctly', () => {
    expect(true).toBe(true);
  });

  test('should correctly build CONFIG global', () => {
    // eslint-disable-next-line no-undef
    expect(CONFIG).toBeDefined();
  });
});
