  // Extend jquery for PUT and DELETE
  jQuery.each( [ "put", "delete" ], function( i, method ) {
    jQuery[ method ] = function( url, data, callback, type ) {
      if ( jQuery.isFunction( data ) ) {
        type = type || callback;
        callback = data;
        data = undefined;
      }
  
      return jQuery.ajax({
        url: url,
        type: method,
        dataType: type,
        data: data,
        success: callback
      });
    };
  });

  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

let posts = [];

function displayNewMessage(message){
  console.log(posts)
  let elem = document.createElement('div');
        elem.id = message._id
        elem.innerHTML =    `<li class="list-group-item mb-1">
                              <div>
                                <span class="fs-5 messageTitle" id="${message._id}"> </span>
                                <button class="btn btn-primary btn-sm float-start me-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${message._id}">&#10149;</button>
                                <button class="btn btn-danger btn-sm deleteButton float-end" id="${message._id}">Delete</button>
                                <button class="btn btn-secondary btn-sm editButton float-end" id="${message._id}">Edit</button>
                             </div>
                             <div class="collapse show collapse-message border-top border-1 mt-1" id="collapse${message._id}">
                              <div class="messageMessage" id="${message._id}">${message.message}</div>
                             </div>
                             </li>`;
        document.getElementById('posts').appendChild(elem);
        addDeleteButtonLogic(message._id);
        addEditButtonLogic(message._id);
        updateTitle(message)
}

function updateTitle(message){
  let diff = 0;
  if(message.lastModifyDate){
    modify = new Date(message.lastModifyDate);
    diff = Math.floor((new Date() - modify) / 1000 / 60);
    if (diff > 59){
      min = diff % 60;
      hour = Math.floor(diff / 60);
      $( `#${message._id}.messageTitle` ).html(`${message.title} <span class="fst-italic fs-6">(${message.creator}) - ${message.createdAt.substring(3, 21)} - modified ${hour}h${min}min ago</span>`);
    } else {
      $( `#${message._id}.messageTitle` ).html(`${message.title} <span class="fst-italic fs-6">(${message.creator}) - ${message.createdAt.substring(3, 21)} - modified ${diff}min ago</span>`);
    }
  } else {
    diff = Math.floor((new Date() - new Date(message.createdAt)) / 1000 / 60);
    if (diff > 59){
      min = diff % 60;
      hour = Math.floor(diff / 60);
      $( `#${message._id}.messageTitle` ).html(`${message.title} <span class="fst-italic fs-6">(${message.creator}) - ${message.createdAt.substring(3, 21)} - created ${hour}h${min}min ago</span>`);
    } else {
      $( `#${message._id}.messageTitle` ).html(`${message.title} <span class="fst-italic fs-6">(${message.creator}) - ${message.createdAt.substring(3, 21)} - created ${diff}min ago</span>`);
    }
  }
}

function addDeleteButtonLogic(id){
  $( `#${id}.deleteButton` ).click(function(el) {
    $.delete( `/posts/${id}`);
  });
}

function deleteMessage(id) {
  document.getElementById(id).remove()
}

function addEditButtonLogic(id){
  $( `#${id}.editButton` ).click(function(el) {
    if ( $( `#collapse${id}` ).hasClass('show') != true){
      $( `#collapse${id}` ).addClass("show");
    }
    let divHtml = $(`#${id}.messageMessage`).html().replace(/<br>/g, '\n');
    let nbLines = 0;
    if(divHtml.match(/\n/g)) {
      nbLines = divHtml.match(/\n/g).length; 
    }
    let editableText = $(`<textarea class="form-control messageMessage" id="${id}" rows="${nbLines + 3}" />`);
    editableText.val(divHtml);
    $(`#${id}.messageMessage`).replaceWith(editableText);
    editableText.focus();
    editableText.blur(updateEditedMessage);
  });
}

async function updateEditedMessage(){
  let id = $(this)[0].id
  var text = $(this).val().replace(/\n/g, "<br />");
  let das = $( "#das" ).val()
  await $.put( `/posts/${id}`, { "lastModifiedBy": das, "lastModifyDate": Date(), "message": text});
  var divText = $(`<div class="messageMessage" id="${id}">`);
  divText.html(text);
  $(this).replaceWith(divText);
}

//INIT
fetch('/posts')
.then(response => response.json())
.then(response => posts = response)
.then(() => {
    posts.forEach(element => displayNewMessage(element));
})
.catch(error => alert("Erreur : " + error));

//POST new message
$( "#submitButton" ).click(function(event) {
    event.preventDefault();
    let creator = $( "#das" ).val()
    let title = $( "#newTitle" ).val()
    let message = $( "#newMessage" ).val()
    if(creator && title && message){
      $.post( "/posts", { "creator": creator, "title": title, "message": message} );
    } else {
      alert('Please enter all required fields');
    }
});

//Action on new message received
socket.on('new message', function(msg) {
    console.log('SocketIO : new message')
    displayNewMessage(msg)
});

socket.on('deleted message', function(msg) {
  console.log('SocketIO : deleted message')
  msg = JSON.parse(msg)
  deleteMessage(msg.id)
});

socket.on('updated message', function(msg) {
  $( `#${msg._id}.messageMessage` ).html(msg.message);
  updateTitle(msg)
})


//DAS save and load functions
$( "#saveDas" ).click(function(event) {
  let das = $( "#das" ).val()
  document.cookie = `das=${das}`;
  event.preventDefault();
})

$( document ).ready(function() {
  let das = getCookie("das");
  $( "#das" ).val(das);
});

//Auto Update Title every minute
setInterval(function() {
  posts.forEach(message => updateTitle(message))
}, 60 * 1000);