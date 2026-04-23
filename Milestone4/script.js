const apiKey="YOUR_API_KEY";

let currentPage=1;
let currentQuery="";
let currentStart=0;


function searchBooks(query,start=0){

currentQuery=query;
currentStart=start;

$.ajax({

url:
"https://www.googleapis.com/books/v1/volumes",

data:{
q:query,
maxResults:10,
startIndex:start,
key:apiKey
},

success:function(data){

renderBooks(
data.items,
"#results"
);

currentPage=
Math.floor(start/10)+1;

$("#pageInfo").text(
"Page " + currentPage
);

}

});

}



function renderBooks(books,target){

let template=
$("#book-template").html();

let html="";

books.forEach(function(book){

let info=
book.volumeInfo;

html+=Mustache.render(
template,
{
id:book.id,
title:
info.title || "No Title",

authors:
info.authors ?
info.authors.join(", ")
:"Unknown",

thumbnail:
info.imageLinks ?
info.imageLinks.thumbnail
:"https://via.placeholder.com/150"
}
);

});

$(target).html(html);

}



function loadDetails(bookId){

$.ajax({

url:
"https://www.googleapis.com/books/v1/volumes/"
+bookId,

success:function(book){

let info=
book.volumeInfo;

let template=
$("#detail-template").html();

let html=
Mustache.render(
template,
{
title:info.title,
authors:
info.authors ?
info.authors.join(", ")
:"Unknown",

language:
info.language,

pages:
info.pageCount,

description:
info.description ||
"No description.",

thumbnail:
info.imageLinks ?
info.imageLinks.thumbnail
:"https://via.placeholder.com/150"
}
);

$("#details").html(html);

}

});

}



function loadCollection(query){

$.ajax({

url:
"https://www.googleapis.com/books/v1/volumes",

data:{
q:query,
maxResults:12,
key:apiKey
},

success:function(data){

renderBooks(
data.items,
"#collectionResults"
);

}

});

}



$("#searchBtn").click(function(){

let query=
$("#searchInput").val();

searchBooks(query);

});


$("#nextPage").click(function(){

searchBooks(
currentQuery,
currentStart+10
);

});


$("#prevPage").click(function(){

if(currentStart>=10){

searchBooks(
currentQuery,
currentStart-10
);

}

});


$(document).on(
"click",
".book-card",
function(){

let id=
$(this).data("id");

loadDetails(id);

}
);


$("#gridView").click(function(){

$("#results,#collectionResults")
.removeClass("list-view")
.addClass("grid-view");

});


$("#listView").click(function(){

$("#results,#collectionResults")
.removeClass("grid-view")
.addClass("list-view");

});


$("#showSearch").click(function(){

$("#searchPanel").show();
$("#collectionPanel").hide();

});


$("#showCollection").click(function(){

$("#searchPanel").hide();
$("#collectionPanel").show();

});


$("#popularBooks").click(function(){

loadCollection(
"bestsellers"
);

});


$("#topRatedBooks").click(function(){

loadCollection(
"award winning fiction"
);

});


$("#collectionPanel").hide();


loadCollection(
"classic literature"
);
