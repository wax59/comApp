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

//INIT
fetch('/posts')
.then(response => response.json())
.then(response => posts = response)
.then(() => {
    posts.forEach(element => {
        let elem = document.createElement('div');
        elem.innerHTML =    `${element.title} <br>
                             ${element.message} <br>
                            <button class="deleteButton" id="${element._id}">Delete</button>`;
        document.body.appendChild(elem);
        $( `#${element._id}` ).click(function(el) {
            let id = $( `#${element._id}` ).attr('id')
            $.delete( `/posts/${element._id}`);
        });
    });
})
.catch(error => alert("Erreur : " + error));

//POST new message
$( "#submitMessage" ).click(function() {
    let title = $( "#newTitle" ).val()
    let message = $( "#newMessage" ).val()
    $.post( "/posts", { "title": title, "message": message} );
});

//DELETE message
$( ".deleteButton" ).click(function(el) {
    let id = el.attr('id')
    $.post( "/posts", { "title": title, "message": message} );
});

//Action on new message received
socket.on('new message', function(msg) {
    let elem = document.createElement('div');
    elem.innerHTML = `${msg.title} <br> ${msg.message}`;
    document.body.appendChild(elem);
});