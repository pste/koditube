var tmplMain = Handlebars.compile($("#result").html());
var tmplPages = Handlebars.compile($(".pagination").first().html());
$("#result").empty().removeClass('hidden');
$('.pagination').empty().removeClass('hidden');

function fadeOut() {
  $("#result").hide();
  $('.pagination').hide();
}

function fadeIn() {
  $("#result").show();
  $('.pagination').show();
}

function renderitems(data) {
  $('#result').html(tmplMain(data.items));
  $('.pagination').html(tmplPages(data.pages));
  $('[data-toggle="tooltip"]').tooltip();
}

// do the search
$('.searchbox .btn').on('click', function() {
  var search = $('.searchbox input[type="text"]').val();
  var uri = baseurl + '/api/youtube/search/' + encodeURIComponent(search);
  
  fadeOut();
  $.get(uri, function(data) {
    renderitems(data);
    fadeIn();
  });
});

// page change
$('nav').on('click', '.page', function() {
  var uri = baseurl + '/api/youtube/pages/';
  
  fadeOut();
  $.post(uri, { url: $(this).attr('href') }, function(data) {
    renderitems(data);
    fadeIn();
  });
});

