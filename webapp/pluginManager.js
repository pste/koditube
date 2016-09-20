var fs = require('fs');

exports.load = function(app) {
  return new Promise(function (resolve, reject) {
    fs.readdir('plugins', (err, files) => {
      if (err) reject(err);
      else {
        for (i in files) {
          var plugin = files[i];
          
          // init plugin routes
          var pluginPath = './plugins/' + plugin + '/router';
          var pluginRouter = require(pluginPath);
          if (pluginRouter && pluginRouter.init) pluginRouter.init(app);
          console.log('plugins ' + plugin + ' loaded ...');
        }
        resolve(files);
      }
    })
  })
}
