/* eslint-disable no-console */
import express from 'express';

// eslint-disable-next-line @typescript-eslint/no-var-requires
let app = require('./server').default;

if (module.hot) {
  module.hot.accept('./server', () => {
    console.log('🔁  HMR Reloading `./server`...');
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
      app = require('./server').default;
    } catch (error) {
      console.error(error);
    }
  });
  console.info('✅  Server-side HMR Enabled!');
}

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// eslint-disable-next-line import/no-default-export
export default express()
  .use((req, res) => app.handle(req, res))
  .listen(port, () => {
    console.log(`> App started http://localhost:${port}`);
  });
/* eslint-enable no-console */
