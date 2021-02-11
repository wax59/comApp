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

let posts;

function displayNewMessage(message){
  let elem = document.createElement('div');
        elem.id = message._id
        elem.innerHTML =    `<li class="list-group-item">
                             <div class="messageTitle" id="${message._id}"> ${message.title} (${message.creator}) 
                                <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${message._id}">&#10149;</button>
                             </div>
                             <div class="collapse show collapse-message" id="collapse${message._id}">
                              <div class="messageMessage" id="${message._id}">${message.message}</div>
                              <div><button class="btn btn-secondary editButton" id="${message._id}">Edit</button>
                              <button class="btn btn-danger deleteButton" id="${message._id}">Delete</button></div>
                             </div>
                             </li>`;
        document.getElementById('posts').appendChild(elem);
        addDeleteButtonLogic(message._id);
        addEditButtonLogic(message._id);
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
    $( `#${id}.messageMessage` )
    var divHtml = $(`#${id}.messageMessage`).html().replace(/<br>/g, '\n');
    //var editableText = $(`<textarea class="messageMessage" id="${id}" />`);
    var editableText = $(`<textarea class="form-control messageMessage" id="${id}" rows="3" />`);
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
})

$( "#saveDas" ).click(function(event) {
  console.log('here')
  let das = $( "#das" ).val()
  document.cookie = `das=${das}`;
  event.preventDefault();
  console.log('here2')
})

$( document ).ready(function() {
  let das = getCookie("das");
  console.log(das)
  $( "#das" ).val(das);
});