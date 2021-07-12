const messageId = 'max-mixed-css';

function checkImport(variables, importName) {
  const importVar = variables.find((v) => v.name === importName);
  if (!importVar) return false;
  const { identifiers } = importVar;
  const declarationVar = identifiers.find(
    (ident) =>
      (ident.parent.type === 'ImportSpecifier' ||
        ident.parent.type === 'ImportDefaultSpecifier') &&
      ident.parent.parent.source.value.match(/^@emotion\//)
  );
  return !!declarationVar;
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensure that files only contain a certain amount of css statements or only css statements',
      category: 'ECMAScript 6',
      recommended: true
    },
    schema: [
      {
        type: 'integer',
        minimum: 0
      }
    ],
    messages: {
      [messageId]:
        'This file has more than {{ lines }} css statements and more than {{ lines }} of JSX function code.'
    }
  },
  create: (context) => {
    const max = context.options[0];
    let cssCount = 0;
    let jsxCount = 0;
    let reportNode;
    const countedJsxNodes = [];

    function getModuleScope() {
      let scope = context.getScope();
      while (scope.type !== 'module' && scope.upper) {
        scope = scope.upper;
      }
      return scope;
    }

    function validImport(node) {
      const { variables } = getModuleScope();
      const { tag } = node.parent;
      if (!tag) return false;
      if (tag.type === 'Identifier') {
        return checkImport(variables, tag.name);
      }
      if (tag.type === 'MemberExpression') {
        return checkImport(variables, tag.object.name);
      }
      if (tag.type === 'CallExpression') {
        return checkImport(variables, tag.callee.name);
      }
      return false;
    }

    function report() {
      let { loc } = reportNode;
      let remainingStatements = cssCount - max;
      for (let q = reportNode.quasis.length - 1; q >= 0; q -= 1) {
        const quasi = reportNode.quasis[q];
        const quasiLines = quasi.value.raw.split('\n');
        for (let l = 0; l < quasiLines.length; l += 1) {
          const statements = quasiLines[l]
            .split(';')
            .filter((s) => !!s.trim()).length;
          if (remainingStatements >= 0) {
            remainingStatements -= statements;
            loc = {
              start: { line: quasi.loc.start.line + l + 1, column: 1 },
              end: { line: quasi.loc.start.line + l + 1 }
            };
          }
        }
      }
      context.report({
        messageId,
        loc,
        node: reportNode,
        data: { lines: max }
      });
    }

    return {
      JSXElement(node) {
        if (jsxCount > max) return;
        let testParent = node;
        while (testParent.parent && testParent.parent.type !== 'Program') {
          if (countedJsxNodes.indexOf(testParent) !== -1) return;
          testParent = testParent.parent;
        }
        const lines = testParent.loc.end.line - testParent.loc.start.line;
        countedJsxNodes.push(node);
        jsxCount += Math.max(lines - 1, 1);
        if (jsxCount > max && reportNode) report();
      },
      TemplateLiteral(node) {
        if (reportNode || !validImport(node)) return;
        const text = node.quasis.reduce(
          (result, quasi) => result + quasi.value.raw,
          ''
        );
        cssCount += text.split(';').length - 1;
        if (cssCount > max) {
          reportNode = node;
        }
      }
    };
  }
};
