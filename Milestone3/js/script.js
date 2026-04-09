$(document).ready(function () {
    let allBooks = [];
    let currentPage = 1;
    let booksPerPage = 10;

    let publicUserId = "102603143712539426156";
    let publicShelfId = "2";

    let apiKey = "AIzaSyD1LDXycgXy_MazXWbDpqpYApRHg3U2g0w";

    $("#searchBtn").click(function () {
        let searchText = $("#searchInput").val().trim();

        if (searchText === "") {
            alert("Please enter a search term.");
            return;
        }

        searchBooks(searchText);
    });

    $("#searchInput").keypress(function (event) {
        if (event.which === 13) {
            $("#searchBtn").click();
        }
    });

    function buildData(extraData) {
        let requestData = {};

        if (apiKey !== "") {
            requestData.key = apiKey;
        }

        for (let key in extraData) {
            requestData[key] = extraData[key];
        }

        return requestData;
    }

    function searchBooks(searchText) {
        $("#results").html("<p>Loading books...</p>");
        $("#pagination").html("");
        $("#details").html("<p>Click a book to see details here.</p>");
        $("#pageIndicator").text("Loading...");

        allBooks = [];
        currentPage = 1;

        $.ajax({
            url: "https://www.googleapis.com/books/v1/volumes",
            dataType: "jsonp",
            data: buildData({
                q: searchText,
                startIndex: 0,
                maxResults: 40
            }),
            success: function (data) {
                if (data.error) {
                    $("#results").html("<p>" + data.error.message + "</p>");
                    $("#pageIndicator").text("Page 0 of 0");
                    return;
                }

                if (data.items) {
                    allBooks = allBooks.concat(data.items);
                }

                $.ajax({
                    url: "https://www.googleapis.com/books/v1/volumes",
                    dataType: "jsonp",
                    data: buildData({
                        q: searchText,
                        startIndex: 40,
                        maxResults: 10
                    }),
                    success: function (data2) {
                        if (data2.error) {
                            // Show the first 40 if the second request fails
                            if (allBooks.length > 0) {
                                displayPage(currentPage);
                                createPagination();
                                $("#results").prepend("<p>Only part of the results could be loaded.</p>");
                            } else {
                                $("#results").html("<p>" + data2.error.message + "</p>");
                                $("#pageIndicator").text("Page 0 of 0");
                            }
                            return;
                        }

                        if (data2.items) {
                            allBooks = allBooks.concat(data2.items);
                        }

                        if (allBooks.length === 0) {
                            $("#results").html("<p>No books found.</p>");
                            $("#pageIndicator").text("Page 0 of 0");
                        } else {
                            displayPage(currentPage);
                            createPagination();
                        }
                    },
                    error: function () {
                        if (allBooks.length > 0) {
                            displayPage(currentPage);
                            createPagination();
                            $("#results").prepend("<p>Only part of the results could be loaded.</p>");
                        } else {
                            $("#results").html("<p>Could not load search results.</p>");
                            $("#pageIndicator").text("Page 0 of 0");
                        }
                    }
                });
            },
            error: function () {
                $("#results").html("<p>There was an error retrieving data from the API.</p>");
                $("#pageIndicator").text("Page 0 of 0");
            }
        });
    }

    function displayPage(pageNumber) {
        $("#results").html("");

        let start = (pageNumber - 1) * booksPerPage;
        let end = start + booksPerPage;
        let pageBooks = allBooks.slice(start, end);

        for (let count = 0; count < pageBooks.length; count++) {
            let book = pageBooks[count];
            let title = "No title available";
            let image = "https://via.placeholder.com/100x150?text=No+Cover";

            if (book.volumeInfo && book.volumeInfo.title) {
                title = book.volumeInfo.title;
            }

            if (
                book.volumeInfo &&
                book.volumeInfo.imageLinks &&
                book.volumeInfo.imageLinks.thumbnail
            ) {
                image = book.volumeInfo.imageLinks.thumbnail;
            }

            let bookCard = `
                <div class="book-card" data-id="${book.id}">
                    <img src="${image}" alt="${title}">
                    <h3>${title}</h3>
                </div>
            `;

            $("#results").append(bookCard);
        }

        let totalPages = Math.ceil(allBooks.length / booksPerPage);
        $("#pageIndicator").text("Page " + pageNumber + " of " + totalPages);
    }

    function createPagination() {
        $("#pagination").html("");

        let totalPages = Math.ceil(allBooks.length / booksPerPage);

        for (let count = 1; count <= totalPages; count++) {
            let buttonClass = "";

            if (count === currentPage) {
                buttonClass = "active";
            }

            let pageButton = `<button class="${buttonClass}" data-page="${count}">${count}</button>`;
            $("#pagination").append(pageButton);
        }
    }

    $(document).on("click", "#pagination button", function () {
        currentPage = parseInt($(this).attr("data-page"));
        displayPage(currentPage);
        createPagination();
    });

    $(document).on("click", ".book-card", function () {
        let bookId = $(this).attr("data-id");
        getBookDetails(bookId);
    });

    function getBookDetails(bookId) {
        $("#details").html("<p>Loading book details...</p>");

        $.ajax({
            url: "https://www.googleapis.com/books/v1/volumes/" + bookId,
            dataType: "jsonp",
            data: buildData({}),
            success: function (book) {
                if (book.error) {
                    $("#details").html("<p>" + book.error.message + "</p>");
                    return;
                }

                let title = "No title available";
                let authors = "Unknown author";
                let description = "No description available.";
                let image = "https://via.placeholder.com/120x180?text=No+Cover";

                if (book.volumeInfo && book.volumeInfo.title) {
                    title = book.volumeInfo.title;
                }

                if (book.volumeInfo && book.volumeInfo.authors) {
                    authors = book.volumeInfo.authors.join(", ");
                }

                if (book.volumeInfo && book.volumeInfo.description) {
                    description = book.volumeInfo.description;
                }

                if (
                    book.volumeInfo &&
                    book.volumeInfo.imageLinks &&
                    book.volumeInfo.imageLinks.thumbnail
                ) {
                    image = book.volumeInfo.imageLinks.thumbnail;
                }

                let detailsHtml = `
                    <img src="${image}" alt="${title}">
                    <h3>${title}</h3>
                    <p><strong>Author(s):</strong> ${authors}</p>
                    <p><strong>Description:</strong> ${description}</p>
                `;

                $("#details").html(detailsHtml);
            },
            error: function () {
                $("#details").html("<p>Could not load book details.</p>");
            }
        });
    }

    function loadCollection() {
        $("#collection").html("<p>Loading bookshelf collection...</p>");

        $.ajax({
            url: "https://www.googleapis.com/books/v1/user/" + publicUserId + "/bookshelves/" + publicShelfId + "/volumes",
            dataType: "jsonp",
            data: buildData({
                maxResults: 10
            }),
            success: function (data) {
                if (data.error) {
                    $("#collection").html("<p>" + data.error.message + "</p>");
                    return;
                }

                $("#collection").html("");

                if (!data.items || data.items.length === 0) {
                    $("#collection").html("<p>No books found in this bookshelf.</p>");
                    return;
                }

                for (let count = 0; count < data.items.length; count++) {
                    let book = data.items[count];
                    let title = "No title available";
                    let image = "https://via.placeholder.com/100x150?text=No+Cover";

                    if (book.volumeInfo && book.volumeInfo.title) {
                        title = book.volumeInfo.title;
                    }

                    if (
                        book.volumeInfo &&
                        book.volumeInfo.imageLinks &&
                        book.volumeInfo.imageLinks.thumbnail
                    ) {
                        image = book.volumeInfo.imageLinks.thumbnail;
                    }

                    let bookCard = `
                        <div class="book-card" data-id="${book.id}">
                            <img src="${image}" alt="${title}">
                            <h3>${title}</h3>
                        </div>
                    `;

                    $("#collection").append(bookCard);
                }
            },
            error: function () {
                $("#collection").html("<p>Could not load the public bookshelf collection.</p>");
            }
        });
    }

    loadCollection();
});
