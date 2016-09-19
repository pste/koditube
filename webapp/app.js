var util = require('util');
var fs = require('fs');
var colors = require('colors');
var path = require('path');

var express = require('express');
var request = require('request');
var helmet = require('helmet');
var pluginManager = require('./pluginManager');

//var favicon = require('serve-favicon');
//var cookieParser = require('cookie-parser');
var jade = require('jade');
var bodyParser = require('body-parser');

// nedb datastore:
var Datastore = require('nedb');

//var mold = require('./mold');

/* :: GLOBALS :::::::::::::::::::::::::::::::::::::::::::::: */

var logs = {
  debug: ()=>{}
  , log: console.log.bind(console)
  , error: console.log.bind(console)
}

var db = {
  koditube: null
  //, users: null
};
var app;
var web;

var dbg = (process.argv.indexOf('--debug') >= 0); // node app.js --debug
if (dbg) { // rebind debug function
  logs.debug = console.log.bind(console)
  logs.debug('^^^ DEBUG MODE ON  ...');
}

var plugins = [];

/* :::::::::::::::::::::::::::::::::::::::::::::: */

var port = 80; // node app.js --port 4006
var portidx = process.argv.indexOf('--port') + 1; // 0 is not found
if (portidx > 0 && portidx < process.argv.length)
  port = process.argv[portidx];

app = express();
app.set('port', port);
logs.debug('PARAMETER PORT: ', app.get('port'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(helmet());

if (dbg) {
  app.locals.pretty = true;
}

/* :: ROUTES (VIEWS) :::::::::::::::::::::::::::::::::::::::::::::: */

app.get('/', (req, res) => {
  logs.debug(util.inspect(plugins));
  res.render('main', {items: plugins});
});

app.get('/browse', (req, res) => {
  res.render('browse');
});

/* :: ROUTES (API) :::::::::::::::::::::::::::::::::::::::::::::: */

// loads the main page for the given plugin
app.get('/plugins/:plugin', (req, res) => {
  logs.debug(req.params.plugin);
  var route  = './plugins/' + req.params.plugin + '/router';
  var templatePath = './plugins/' + req.params.plugin + '/template.jade';
  
  fs.readFile(templatePath, 'utf8', (err, data) => {
    if (err) throw err;
    
    // render plugin page
    var jadeFn = jade.compile(data, { filename: templatePath, pretty: true });
    res.send(jadeFn({}));
  });
});

//
/* jsonRPC example (actually unused because of the mini proxy)
app.post('/api/kodi/stream', (req, res) => {
  var title = req.body.title;
  var id = req.body.id;
  var toKODI = {
    "jsonrpc": "2.0",
    "method": "Addons.ExecuteAddon",
    "params":
    {
      "addonid": "plugin.video.koditube",
      "params":
      {
        "url":      'http://localhost:' + server.address().port + '/api/youtube/proxy/' + id // I will proxy the youtube request
        , "title":  title
      }
    },
    "id": 1
  };
  
  logs.debug("id:", id, " title:", title);
  request.post('http://localhost:8088/jsonrpc', toKODI);
  res.end();
});
*/

/* :: ROUTES (LOCAL.DB) :::::::::::::::::::::::::::::::::::::::::::::: */

// list nedb items
app.get('/api/db/list', (req, res) => {
  var flt = {};
  if (req.query.tag && req.query.tag != '' && req.query.tag != '*') flt.tags = { $elemMatch: req.query.tag } // search one tag in an array
  
  db.koditube.find(flt, function (err, docs) {
    if (err) {
      var err = new Error('NEDB error');
      err.status = 404;
      next(err);
    }
    else {
      logs.log("requested list for ", flt);
      res.json(docs);
    }
  });
});

// list tags
app.get('/api/db/tags', (req, res) => {
  db.koditube.find({}, {tags:1, _id:0}, function (err, docs) {
    if (err) throw (err);
    
    var tags = ["*"];
    docs.forEach(function(elem,i) {
      if (elem.tags) elem.tags.forEach(function(o,i) {
        if (tags.indexOf(o) == -1) tags.push(o);
      });
    });
    res.json(tags);
  });
});

// save to nedb
app.post('/api/db/save', (req, res) => {
  var newitem = req.body;
  console.log("UPSERTING", newitem);
  
  db.koditube.findOne({ key: newitem.key }, (err, doc) => {
    if (err) logs.error("°°° NEDB:" + err);
    if (doc === null) db.koditube.insert(newitem);
    else {
      var _tags;
      db.koditube.update(doc, { $addToSet: { tags: { $each: _tags } }, $set: newitem }, { }, (err, numReplaced) => {
        if (err) logs.error("°°° NEDB:" + err);
      });
    }
  });
  res.end();
});

app.post('/api/db/remove', (req, res) => {
  var item = req.body;
  db.koditube.remove({ key: item.key }, { multi: true });
  logs.log("removed item(s) " + item.key + " ...");
});

// :: DB ::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

function initDB() {
  return new Promise((resolve, reject) => {
    db.koditube = new Datastore({ filename: 'koditube.db', autoload: true });
    //db.users = new Datastore({ filename: 'users.db', autoload: true });
    logs.debug("°°° NEDB: ready");
    
    db.koditube.ensureIndex({ fieldName: 'key' }, (err) => {
      if (err) {
        logs.error("°°° NEDB:" + err);
        reject(err);
      }
      logs.debug("°°° NEDB: index built");
      resolve(db);
    });
  });
}

// :: WEB ::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

function raiseServer() {
  return new Promise((resolve, reject) => {
    server = app.listen(app.get('port'), () => {
      logs.log('*** Express server listening on port:' + server.address().port + ' (pid:' + process.pid + ')');
      resolve(server);
    });
  });
}

// :: START ::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //

Promise.resolve(true)
  .then(initDB)
  .then(function() {
    return pluginManager.load(app);
  })
  .then(function(pluginList) { 
    plugins = pluginList;
  
    // :: ERROR HANDLER ::::::::::::::::::::::::::::::::::::::::::::::::::::::::: //
    // 404
    app.use((req, res, next) => {
      logs.error("* Error 404 * " + util.inspect(req.url));
      var err = new Error('Not Found');
      err.status = 404;
      next(err);
    });

    // development
    if (dbg) {
      app.use((err, req, res, next) => {
        var errcode = err.status || 500;
        //logs.error("* Error (dev) "+errcode+" *: " + util.inspect(req));
        res.send(util.inspect(err));
      });
    }

    // production
    app.use((err, req, res, next) => {
      var errcode = err.status || 500;
      res.send(util.inspect(err));
    });
  
  })
  .then(raiseServer)