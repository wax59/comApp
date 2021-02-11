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
        elem.innerHTML =    `${message.title} (${message.creator})<br>
                             ${message.message} <br>
                            <button class="deleteButton" id="${message._id}">Delete</button>`;
        document.body.appendChild(elem);
        $( `#${message._id}.deleteButton` ).click(function(el) {
            let id = $( `#${message._id}` ).attr('id')
            $.delete( `/posts/${message._id}`);
        });
}

function deleteMessage(id) {
  document.getElementById(id).remove()
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