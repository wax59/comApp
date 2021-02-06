let posts;

//INIT
fetch('/posts')
.then(response => response.json())
.then(response => posts = response)
.then(() => {
    posts.forEach(element => {
        let elem = document.createElement('div');
        elem.innerHTML = `${element.title} <br> ${element.message}`;
        document.body.appendChild(elem);
    });
})
.catch(error => alert("Erreur : " + error));

//POST new message
$( "#submitMessage" ).click(function() {
    let title = $( "#newTitle" ).val()
    let message = $( "#newMessage" ).val()
    $.post( "/posts", { "title": title, "message": message} );
});

//Action on new message received
socket.on('new message', function(msg) {
    let elem = document.createElement('div');
    elem.innerHTML = `${msg.title} <br> ${msg.message}`;
    document.body.appendChild(elem);
});