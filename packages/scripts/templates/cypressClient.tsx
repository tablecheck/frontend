import * as React from 'react';
import { render } from 'react-dom';

const importPromise = window.Cypress
  ? import('./CypressApp').then((exports) => exports.CypressApp)
  : import('./StandaloneApp').then((exports) => exports.StandaloneApp);

// eslint-disable-next-line @typescript-eslint/naming-convention
importPromise.then((App: React.FunctionComponent) => {
  render(<App />, document.getElementById('root'));
});

if (module.hot) {
  module.hot.accept();
}
