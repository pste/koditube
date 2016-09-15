var $result = $("#result");
var tmplRows = Handlebars.compile($result.html());
$result.empty().removeClass('hidden');

var $tags = $("#tags");
var tmplTags = Handlebars.compile($tags.html());
$tags.empty().removeClass('hidden');

// load the tags
$.get('/api/db/tags', function(data) {
  $tags.html(tmplTags(data));
});