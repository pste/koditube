# json-stream-player
A video plugin for kodi that talks with a koditube (Node.js) server

# Usage
TODO

# jsonrpc example
```
{
  "jsonrpc": "2.0",
  "method": "Addons.ExecuteAddon",
  "params":
  {
    "addonid": "plugin.video.stream.player",
    "params":
    {
      "url":"http://localhost:1234",
      "title": "Movie title",
      "thumb": "http://cover.domaine.tld/mycover.jpg"
    }
  },
  "id": 1
}
```

# Extra links
Kodi:  http://kodi.tv/

Yify-pop : https://github.com/farwarx/yify-pop


pirraste