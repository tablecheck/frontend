import React from 'react';
import express, { Request, Response, NextFunction } from 'express';
import { renderToString } from 'react-dom/server';

import { App } from './App';

// eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
const assets = require(process.env.RAZZLE_ASSETS_MANIFEST as string);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const renderApp = (req: Request, res: Response): { html: string } => {
  const markup = renderToString(<App />);

  const html =
    // prettier-ignore
    `<!doctype html>
  <html lang="">
  <head>
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta charSet='utf-8' />
    <link rel="icon" href="https://cdn3.tablecheck.com/common/images/favicons/tc/v1.1.0/favicon.ico" />
    <link
      rel="apple-touch-icon"
      sizes="180x180"
      href="https://cdn3.tablecheck.com/common/images/favicons/tc/v1.1.0/apple-touch-icon.png"
    />
    <link
      rel="icon"
      type="image/png"
      sizes="32x32"
      href="https://cdn3.tablecheck.com/common/images/favicons/tc/v1.1.0/favicon-32x32.png"
    />
    <link
      rel="icon"
      type="image/png"
      sizes="16x16"
      href="https://cdn3.tablecheck.com/common/images/favicons/tc/v1.1.0/favicon-16x16.png"
    />
    <link
      rel="manifest"
      href="/site.webmanifest"
    />
    <link
      rel="mask-icon"
      href="https://cdn3.tablecheck.com/common/images/favicons/tc/v1.1.0/safari-pinned-tab.svg"
      color="#7935d2"
    />
    <meta name="msapplication-TileColor" content="#7935d2" />
    <meta name="theme-color" content="#7935D2" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
      <title>TableCheck</title>
      ${
      assets.client.css
        ? `<link rel="stylesheet" href="${assets.client.css}">`
        : ''
    }
  </head>
  <body>
      <div id="root">${markup}</div>
      <script src="${assets.client.js}" defer crossorigin></script>
  </body>
</html>`;

  return { html };
};

// the static files are fingerprinted, we can have a long max age
const maxAge = 31536000; // 1 year in seconds

const setHeaders = (res: express.Response, filePath: string): void => {
  // should only apply maxAge to assets in the static folder
  if (filePath.indexOf('/static/') > -1) {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  }
  if (
    filePath.indexOf('/static/media/fonts/') > -1 ||
    filePath.indexOf('/locales/') > -1
  ) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
};

const server = express();

server
  .disable('x-powered-by')
  .use((req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('Strict-Transport-Security', 'max-age=31449600');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1');
    next();
  })
  .use(
    express.static(process.env.RAZZLE_PUBLIC_DIR as string, {
      setHeaders
    })
  )
  .get('/*', (req: Request, res: Response): void => {
    const { html } = renderApp(req, res);
    res.send(html);
  });

// eslint-disable-next-line import/no-default-export
export default server;
