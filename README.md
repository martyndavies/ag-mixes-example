## Algolia Example - The Essential Vault

Live version: [ag-example.s3-website-eu-west-1.amazonaws.com](http://ag-example.s3-website-eu-west-1.amazonaws.com)

### Process

1. Find a great source of data - [mixesdb.com](https://mixesdb.com)
2. Build a series of scrapers in NodeJS to iterate over the index page, and individual pages to collect all the data we need to build out our index
3. Use an additional scraper to expand that data with images and audio gathered from other sources (Google & Mixcloud)
4. Build a basic web app to display the data back to users in a more searchable way than MixesDB does. Allowing them to peruse by year, hotness, DJ, and check out the mixes and track listings.

### Tech

The scrapers in this project use NodeJS. Node works extremely well for building this kind of script as JS lends itself well to working with the DOM in a headless manner, which we do through the [ScraperJS](https://github.com/ruipgil/scraperjs) library that has the excellent [Cheerio](https://github.com/cheeriojs/cheerio) implementation of jQuery at its core.

The Algolia JavaScript SDK is used across all of the scrapers to load, insert and update data in the index.

The web app is a static HTML file, hosted on Amazon S3 that takes advantage of the Algolia instantsearch.js library and its widgets. I customised a couple of elements here:

For example, this custom helper for the template engine adds emojis to the most fire mixes, rated 8 or higher:

```
search.templatesConfig.helpers.emojify = function() {
  if (this.hotness > 8) {
    return this.hotness+'/10 🔥';
  } else {
    return this.hotness+'/10';
  }
};
```

Once hits are returned for the search they're pushed to the DOM and rendered.

The whole thing was styled relatively basically using Skeleton, a lightweight CSS framework for building quick layouts.

### Additional

Outside of the web app implementation of this newly gathered index, there is also a Serverless implementation of a REST API for it in progress as well. You can see how it's getting on, [over here](https://github.com/martyndavies/essential-mix-api).
