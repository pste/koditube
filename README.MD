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

## Installation

You can build a simple bash script to update the whole thing  ... I've made a deploy.sh this way: 
```
#!/bin/bash

# remove old version
pm2 stop koditube
rm -rf koditube

# download latest version
git clone https://github.com/pste/koditube.git

# update the plugin (don't remove old stuff or you'll lose the db)
cp -r koditube/plugin.video.koditube /home/osmc/.kodi/addons/

# start the webapp (I'm actually using PM2 to keep it up - WARNING: PM2 doesn't take your package.json parameters)
pushd koditube/webapp
npm install
pm2 start -name koditube app.js --debug --port 4006
popd

pm2 logs
```
