import sys
import urlparse
import urllib2
import json

import xbmc
import xbmcaddon
import xbmcgui
import xbmcplugin

class KoditubePlugin(object):
  
  def __init__(self):
    self.debug = True
    self.addon = xbmcaddon.Addon()
    self.addonName = self.addon.getAddonInfo('name')
    self.log(self.addonName)
    self.addonPath = sys.argv[0]
    self.log(self.addonPath)
    self.addonHandle = int(sys.argv[1])
    self.log(self.addonHandle)
    self.baseurl = xbmcplugin.getSetting(self.addonHandle, "koditubeUrl") # "http://localhost:4006"
    self.log(self.baseurl)
    self.addonArgs = urlparse.parse_qs(sys.argv[2][1:])
    self.log(self.addonArgs)
    
    xbmcplugin.setContent(self.addonHandle, 'movies')
    self.log("Started ...")
    
  def log(self, txt):
    if self.debug:
      if isinstance (txt, str):
        txt = txt.decode("utf-8")
      message = u'%s: %s' % (self.addonName, txt)
      xbmc.log(msg=message.encode("utf-8"), level=xbmc.LOGDEBUG)
      
  #def stream(self, url):
  #  self.log("*** START STREAMING")
  #  self.log(url)
  #  xbmc.Player().play(url.replace(' ', '%20'), listitem)
      
  def listfolders(self):
    self.log("*** LISTING TAGS")
    try:
      response = urllib2.urlopen(self.baseurl + "/api/db/tags")
      data = json.loads(response.read())
      
      for item in data:
        self.log(item)
        li = xbmcgui.ListItem(item, iconImage='DefaultFolder.png')
        path = self.addonPath + "?tag=" + item
        xbmcplugin.addDirectoryItem(handle=self.addonHandle, url=path, listitem=li, isFolder=True)
      xbmcplugin.endOfDirectory(self.addonHandle)
    except urllib2.HTTPError, err:
      if err.code == 404:
        xbmcgui.Dialog().ok(self.addonName, '404 - Page not found')
      else:
        xbmcgui.Dialog().ok(self.addonName, 'Error (' + err.code + '): ' + err.message)
    except urllib2.URLError, err:
      xbmcgui.Dialog().ok(self.addonName, 'Error: ' + str(err)) # err.reason
      # err.reason
      
  def listitems(self, tag):
    self.log("*** LISTING ITEMS FOR [" + tag   + "]")
    response = urllib2.urlopen(self.baseurl + "/api/db/list?tag=" + tag)
    data = json.loads(response.read())

    for item in data:
        self.log(item)
        li = xbmcgui.ListItem(item['title'])
        li.setThumbnailImage(item['thumb'])
        path = self.baseurl + "/plugins/" + item['source'] + "/stream?url=" + item['url']; # /plugins/youtube/stream?url=https://www.youtube.com/watch?v=Fbzl46CuPiM
        xbmcplugin.addDirectoryItem(handle=self.addonHandle, url=path, listitem=li)
    xbmcplugin.endOfDirectory(self.addonHandle)
      
  def run(self):
    try:
      #if self.addonArgs and self.addonArgs['url']:
      if 'tag' in self.addonArgs:
        #self.listfolders()
        self.listitems(self.addonArgs['tag'][0]) # urlparse.parse_qs parse values as arrays; I'll take 1st elem
      else:
        self.listfolders()
        #self.listitems('')
    except Exception as err:
      xbmcgui.Dialog().ok(self.addonName, 'Error: ' + err.message)

ktp = KoditubePlugin()
ktp.run()