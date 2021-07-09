const addComment = require('../utils/addComment');
const constToEnum = require('../utils/constToEnum');
const findClosestType = require('../utils/findClosestType');
const getUsages = require('../utils/getUsages');
const mergeImports = require('../utils/mergeImports');
const replaceImports = require('../utils/replaceImports');

function replaceForObjectExpression(j, properties, replacePath, color) {
  for (let i = 0; i < properties.length; i += 1) {
    const property = properties[i];
    if (property.type === 'ObjectProperty' && property.key.name === 'theme') {
      j(replacePath).replaceWith(
        () => j.template.expression`${property.value.name}.colors.${color}`
      );
      return;
    }
    if (property.type === 'SpreadElement') {
      j(replacePath).replaceWith(
        () =>
          j.template.expression`${property.argument.name}.theme.colors.${color}`
      );
      return;
    }
  }
  const shorthandProperty = j.objectProperty(
    j.identifier('theme'),
    j.identifier('theme')
  );
  shorthandProperty.shorthand = true;
  properties.push(shorthandProperty);
  j(replacePath).replaceWith(
    () => j.template.expression`theme.colors.${color}`
  );
}

module.exports = function tablekitTheme10Transform(file, api) {
  const j = api.jscodeshift;

  const root = j(file.source);

  mergeImports(root, api, '@tablekit/theme', [
    '@tablekit/theme/lib/types',
    '@tablekit/theme/types'
  ]);

  const themeImport = root.find(j.ImportDeclaration, {
    source: {
      type: 'StringLiteral',
      value: '@tablekit/theme'
    }
  });

  if (themeImport.length === 0) {
    return file.source;
  }

  const importReplacements = {
    color: null,
    useTypography: 'TYPOGRAPHY',
    SPACING: 'Spacing',
    typography: 'TYPOGRAPHY',
    SizeType: 'Size',
    SIZES: 'Size',
    Z_INDICES: 'ZIndex',
    FIELD_HEIGHTS: 'FieldHeight',
    FONT_WEIGHTS: 'FontWeight',
    LevelType: 'Level'
  };

  const { newImports, currentImports } = replaceImports(
    root,
    api,
    '@tablekit/theme',
    importReplacements
  );

  if (
    newImports.SIZES &&
    newImports.SizeType &&
    newImports.SizeType !== newImports.SIZES
  ) {
    if (newImports.SIZES === importReplacements.SIZES) {
      newImports.SizeType = importReplacements.SIZES;
    } else if (newImports.SizeType === importReplacements.SIZES) {
      newImports.SIZES = importReplacements.SIZES;
    } else {
      newImports.SizeType = newImports.SIZES;
    }
  }

  getUsages(root, api, currentImports.color).forEach((path) => {
    // using color as prop name
    if (
      path.node.type === 'JSXIdentifier' ||
      path.parent.node.type === 'TSPropertySignature'
    )
      return;
    let color = 'UNKNOWN';
    let replaceNode = j(path.parent);
    if (path.parent.value.original.arguments) {
      color = path.parent.value.original.arguments[0].value;
    } else if (path.parent.value.type === 'ObjectProperty') {
      color = path.parent.value.original.value.arguments[0].value;
      // eslint-disable-next-line no-param-reassign
      path.parent.value.value = j.template
        .expression`({ theme }) => theme.colors.${color}`;
      return;
    }

    let callExpressionParent = path.parent.parent;
    if (
      callExpressionParent.node.type !== 'CallExpression' &&
      path.parent.node.type === 'CallExpression'
    ) {
      callExpressionParent = path.parent;
    }
    if (callExpressionParent.node.type === 'CallExpression') {
      const callExpressionArgs = callExpressionParent.node.arguments;
      const isParentReturn = !!findClosestType(path, 'ReturnStatement');
      if (
        callExpressionArgs.length === 1 &&
        callExpressionArgs[0].type === 'Identifier'
      ) {
        const block = j(callExpressionParent.parent).closestScope();
        if (block.size() === 1) {
          let hasReplaced = false;
          block.forEach((scopePath) => {
            const isScopeCallExpression =
              scopePath.value.body.type === 'CallExpression';
            if (
              callExpressionParent.parent.node.type ===
                'AssignmentExpression' ||
              ((isParentReturn || isScopeCallExpression) &&
                (scopePath.node.type === 'ArrowFunctionExpression' ||
                  scopePath.node.type === 'CallExpression'))
            ) {
              j(callExpressionParent).replaceWith(
                `${callExpressionArgs[0].name}.theme.colors.${color}`
              );
              hasReplaced = true;
            }
          });
          if (hasReplaced) return;
        }
        if (
          callExpressionParent.parent.node.type === 'LogicalExpression' ||
          callExpressionParent.parent.node.type === 'ObjectProperty'
        ) {
          replaceNode = j(callExpressionParent);
          replaceNode.replaceWith(
            () => j.template.expression`({ theme }) => theme.colors.${color}`
          );
          return;
        }
        if (callExpressionParent.parent.node.type !== 'TemplateLiteral') {
          replaceNode = j(callExpressionParent.parent);
          replaceNode.replaceWith(
            () => j.template.expression`({ theme }) => theme.colors.${color}`
          );
          return;
        }
      }
      if (
        callExpressionArgs.length === 1 &&
        callExpressionArgs[0].type === 'ObjectExpression'
      ) {
        const { properties } = callExpressionArgs[0];
        replaceForObjectExpression(j, properties, callExpressionParent, color);
        return;
      }
      const closestExpression = findClosestType(
        callExpressionParent,
        'ArrowFunctionExpression',
        'FunctionExpression'
      );
      if (
        closestExpression &&
        callExpressionArgs.length === 1 &&
        callExpressionParent.parent.node.type !== 'CallExpression'
      ) {
        // handle; `border-color: ${({ color }) => color || colorResolver('border')};`
        const { params } = closestExpression.node;
        if (params.length === 1 && params[0].type === 'ObjectPattern') {
          replaceForObjectExpression(
            j,
            params[0].properties,
            callExpressionParent,
            color
          );
          return;
        }
        if (params.length === 1 && params[0].type === 'Identifier') {
          j(callExpressionParent).replaceWith(
            `${params[0].name}.theme.colors.${color}`
          );
          return;
        }
        // this should cause errors to give us a good cleanup marker
        j(callExpressionParent).replaceWith(`theme.colors.${color}`);
        return;
      }

      if (
        callExpressionArgs.length === 0 &&
        callExpressionParent.parent.node.type === 'TemplateLiteral'
      ) {
        // basically this is a common mistake "styled.div`color: ${color('primary')()};`
        replaceNode = j(callExpressionParent);
      }
    }
    replaceNode.replaceWith(
      () => j.template.expression`({ theme }) => theme.colors.${color}`
    );
  });
  getUsages(root, api, currentImports.SPACING).forEach((path) => {
    j(path).replaceWith(j.identifier(newImports.SPACING));
  });
  getUsages(root, api, currentImports.useTypography).forEach((path) => {
    if (
      !path.parent.node.arguments ||
      path.parent.node.arguments.length !== 1 ||
      !path.parent.node.arguments[0].value
    ) {
      return;
    }
    const useTypographyLevel = path.parent.node.arguments[0].value;
    j(path.parent).replaceWith(
      j.identifier(`${newImports.typography}.${useTypographyLevel}`)
    );
  });
  getUsages(root, api, currentImports.typography).forEach((path) => {
    let targetNode = j(path.parent);
    if (path.parent.parent.node.type === 'CallExpression') {
      targetNode = j(path.parent.parent);
    }
    const args = path.parent.value.original.arguments;
    if (args.length === 2 && args[1].type === 'StringLiteral') {
      targetNode.replaceWith(
        j.logicalExpression(
          '||',
          j.memberExpression(
            j.identifier(newImports.typography),
            args[0],
            true
          ),
          j.memberExpression(
            j.identifier(newImports.typography),
            j.identifier(args[1].value)
          )
        )
      );
    } else if (args.length === 1) {
      const typographyLevel = args[0].value;
      targetNode.replaceWith(
        j.identifier(`${newImports.typography}.${typographyLevel}`)
      );
    } else {
      addComment(
        api,
        targetNode,
        'TODO invalid typography usage, replace with TYPOGRAPHY manually'
      );
    }
  });
  getUsages(root, api, currentImports.SizeType).forEach((path) => {
    j(path).replaceWith(j.identifier(newImports.SizeType));
  });
  getUsages(root, api, currentImports.SIZES).forEach((path) => {
    constToEnum(j, path, newImports.SIZES, {
      XSMALL: 'XSmall',
      SMALL: 'Small',
      REGULAR: 'Regular',
      REGULAR2: 'Regular2',
      LARGE: 'Large',
      XLARGE: 'XLarge',
      XXLARGE: 'XXLarge'
    });
  });
  getUsages(root, api, currentImports.Z_INDICES).forEach((path) => {
    constToEnum(j, path, newImports.Z_INDICES, {
      card: 'Card',
      dialog: 'Dialog',
      sidenav: 'Sidenav',
      topnav: 'Topnav',
      layer: 'Layer',
      blanket: 'Blanket',
      modal: 'Modal',
      flag: 'Flag',
      spotlight: 'Spotlight',
      tooltip: 'Tooltip'
    });
  });
  getUsages(root, api, currentImports.FIELD_HEIGHTS).forEach((path) => {
    constToEnum(j, path, newImports.FIELD_HEIGHTS, {
      REGULAR: 'Regular',
      LARGE: 'Large',
      SMALL: 'Small'
    });
  });
  getUsages(root, api, currentImports.FONT_WEIGHTS).forEach((path) => {
    constToEnum(j, path, newImports.FONT_WEIGHTS, {
      EXTRA_LIGHT: 'ExtraLight',
      LIGHT: 'Light',
      REGULAR: 'Regular',
      MEDIUM: 'Medium',
      SEMI_BOLD: 'SemiBold',
      BOLD: 'Bold'
    });
  });

  return root.toSource();
};
