'use strict';

function Article (rawDataObj) {
  this.author = rawDataObj.author;
  this.authorUrl = rawDataObj.authorUrl;
  this.title = rawDataObj.title;
  this.category = rawDataObj.category;
  this.body = rawDataObj.body;
  this.publishedOn = rawDataObj.publishedOn;
}

// REVIEWED: Instead of a global `articles = []` array, let's attach this list of all articles directly to the constructor function. Note: it is NOT on the prototype. In JavaScript, functions are themselves objects, which means we can add properties/values to them at any time. In this case, the array relates to ALL of the Article objects, so it does not belong on the prototype, as that would only be relevant to a single instantiated Article.
Article.all = [];

// COMMENT: Why isn't this method written as an arrow function?
// The function references the article object, thus cannot lose scope.
Article.prototype.toHtml = function() {
  let template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // COMMENT: What is going on in the line below? What do the question mark and colon represent? How have we seen this same logic represented previously?
  // Not sure? Check the docs!
  // It's a ternary statement where the syntax is variable = condition ? if true code : if false code
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEWED: There are some other functions that also relate to all articles across the board, rather than just single instances. Object-oriented programming would call these "class-level" functions, that are relevant to the entire "class" of objects that are Articles.

// REVIEWED: This function will take the rawData, how ever it is provided, and use it to instantiate all the articles. This code is moved from elsewhere, and encapsulated in a simply-named function for clarity.

// COMMENT: Where is this function called? What does 'rawData' represent now? How is this different from previous labs?
// The function is called in the fetchAll method. Article.loadAll is pushing all the articles to our article.all array. rawData represents our hackerIpsum.json data. We had blog articles store as an array of objects in a js file.
Article.loadAll = rawData => {
  rawData.sort((a,b) => (new Date(b.publishedOn)) - (new Date(a.publishedOn)))

  rawData.forEach(articleObject => Article.all.push(new Article(articleObject)))
}

// REVIEWED: This function will retrieve the data from either a local or remote source, and process it, then hand off control to the View.
Article.fetchAll = () => {
  // REVIEWED: What is this 'if' statement checking for? Where was the rawData set to local storage?

  if (localStorage.rawData) {

    $.ajax({
      url : 'data/hackerIpsum.json',
      type : 'HEAD',
      success : function(data, message, xhr) {
        if (localStorage.currentETag === xhr.getResponseHeader('ETag')) {
          Article.loadAll(JSON.parse(localStorage.rawData));
        } else {
          localStorage.clear();
          Article.fetchAll();
        }
      }
    });
  } else {
    // If localStorage does not have any items in it, it will pull the data from the DATA file. then set the data to localStorage but it will stringify it. after that it will then call the loadAll function and PARSE it to be readable. then we call the initIndexPage to load the article on the page.
    $.getJSON('data/hackerIpsum.json', function (data) {
      localStorage.setItem('rawData', JSON.stringify(data));
      Article.loadAll(JSON.parse(localStorage.rawData));
      articleView.initIndexPage();
    }, function(data, message, xhr) {
      // success function to grab ETag.
      localStorage.setItem('currentETag', xhr.getResponseHeader('ETag'));
    });
  }
}
