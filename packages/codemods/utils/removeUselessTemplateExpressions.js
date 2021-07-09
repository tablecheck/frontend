// adapted from https://github.com/coderaiser/putout/blob/master/packages/plugin-remove-useless-template-expressions/lib/remove-useless-template-expressions.js

function isLiteral(path) {
  const { expressions, type } = path;
  if (type !== 'TemplateLiteral') return false;
  if (!expressions) return true;
  if (!expressions.length) return true;
  for (let i = 0; i < expressions.length; i += 1) {
    if (
      ['Identifier', 'MemberExpression'].indexOf(expressions[i].type) === -1 &&
      !expressions[i].type.match(/Literal/)
    ) {
      return false;
    }
  }
  return true;
}

module.exports = function removeUselessTemplateExpressions(root, api) {
  const j = api.jscodeshift;

  root.find(j.TemplateLiteral).forEach((path) => {
    const expressions = path.get('expressions').value;
    const quasis = path.get('quasis').value;
    if (!expressions) {
      return;
    }
    for (let i = 0; i < expressions.length; i += 1) {
      const exprPath = expressions[i];

      if (isLiteral(exprPath)) {
        const a = quasis[i].value.raw;
        const b = quasis[i + 1].value.raw;

        const [startQuasi] = exprPath.quasis.slice(0, 1);
        const internalQuasis = exprPath.quasis.slice(1, -1);
        const [endQuasi] = exprPath.quasis.slice(-1);
        const newQuasis = [
          j.templateElement(
            {
              raw: `${a}${startQuasi.value.raw}`,
              cooked: ''
            },
            false
          )
        ];
        internalQuasis.forEach((quasi) => {
          newQuasis.push(
            j.templateElement({ raw: quasi.value.raw, cooked: '' }, false)
          );
        });
        newQuasis.push(
          j.templateElement(
            { raw: `${endQuasi.value.raw}${b}`, cooked: '' },
            quasis[i + 1].tail
          )
        );

        quasis.splice(i, 2, ...newQuasis);
        expressions.splice(i, 1, ...exprPath.expressions);
        return;
      }
    }
  });
};
