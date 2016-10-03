var fs = require('fs');
var plugins = [];

function tryToLoad(plugin, app) {
  return new Promise((resolve, reject) => {
    // init plugin routes
    var pluginPath = './plugins/' + plugin + '/router.js';
    fs.stat(pluginPath, (err, stats) => {
      if (err) {
        console.log('PluginManager ERROR','Router *' + plugin + '* NOT found (skipped ...)');
        console.log('PluginManager ERROR', err.message);
        resolve("");
      }
      else {
        var pluginRouter = require(pluginPath);
        if (pluginRouter && pluginRouter.init) pluginRouter.init(app);
        console.log('PluginManager', '*' + plugin + '* found and loaded.');
        resolve(plugin);
      }
    });
  }) // Promise
}

exports.load = function(app) {
  return new Promise(function (resolve, reject) {
    fs.readdir('plugins', (err, files) => {
      if (err) reject(err);
      else {
        var p = [];
        for (i in files) {
          p.push(tryToLoad(files[i], app));
        }
        
        Promise.all(p).then(values => {
          resolve(values.filter(function(n){ return n != "" }));
        });
      }
    })
  }) // Promise
}
