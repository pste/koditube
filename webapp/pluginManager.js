var fs = require('fs');

function tryToLoad(plugin, app) {
  // init plugin routes
  var pluginPath = './plugins/' + plugin + '/router.js';
  fs.stat(pluginPath, (err, stats) => {
    if (err) {
      console.log('PluginManager ERROR','Router *' + plugin + '* NOT found (skipped ...)');
      console.log('PluginManager ERROR', err.message);
    }
    else {
      var pluginRouter = require(pluginPath);
      if (pluginRouter && pluginRouter.init) pluginRouter.init(app);
      console.log('PluginManager', '*' + plugin + '* found and loaded.');
    }
  });
}

exports.load = function(app) {
  return new Promise(function (resolve, reject) {
    fs.readdir('plugins', (err, files) => {
      if (err) reject(err);
      else {
        for (i in files) {
          tryToLoad(files[i], app)
        }
        resolve(files);
      }
    })
  })
}
