var path = require('path');
var videoinfo = require('youtube.get-video-info');
var request = require('request');
var scraper = require('./scraper');
var qsurl = require('url');

// the plugin router:
exports.init = function(app) {
  
  // makes a search on youtube, then scrape the result as json and return the data to the caller
  app.get('/plugins/youtube/search/:keyword', (req, res) => {
    var keyword = req.params.keyword;
    scraper.search(keyword, 20, (items) => {
      res.json(items);
    });
  });

  // after a search, load another results page
  app.post('/plugins/youtube/pages', (req, res) => {
    var url = req.body.url;
    scraper.load(url, (items) => {
       res.json(items);
    });
  });

  // mini proxy: given a video url, request its video-info and proxies the response (stream) to the caller
  // it MUST be a GET (because of the pipe)
  app.get('/plugins/youtube/stream', (req, res) => { // /plugins/youtube/stream?url=https://www.youtube.com/watch?v=Fbzl46CuPiM
    var url = req.query.url;  // https://www.youtube.com/watch?v=Fbzl46CuPiM
    var qs = qsurl.parse(url, true).query; // { v: "Fbzl46CuPiM"}
    var id = qs.v;

    videoinfo.retrieve(id, (err, data) => {
      if (err) {
        var err = new Error('Youtube error');
        err.status = 404;
        next(err);
      }
      else {
        var url = data.url_encoded_fmt_stream_map[0].url;
        req.pipe(request(url)).pipe(res); // mini proxy
      }
    });
  });
}

// SEARCH: makes a search 
// LOAD: load an url
// STREAM: stream a video (url)