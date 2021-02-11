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

let posts;

function displayNewMessage(message){
  console.log(message)
  let elem = document.createElement('div');
        elem.id = message._id
        elem.innerHTML =    `<div class="messageTitle" id="${message._id}">${message.title} (${message.creator})</div>
                             <div class="messageMessage" id="${message._id}">${message.message}</div>
                             <div><button class="editButton" id="${message._id}">Edit</button>
                             <button class="deleteButton" id="${message._id}">Delete</button></div>`;
        document.body.appendChild(elem);
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
    var editableText = $(`<textarea class="messageMessage" id="${id}" />`);
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
$( "#submitMessage" ).click(function() {
    let creator = $( "#das" ).val()
    let title = $( "#newTitle" ).val()
    let message = $( "#newMessage" ).val()
    $.post( "/posts", { "creator": creator, "title": title, "message": message} );
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