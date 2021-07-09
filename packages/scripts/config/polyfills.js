require('react-app-polyfill/ie11');

if (process.env.NODE_ENV === 'test') {
  require('raf').polyfill(global);
}
