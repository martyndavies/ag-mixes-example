const search = instantsearch({
  appId: 'UXOY6UM4BN',
  apiKey: '0b40f33caafd7b1d1a26dc681143756f',
  indexName: 'essential_mixes',
  urlSync: true
});

search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#years',
    attributeName: 'year'
  })
);

search.addWidget(
  instantsearch.widgets.starRating({
    container: '#hotness',
    attributeName: 'hotness',
    max: 10,
    labels: {
      andUp: '& Up'
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

search.start();
