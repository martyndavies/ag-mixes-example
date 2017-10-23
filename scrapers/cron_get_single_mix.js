#!/usr/bin/node

require('dotenv').config()

// Load up the modules the scraper requires
const algoliasearch = require('algoliasearch');

// authenticate, use the Admin API key so we can update records as well
const algolia = algoliasearch(process.env.ALGOLIA_INDEX, process.env.ALGOLIA_KEY);
const mixes = algolia.initIndex('essential_mixes');

//init scraper
const scraper = require('scraperjs');

scraper.StaticScraper
  .create('https://www.mixesdb.com/w/Category:Essential_Mix')
  .scrape(function($) {
    return $("#catFreshMixesList li").map(function() {

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
    console.log(mixesObj[0]);
    mixes.addObject(mixesObj[0], function(err, content){
      mixes.waitTask(content.taskID, function(err) {
        if (!err) {
          console.log('Mix ' + content.objectID + ' indexed');
        }
      });
    });
  });
