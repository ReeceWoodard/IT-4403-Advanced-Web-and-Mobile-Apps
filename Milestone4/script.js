const apiKey = "AIzaSyD1LDXycgXy_MazXWbDpqpYApRHg3U2g0w";

let currentPage = 1;
let currentQuery = "";
let currentStart = 0;

function searchBooks(query, start = 0) {
    currentQuery = query;
    currentStart = start;

    $.ajax({
        url: "https://www.googleapis.com/books/v1/volumes",
        data: {
            q: query,
            maxResults: 10,
            startIndex: start,
            key: apiKey
        },
        success: function (data) {
            if (data.items) {
                renderBooks(data.items, "#results");
            } else {
                $("#results").html("<p>No books found.</p>");
            }

            currentPage = Math.floor(start / 10) + 1;
            $("#pageInfo").text("Page " + currentPage);
        },
        error: function () {
            $("#results").html("<p>There was an error loading search results.</p>");
        }
    });
}

function renderBooks(books, target) {
    let template = $("#book-template").html();
    let html = "";

    books.forEach(function (book) {
        let info = book.volumeInfo;

        html += Mustache.render(template, {
            id: book.id,
            title: info.title || "No Title",
            authors: info.authors ? info.authors.join(", ") : "Unknown Author",
            thumbnail: info.imageLinks ? info.imageLinks.thumbnail : "https://via.placeholder.com/150"
        });
    });

    $(target).html(html);
}

function loadDetails(bookId) {
    $.ajax({
        url: "https://www.googleapis.com/books/v1/volumes/" + bookId,
        data: {
            key: apiKey
        },
        success: function (book) {
            let info = book.volumeInfo;
            let template = $("#detail-template").html();

            let html = Mustache.render(template, {
                title: info.title || "No Title",
                authors: info.authors ? info.authors.join(", ") : "Unknown Author",
                language: info.language || "N/A",
                pages: info.pageCount || "N/A",
                description: info.description || "No description available.",
                thumbnail: info.imageLinks ? info.imageLinks.thumbnail : "https://via.placeholder.com/150"
            });

            $("#details").html(html);
        },
        error: function () {
            $("#details").html("<p>Could not load book details.</p>");
        }
    });
}

function loadCollection(query) {
    $.ajax({
        url: "https://www.googleapis.com/books/v1/volumes",
        data: {
            q: query,
            maxResults: 12,
            key: apiKey
        },
        success: function (data) {
            if (data.items) {
                renderBooks(data.items, "#collectionResults");
            } else {
                $("#collectionResults").html("<p>No books found in this collection.</p>");
            }
        },
        error: function () {
            $("#collectionResults").html("<p>There was an error loading the collection.</p>");
        }
    });
}

$(document).ready(function () {
    $("#searchBtn").click(function () {
        let query = $("#searchInput").val().trim();

        if (query !== "") {
            searchBooks(query, 0);
        }
    });

    $("#searchInput").keypress(function (event) {
        if (event.which === 13) {
            $("#searchBtn").click();
        }
    });

    $("#nextPage").click(function () {
        if (currentQuery !== "") {
            searchBooks(currentQuery, currentStart + 10);
        }
    });

    $("#prevPage").click(function () {
        if (currentQuery !== "" && currentStart >= 10) {
            searchBooks(currentQuery, currentStart - 10);
        }
    });

    $(document).on("click", ".book-card", function () {
        let bookId = $(this).attr("data-id");
        loadDetails(bookId);
    });

    $("#gridView").click(function () {
        $("#results, #collectionResults")
            .removeClass("list-view")
            .addClass("grid-view");
    });

    $("#listView").click(function () {
        $("#results, #collectionResults")
            .removeClass("grid-view")
            .addClass("list-view");
    });

    $("#showSearch").click(function () {
        $("#searchPanel").show();
        $("#collectionPanel").hide();
    });

    $("#showCollection").click(function () {
        $("#searchPanel").hide();
        $("#collectionPanel").show();
    });

    $("#popularBooks").click(function () {
        loadCollection("bestsellers");
    });

    $("#topRatedBooks").click(function () {
        loadCollection("award winning fiction");
    });

    $("#collectionPanel").hide();
    loadCollection("classic literature");
});
