This package is our standard rules for eslint in the form of a eslint preset package.

Recommended usage is;

`.eslintrc.js`

```js static
module.exports = {
  extends: ['@tablecheck/eslint-config'],
};
```

```shell static
eslint --cache --ext .js,.jsx,.ts,.tsx --format=pretty ./
```
