exports.stamp = function(index, title, videoId, href, thumb) {
  return {
    index: index
      , title: title
      , key: videoId
      , href: href //'https://www.youtube.com/watch?v=' + videoId
      , thumb: thumb
  }
}
