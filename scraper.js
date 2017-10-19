#!/usr/bin/node

require('dotenv').config()

// Load up the modules the scraper requires
const algoliasearch = require('algoliasearch');

// authenticate, use the Admin API key so we can update records as well
const algolia = algoliasearch(process.env.ALGOLIA_INDEX, process.env.ALGOLIA_KEY);
const mixes = algolia.initIndex('essential_mixes');

//init scraper
const scraper = require('scraperjs');

const mixUrls = [
  'https://www.mixesdb.com/w/Category:Essential_Mix',
  'https://www.mixesdb.com/db/index.php?title=Category:Essential_Mix&pagefrom=1997-07-20+-+VA+%40+The+Phoenix+Festival+-+Essential+Mix#mw-pages',
  'https://www.mixesdb.com/db/index.php?title=Category:Essential_Mix&pagefrom=2001-03-18+-+Pete+Tong%2C+Dave+Seaman+%40+Kelly%27s%2C+Port+Rush%2C+Ireland+-+Essential+Mix#mw-pages',
  'https://www.mixesdb.com/db/index.php?title=Category:Essential_Mix&pagefrom=2004-12-05+-+Lisa+Lashes+-+Essential+Mix#mw-pages',
  'https://www.mixesdb.com/db/index.php?title=Category:Essential_Mix&pagefrom=2008-07-12+-+John+O%27Callaghan+-+Essential+Mix#mw-pages',
  'https://www.mixesdb.com/db/index.php?title=Category:Essential_Mix&pagefrom=2012-03-24+-+Alesso+-+Essential+Mix#mw-pages',
  'https://www.mixesdb.com/db/index.php?title=Category:Essential_Mix&pagefrom=2015-08-29+-+Rudimental+-+Essential+Mix#mw-pages'
];

mixUrls.forEach(function(mixUrl){

  scraper.StaticScraper
    .create(mixUrl)
    .scrape(function($) {
      return $("#catMixesList li").map(function() {

        // we'll use this often, let's store it and cut it up here rather than in the object itself
        var thisMix = $(this).text().trim();
        var thisMixTitle = $(this).text().split(' - ');
        var thisMixDate = new Date(thisMixTitle[0]);
        var url = $(this).find('a').first().attr('href');
        var hotness = $(this).find('span').last().attr('title').split(' ');
        var hasAudio = $(this).find('span').children().first().attr('class') == 'playerLinkAfter' ? true : false;

        //build an object for each mix
        return {
          title: thisMix,
          mix_by: thisMixTitle[1],
          broadcast_date: thisMixDate,
          year: thisMixDate.getFullYear(),
          month: thisMixDate.getMonth(),
          mixesdb_url: url,
          hotness: hotness[2],
          has_audio: hasAudio
        }
      }).get();
    })
    .then(function(mixesObj) {
      mixesObj.forEach(function(mix){
        mixes.addObject(mix, function(err, content){
          mixes.waitTask(content.taskID, function(err) {
            if (!err) {
              console.log('Mix ' + content.objectID + ' indexed');
            }
          });
      });
    });
  })
});
