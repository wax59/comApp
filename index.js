const express = require('express')
const { MongoClient, ObjectID } = require("mongodb");

const app = express()
const http = require('http').Server(app);
const io = require('socket.io')(http);

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")

const uri = "mongodb://localhost:27017/todoapp";
const client = new MongoClient(uri);

let db,posts = {} 
async function connectDB() {
  try {
    await client.connect();
    db = client.db("todoapp")
    await db.command({ ping: 1 });
    console.log("Connected successfully to Mongo");
    posts = db.collection("posts")
  } catch {
    console.dir
  }
}
connectDB()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('front'));

http.listen(8079, () => {
  console.log('Serveur listening on port 8079')
})

app.get('/posts',  (req,res) => {
  posts.find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result)
    res.send(result);
  });
})

app.get('/posts/:id', async (req,res) => {
  await posts.findOne({"_id": new ObjectID(req.params.id)}, function(err, result) {
    if (err) throw err;
    res.send(result);
  });
})

app.post('/posts', async (req,res) => {
  console.log(req.body)
  let title = req.body.title;
  let message = req.body.message;
  await posts.insertOne({
    title: title,
    message: message
  });
  await posts.findOne({"title": title, "message": message}, function(err, result) {
    if (err) throw err;
    if (result) {
      res.send(result);
      io.emit('new message', result);
    } else {
      res.send("{\"status\" : \"error\"}")
    }
  });
})

app.put('/posts/:id', (req,res) => {
  let title = req.body.title;
  let message = req.body.message;
  posts.updateOne({"_id": new ObjectID(req.params.id)}, {$set: {"title": title, "message": message}}, function(err, result) {
    if (err) throw err;
    result ? res.send("{\"status\" : \"ok\"}") : res.send("{\"status\" : \"error\"}")
  })
})

app.delete('/posts/:id', (req,res) => {
  posts.deleteOne({"_id": new ObjectID(req.params.id)}, function(err, result) {
    if (err) throw err;
    console.log(result)
    result.deletedCount ? res.send("{\"status\" : \"ok\"}") : res.send("{\"status\" : \"error\"}")
  })
})

io.on('connection', (socket) => {
  console.log('SocketIO : new user connected');
});