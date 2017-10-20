const search = instantsearch({
  appId: 'UXOY6UM4BN',
  apiKey: '0b40f33caafd7b1d1a26dc681143756f',
  indexName: 'essential_mixes',
  urlSync: true
});

const client = algoliasearch('UXOY6UM4BN', '0b40f33caafd7b1d1a26dc681143756f');
const mixIndex = client.initIndex('essential_mixes');


search.addWidget(
  instantsearch.widgets.rangeSlider({
    container: '#years',
    attributeName: 'year',
    templates: {
      header: 'Year'
    },
    tooltips: {
      format: function(rawValue) {
        return rawValue;
      }
    }
  })
);

search.addWidget(
  instantsearch.widgets.starRating({
    container: '#hotness',
    attributeName: 'hotness',
    max: 10,
    labels: {
      andUp: 'or more'
    }
  })
);

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search for a mix!'
  })
);

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      empty: 'No results',
      item: document.getElementById('hit-template').innerHTML
    }
  })
);

search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    maxPages: 200,
    // default is to scroll to 'body', here we disable this behavior
    scrollTo: false,
    showFirstLast: false,
  })
);

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

// click hanlers

search.on('render', function () {
  $(document).ready(function() {
    $(".mix-link").click(function(e) {
      e.preventDefault();
      var id = $(this).data('algolia-id');
      mixIndex.getObject(id, function(err, content) {
        console.log(content.objectID + ": " + content.toString());
      });
    });
  });
});

// custom helpers

search.templatesConfig.helpers.dateFormatter = function() {
  var formatted_time = moment(this.broadcast_date, "YYYY-MM-DD").fromNow();
  return '<em>' + formatted_time + '</em>';
};

search.templatesConfig.helpers.trim_long_titles = function() {
  if (this.mix_by.length > 25) {
    var length = 30;
    var newTitle = this.mix_by.substr(0,length)+"...";
    return newTitle;
  } else {
    return this.mix_by;
  }
};

search.templatesConfig.helpers.emojify = function() {
  if (this.hotness > 8) {
    return this.hotness+'/10 🔥';
  } else if (this.hotness < 3) {
    return this.hotness+'/10 💩';
  } else {
    return this.hotness+'/10';
  }
};

search.start();
