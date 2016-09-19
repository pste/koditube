var path = require('path');
var videoinfo = require('youtube.get-video-info');
var scraper = require('./scraper');

// the plugin router:
exports.init = function(app) {
  console.log('youtube router  O N L I N E');
  
  app.get('/bubbo', (req,res) =>   { res.send('ciao')});
  
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

  // mini proxy: given a videoId, request its video-info and proxies the response (stream) to the caller
  app.get('/plugins/youtube/proxy/:id', (req, res) => {
    var id = req.params.id;
    videoinfo.retrieve(id, (err, data) => {
      if (err) {
        var err = new Error('Youtube error');
        err.status = 404;
        next(err);
      }
      else {
        var url = data.url_encoded_fmt_stream_map[0].url;
        logs.log("start streaming " + id + " ...");
        req.pipe(request(url)).pipe(res); // mini proxy
      }
    });
  });
}

// SEARCH: makes a search 
// LOAD: load an url
// STREAM: stream a video (url)