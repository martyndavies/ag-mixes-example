#!/usr/bin/node

require('dotenv').config()

// Load up the modules the scraper requires
const algoliasearch = require('algoliasearch');
const scraper = require('scraperjs');

// authenticate, use the Admin API key so we can update records as well
const algolia = algoliasearch(process.env.ALGOLIA_INDEX, process.env.ALGOLIA_KEY);
const mixes = algolia.initIndex('essential_mixes')


// Overclock the limit on pagination to include all the mixes we have (<1500)
mixes.setSettings({
  paginationLimitedTo: 1500
});

// Get all the mixes back out ready for expansion
var browseMixes = mixes.browseAll();
var listofMixes = [];

browseMixes.on('result', function onResult(content){
  listofMixes = listofMixes.concat(content.hits);
});

browseMixes.on('end', function onEnd(){

  // Iterate through the mixes and add back the additional data from the dedicated mixesDB page

  listofMixes.forEach(function(mixObj, index){

    // Scraping 1300+ pages is a bit harsh, so let's chill on the load a bit (should take roughly 40 mins to run)
    setTimeout(function(){

      scraper.StaticScraper
        .create('https://www.mixesdb.com'+mixObj.mixesdb_url)
        .scrape(function($) {
          return $("#Tracklist").map(function() {

            var tracklist = $(this).next('ol').html();
            console.log(tracklist);

            return tracklist;

          }).get();
        })
        .then(function(newObj) {

          console.log(newObj[0]);

          // Add the audio player into the Algolia index for this ObjID
          mixes.partialUpdateObject({
            tracklist: newObj,
            objectID: mixObj.objectID
          }, function(err, content) {
            if (err) {
              console.log(err);
            } else {
              console.log(content);
            }
          });

        // end .then
        });

      // timeout for 2 seconds to ease load
      }, index * 2000);

  });
});
