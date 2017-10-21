const search = instantsearch({
  appId: 'UXOY6UM4BN',
  apiKey: '0b40f33caafd7b1d1a26dc681143756f',
  indexName: 'essential_mixes',
  urlSync: true
});

const client = algoliasearch('UXOY6UM4BN', '0b40f33caafd7b1d1a26dc681143756f');
const mixIndex = client.initIndex('essential_mixes');

// Select mixes by your favourite DJ

search.addWidget(
  instantsearch.widgets.menuSelect({
    container: '#dj',
    attributeName: 'mix_by',
    limit: 400
  })
);

// Select mixes that happened in particular years

search.addWidget(
  instantsearch.widgets.menuSelect({
    container: '#years',
    attributeName: 'year',
    limit: 25
  })
);

// Select mixes by their hottttttness

search.addWidget(
  instantsearch.widgets.starRating({
    container: '#hotness',
    attributeName: 'hotness',
    max: 10
  })
);

// Search

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search for a mix!'
  })
);

// Results

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      empty: 'No results',
      item: document.getElementById('hit-template').innerHTML
    }
  })
);

// Pagination, you know, for pages

search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    maxPages: 200,
    // default is to scroll to 'body', here we disable this behavior
    scrollTo: false,
    showFirstLast: false,
  })
);

// Reset the search

search.addWidget(
  instantsearch.widgets.clearAll({
    container: '#clear',
    templates: {
      link: 'Reset the search'
    },
    autoHideContainer: false,
    clearsQuery: true,
  })
);

// Custom click handler on render, so that jQuery clicks will work
// properly. This then loads the audio player into a div if no player
// exists. If one does, it removes it first. If there is no mix, then
// an error is displayed.

search.on('render', function () {
  $(document).ready(function() {
    $(".mix-link").click(function(e) {
      e.preventDefault();
      var id = $(this).data('algolia-id');
      mixIndex.getObject(id, function(err, content) {
        if (content.audio_player != null) {
          $('.audio_player').empty();
          var mix_url = encodeURI(content.audio_player);
          $('.audio_player').html('<iframe width="100%" height="60" src="https://www.mixcloud.com/widget/iframe/?hide_cover=1&mini=1&hide_artwork=1&feed='+mix_url+'" frameborder="0" ></iframe>');
          $('.tracklist').slideUp('slow', function(){
            $('.tracklist').empty();
            $('.tracklist').append('<ol>'+content.tracklist+'</ol>').slideDown('3000');
          });
        } else {
          $('.notice_'+content.objectID).fadeIn('fast').delay(3000).fadeOut('slow');
        }
      });
    });
  });
});

// Custom helpers
// Some little fun things to change up the way the information is displayed
// to users when the hits are returned.

// Use moment.js to reformat the broadcast_date to 'n days/months/years ago'
// and return the new wording to the hit

search.templatesConfig.helpers.dateFormatter = function() {
  var formatted_time = moment(this.broadcast_date, "YYYY-MM-DD").fromNow();
  return '<em>' + formatted_time + '</em>';
};

// Some titles are really long, let's truncate them if they are and
// pretty them up a bit.

search.templatesConfig.helpers.trim_long_titles = function() {
  if (this.mix_by.length > 25) {
    var length = 30;
    var newTitle = this.mix_by.substr(0,length)+"...";
    return newTitle;
  } else {
    return this.mix_by;
  }
};

// Some things just need an emoji.

search.templatesConfig.helpers.emojify = function() {
  if (this.hotness > 8) {
    return this.hotness+'/10 🔥';
  } else {
    return this.hotness+'/10';
  }
};


// run
search.start();
