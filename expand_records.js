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

    // Scraping 1300+ pages is a bit harsh, so let's chill on the load a bit (should take roughly 20 mins to run)
    setTimeout(function(){

      scraper.StaticScraper
        .create('https://www.mixesdb.com'+mixObj.mixesdb_url)
        .scrape(function($) {
          return $("#mw-content-text").map(function() {

            var tracklist = $(this).find('ol').html();

            // our preference is to get the Mixcloud player, try a couple of different ways
            if (mixObj.has_audio) {
              if ($(this).find('div.mixcloud')) {
                var audioPlayer = $(this).find('div.mixcloud').html();
              } else {
                var audioPlayer = $(this).find('div.hearthis').html();
              }
            } else {
              var audioPlayer = null;
            };

            //build an object of new attributes to add to Algolia
            return newObj = {
              tracklist: tracklist,
              audio_player: audioPlayer,
              objID: mixObj.objectID
            };

          }).get();
        })
        .then(function(newObj) {

          console.log(newObj[0]);

          // Add the tracklist and audio player into the Algolia index for this ObjID if it doesn't exist
          mixes.partialUpdateObject({
            tracklist: newObj[0].tracklist,
            audio_player: newObj[0].audio_player,
            objectID: newObj[0].objID
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
