"use strict";

let lastSearchTerms = "";
document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const searchTerms = event.target.search.value;
  if (searchTerms === lastSearchTerms) return;
  lastSearchTerms = searchTerms;
  performSearch(searchTerms);
});

function performSearch(searchTerms) {
  const main = document.querySelector("main");
  main.innerHTML = "LOADING...";
  fetchBooks(searchTerms)
    .then((results) => {
      if (results.totalItems === 0) {
        main.innerHTML = "There were no results for your search terms.";
        return;
      }
      const bookCards = results.items.map(processBookInfo).map(buildBookCard);
      main.innerHTML = bookCards.join("\n");
    })
    .catch((error) => {
      main.innerHTML = "There was an error. Please try again later.";
      console.error(error);
    });
}

function fetchBooks(searchTerms) {
  const searchQuery = "q=" + encodeURIComponent(searchTerms);
  const fields = "&fields=totalItems,items(volumeInfo/imageLinks,volumeInfo/title,volumeInfo/authors,volumeInfo/publisher,volumeInfo/infoLink)";
  const queryString = searchQuery + fields;
  const url = "https://www.googleapis.com/books/v1/volumes?" + queryString;

  const results = fetch(url).then((response) => {
    const { ok, status, statusText } = response;
    if (!ok) throw Error(`Response returned: ${status} ${statusText}`);
    return response.json();
  });

  return results;
}

function processBookInfo(item) {
  const { imageLinks, title, authors, publisher, infoLink } = item.volumeInfo;
  return {
    // HACK: Google Books API returns links as http, but using https instead works fine.
    cover: imageLinks
      ? imageLinks.thumbnail.replace("http", "https")
      : "https://via.placeholder.com/128x128.png?text=No+Cover",
    title,
    author: authors ? authors.join(", ") : "Unknown",
    publisher: publisher || "Unknown",
    link: infoLink
  };
}

function buildBookCard(book) {
  const { cover, title, author, publisher, link } = book;
  return (
    `<div class="book-card" >
      <img src=${cover} alt="book cover" width="128"/>
      <h2>${title}</h2>
      <div>By: ${author}</div>
      <div>Publisher: ${publisher}</div>
      <a href=${link}>See this book</a>
    </div>`);
}
