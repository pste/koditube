var request = require('request');
var jsdom = require('jsdom');
var util = require('util');
var colors = require('colors');
var fs = require('fs');
var mold = require('../../mold');

var youtube = 'https://www.youtube.com';

// set debug=true
var dbg = (process.env.debug === 'true');
request.debug = dbg;

/* :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: */

function get(url) {
  return new Promise(function (resolve, reject) {
    console.log('>>>'.yellow, 'started', 'get'.cyan, '[', url.yellow, ']');

    request(url, function(err, res, body) {
      if (!err && res.statusCode == 200) {
        console.log('>>>'.yellow, 'done'.green, 'get'.cyan, '[', url.yellow, ']');
        resolve(body);
      }
      else {
        console.log('get error:'.red);
        if (res && res.statusCode)  console.log('  res:' + util.inspect(res.statusCode));
        console.log('  err:' + util.inspect(err));
        console.log('- - - - -'.red);
        reject(err);
      }
    });
  });
}

function buildDOM(body) {
  return new Promise(function (resolve, reject) {
    console.log('>>>'.yellow, 'started', 'buildDOM'.cyan, 'on', body.length, 'bytes');
    jsdom.env(body, [], function(err, window) {
        if (typeof(window) === 'undefined') {
          console.log('buildDOM Error'.red + ': ' + util.inspect(err));
          reject(err);
        }
        else {
          console.log('>>>'.yellow, 'done'.green, 'buildDOM'.cyan);
          resolve(window.document);
        }
      }
    );
  });
}

/* :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: */

function parseHTML(document) {
  var links = [];
  var pages = [];
  var refs;
  
  //
  refs = document.querySelectorAll("#results ol.section-list ol > li > div.yt-lockup-video");
  for (var i=0; i<refs.length; i++) {
    var link = refs.item(i).querySelector(".yt-lockup-thumbnail > a");
    var id = refs.item(i).getAttribute("data-context-item-id");
    var img = refs.item(i).querySelector(".yt-lockup-thumbnail img");
    var title = refs.item(i).querySelector(".yt-lockup-title");
    
    var imgref = img.getAttribute("data-thumb") || img.src; // spf late loads the images but we need the url now
    links.push(mold.stamp(i, title.textContent, id, youtube + link.href, imgref));
  }
  
  //
  refs = document.querySelectorAll(".search-pager > a");
  for (var i=0; i<refs.length; i++) {
    var link = refs.item(i);

    pages.push({
      key: link.textContent.trim()
      , href: youtube + link.href
    });
  }
  
  //
  return {
    items: links
    , pages: pages
  };
}

/* :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::: */

function dothescrape(search, maxResults, cb) {
  get(youtube + '/results?search_query=' + encodeURIComponent(search) + '&type=video') //&spfreload=10')
    .then(buildDOM)
    .then(parseHTML)
    .then(function(result) {
      cb(result);
    });
}

function dotheload(url, cb) {
   get(url)
    .then(buildDOM)
    .then(parseHTML)
    .then(function(result) {
      cb(result);
    });
}

exports.search = dothescrape;
exports.load = dotheload;