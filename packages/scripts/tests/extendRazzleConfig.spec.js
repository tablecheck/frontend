const { extendModify } = require('../razzle/extendConfig');

describe('Razzle extend modify', () => {
  describe('should extend modifyWebpackOptions correctly', () => {
    test('should respect no extend functions', () => {
      const composeFunction = extendModify(
        'modifyWebpackOptions',
        undefined,
        undefined
      );
      const result = composeFunction({
        options: {
          webpackOptions: {
            option1: true
          }
        }
      });
      expect(result).toStrictEqual({ option1: true });
    });

    test('should handle base only', () => {
      const composeFunction = extendModify(
        'modifyWebpackOptions',
        () => ({ option2: true }),
        undefined
      );
      const result = composeFunction({
        options: {
          webpackOptions: {
            option1: true
          }
        }
      });
      expect(result).toStrictEqual({ option2: true });
    });

    test('should handle extend only', () => {
      const composeFunction = extendModify(
        'modifyWebpackOptions',
        undefined,
        () => ({ option2: true })
      );
      const result = composeFunction({
        options: {
          webpackOptions: {
            option1: true
          }
        }
      });
      expect(result).toStrictEqual({ option2: true });
    });

    test('should handle mutation', () => {
      const composeFunction = extendModify(
        'modifyWebpackOptions',
        ({ options: { webpackOptions } }) => {
          webpackOptions.option2 = true;
        },
        ({ options: { webpackOptions } }) => {
          webpackOptions.option3 = true;
        }
      );
      const result = composeFunction({
        options: {
          webpackOptions: {
            option1: true
          }
        }
      });
      expect(result).toStrictEqual({
        option1: true,
        option2: true,
        option3: true
      });
    });

    test('should handle mutate then return new', () => {
      const composeFunction = extendModify(
        'modifyWebpackOptions',
        ({ options: { webpackOptions } }) => {
          webpackOptions.option2 = true;
        },
        () => ({ option3: true })
      );
      const result = composeFunction({
        options: {
          webpackOptions: {
            option1: true
          }
        }
      });
      expect(result).toStrictEqual({
        option3: true
      });
    });

    test('should handle return new then mutate', () => {
      const composeFunction = extendModify(
        'modifyWebpackOptions',
        () => ({ option2: true }),
        ({ options: { webpackOptions } }) => {
          webpackOptions.option3 = true;
        }
      );
      const result = composeFunction({
        options: {
          webpackOptions: {
            option1: true
          }
        }
      });
      expect(result).toStrictEqual({
        option2: true,
        option3: true
      });
    });
  });

  describe('should extend modifyWebpackConfig correctly', () => {
    test('should respect no extend functions', () => {
      const composeFunction = extendModify(
        'modifyWebpackConfig',
        undefined,
        undefined
      );
      const result = composeFunction({
        webpackConfig: {
          option1: true
        }
      });
      expect(result).toStrictEqual({ option1: true });
    });

    test('should handle base only', () => {
      const composeFunction = extendModify(
        'modifyWebpackConfig',
        () => ({ option2: true }),
        undefined
      );
      const result = composeFunction({
        webpackConfig: {
          option1: true
        }
      });
      expect(result).toStrictEqual({ option2: true });
    });

    test('should handle extend only', () => {
      const composeFunction = extendModify(
        'modifyWebpackConfig',
        undefined,
        () => ({ option2: true })
      );
      const result = composeFunction({
        webpackConfig: {
          option1: true
        }
      });
      expect(result).toStrictEqual({ option2: true });
    });

    test('should handle mutation', () => {
      const composeFunction = extendModify(
        'modifyWebpackConfig',
        ({ webpackConfig }) => {
          webpackConfig.option2 = true;
        },
        ({ webpackConfig }) => {
          webpackConfig.option3 = true;
        }
      );
      const result = composeFunction({
        webpackConfig: {
          option1: true
        }
      });
      expect(result).toStrictEqual({
        option1: true,
        option2: true,
        option3: true
      });
    });

    test('should handle mutate then return new', () => {
      const composeFunction = extendModify(
        'modifyWebpackConfig',
        ({ webpackConfig }) => {
          webpackConfig.option2 = true;
        },
        () => ({ option3: true })
      );
      const result = composeFunction({
        webpackConfig: {
          option1: true
        }
      });
      expect(result).toStrictEqual({
        option3: true
      });
    });

    test('should handle return new then mutate', () => {
      const composeFunction = extendModify(
        'modifyWebpackConfig',
        () => ({ option2: true }),
        ({ webpackConfig }) => {
          webpackConfig.option3 = true;
        }
      );
      const result = composeFunction({
        webpackConfig: {
          option1: true
        }
      });
      expect(result).toStrictEqual({
        option2: true,
        option3: true
      });
    });
  });
});
