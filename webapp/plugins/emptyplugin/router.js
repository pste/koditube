var path = require('path');
var request = require('request');
var basepath = "/plugins/emptyplugin";

// the plugin router:
exports.init = function(app) {
  console.log("                   ", basepath + '/search/:keyword');
  
  // makes a search on youtube, then scrape the result as json and return the data to the caller
  app.get(basepath + '/search/:keyword', (req, res) => {
    var keyword = req.params.keyword;
    
    var items = [];
    items.push({title: "item 1 " + keyword, url:"#", thumb:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Kodi-logo-Thumbnail-light-transparent.png/150px-Kodi-logo-Thumbnail-light-transparent.png"});
    items.push({title: "item 2 " + keyword, url:"#", thumb:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Kodi-logo-Thumbnail-light-transparent.png/150px-Kodi-logo-Thumbnail-light-transparent.png"});
    items.push({title: "item 3 " + keyword, url:"#", thumb:"https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Kodi-logo-Thumbnail-light-transparent.png/150px-Kodi-logo-Thumbnail-light-transparent.png"});
   
    res.json({items: items});
  });
  
  // mini proxy: given a video url, proxies the response (stream) to the caller
  // it MUST be a GET (because of the pipe)
  app.get(basepath + '/stream', (req, res) => { // /plugins/emptyplugin/stream?url=https://somevideourl/12345
    var url = req.query.url;  
    console.log("  trying to stream ", url);
    req.pipe(request(url)).pipe(res); // mini proxy: the url here MUST be the stream url (not a youtube.com/watch?v=....)
  });
}
