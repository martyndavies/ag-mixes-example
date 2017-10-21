#!/usr/bin/node

require('dotenv').config()

// Load up the modules the scraper requires
const algoliasearch = require('algoliasearch');
const imagesearch = require('image-search-google');
const images = new imagesearch(process.env.GOOGLE_SEARCH_ENGINE_ID, process.env.GOOGLE_API_KEY);

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

  // Iterate through the mixes and add images

  listofMixes.forEach(function(mixObj, index){

    setTimeout(function(){
    var options = {page: 1};
      images.search(mixObj.mix_by, options)
      .then(images => {
        if (images[0] == undefined) {
          console.log('No image context available for '+mixObj.mix_by+' because: '+images);
        } else {
          console.log('Found image for '+mixObj.mix_by);
          mixes.partialUpdateObject({
            image: {
              main: images[0].url,
              thumbnail: images[0].thumbnail,
              origin: images[0].context
            },
            objectID: mixObj.objectID
          }, function(err, content) {
            if (err) {
              console.log(err);
            } else {
              console.log(content);
            }
          });
        }
      }).catch(error => console.log(error));
    }, index * 1100);

  });
});
