# koditube

The koditube project aims to easily wrap youtube (without authentication, easy as browsing it) into a web app written in Node.js.
The web app can be queried by a kodi plugin to stream these videos into your kodi machine.

## The web app

The 1st part of the project is the web app. Just running
```
npm start
```
will raise a web server on port 4006 (you can configure this value in the package.json file).
Pointing a browser to http://localhost:4006 will show you a page to search youtube videos and to browse the local db.

## The kodi plugin

The 2nd part of the project is the plugin: it basically connects to http://localhost:4006 and render every tag found into the local db into a (virtual) folder.
Inside each folder there are its videos. The play button will start streaming the youtube stuff into your kodi.

If you prefer, you can change the koditube url to a custom url (i.e. you can host the web app in the cloud, then make your kodi point to your public url)