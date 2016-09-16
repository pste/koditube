Handlebars.registerHelper('ifeq', function(v1, v2, options) {
  if(v1 == v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

/**/

function bootstrapInit() {
  $('[data-toggle="tooltip"]').tooltip();
}

/**/

$(document).ready(function() {
  
  /* PARTIAL RENDERER */
  
  $('#browse').on('click', function() {
    $.get('/browse', function(res) {
      $('main').html(res);
      bootstrapInit();
    }).fail(function() {
      alert( "error" );
    })
  })

  $('#search').on('click', function() {
    $.get('/search', function(res) {
      $('main').html(res);
      bootstrapInit();
    })
    .fail(function() {
      alert( "error" );
    })
  });
  
  /* BUTTON EVENTS */
    
  function onSelectedRows(onRow) {
    $('#result .btn-info').each(function(i,o) {
      var $row = $(this).parents('.row').first();
      onRow($row);
    });
    
    // reload
    $('#browse').trigger('click');
  }
  
  function _postToSrv(url, item) {
    $.ajax({
      type: 'POST',
      data: JSON.stringify(item),
      contentType: 'application/json',
      url: url
    });
  }
  
  // (browse page) btn open popup delete
  $('main').on('click', '#btndelete', function() {
    if ($('#result .btn-info').length > 0)
      $('#areyousure').modal({});
  });
  
  // (browse page) btn open popup tag
  $('main').on('click', '#btntags', function() {
    if ($('#result .btn-info').length > 0)
      $('#kttags-dlg').modal({});
  });
  
  // (browse page) click on tag
  $('main').on('click', '.kttag', function() {
    var $btn = $(this);
    var url = '/api/db/list?tag=' + $btn.attr("key");
    $.get(url, function(data) {
      $('#result').html(tmplRows(data)); // tmplRows is a local var to the page
      bootstrapInit();
    }).fail(function() {
      alert( "error" );
    })
  });
  
  // (browse page) remove from db
  $('main').on('click', '.ktrm', function() {
    $('#areyousure');
    
    onSelectedRows(function($row) {
      var uri = '/api/db/remove/';
      var item = {
        "key": $row.attr('key')
      };
      
      _postToSrv(uri, item);
    });
    
    $('#areyousure').modal('toggle');
  });
  
  // (browse page) add to folder
  $('main').on('click', '.kttags', function() {
    var tag = $('#kttags-txt').val();
    var uri = '/api/db/save/';
    
    // adding
    onSelectedRows(function($row) {
      var tags = [];
      $row.find('.tag').each(function(i,o){
        tags.push($(o).text());
      });
      tags.push(tag);
      
      var item = {
        key: $row.attr('key'),
        tags: tags
      }
      
      _postToSrv(uri, item);
      //$.post(uri, JSON.stringify(item), 'json');
    });
    
    $('#kttags-dlg').modal('toggle');
  });

  // (browse page) pin / unpin row
  $('main').on('click', '.ktpin', function() {
    var $btn = $(this);
    if ($btn.hasClass('btn-info')) $btn.removeClass('btn-info');
    else $btn.addClass('btn-info');
  });
  
  // (search page) load youtube url
  $('main').on('click', '.ktplay', function() {
    var $elem = $(this).children('.fa');
    window.location = $elem.attr('href');
  });

  // (search page) add to db
  $('main').on('click', '.ktadd', function() {
    var $elem = $(this).children('.fa');
    var $row = $elem.parents('.row').first();
    var uri = '/api/db/save/';
    var item = {
      "key": $elem.attr('key')
      , "title": $row.find('.title').text()
      , "thumb": $row.find('.thumbnail').attr('thumb')
      , "source": "youtube"
      , "tags": []
    };

    _postToSrv(uri, item);
  });

});
