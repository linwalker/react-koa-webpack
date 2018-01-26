const Koa = require('koa');
const ServeStatic = require('koa-static');
const webpack = require('webpack');
const devMiddleware = require('koa-webpack-middleware').devMiddleware;
const hotMiddleware = require('koa-webpack-middleware').hotMiddleware;
const config = require('../config/webpack.config.js');

const app = new Koa();
config.entry.unshift('webpack-hot-middleware/client?reload=true&timeout=20000');
const compile = webpack(config);
app.use(devMiddleware(compile, {
  // display no info to console (only warnings and errors)
  noInfo: false,
  // display nothing to the console
  quiet: false,
  // switch into lazy mode
  // that means no watching, but recompilation on every request
  // true 的话每个请求都要重新打包，而且OpenBrowserPlugin无效
  lazy: false,
  // watch options (only lazy: false)
  watchOptions: {
      aggregateTimeout: 300,
      poll: true
  },
  // public path to bind the middleware to
  // use the same as in webpack
  publicPath: config.output.publicPath,
  // custom headers
  headers: { "X-Custom-Header": "yes" },
  // options for formating the statistics
  stats: {
      colors: true
  }
}))
app.use(hotMiddleware(compile, {
// log: console.log,
// path: '/__webpack_hmr',
// heartbeat: 10 * 1000
}))
app.use(ServeStatic('../client/dist'));
// Serve the files on port 3000.
app.listen(3030, function () {
  console.log('Example app listening on port 3030!\n');
});