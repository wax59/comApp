const express = require('express')
const { MongoClient, ObjectID } = require("mongodb");
const bodyParser = require("body-parser");
const app = express()

const uri = "mongodb://localhost:27017/todoapp";
const client = new MongoClient(uri);
let db,posts = {} 
async function connectDB() {
  try {
    await client.connect();
    db = client.db("todoapp")
    await db.command({ ping: 1 });
    console.log("Connected successfully to server");
    posts = db.collection("posts")
  } catch {
    console.dir
  }
}
connectDB()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(8079, () => {
  console.log('Serveur listening on port 8079')
})

app.get('/posts', async (req,res) => {
  posts.find({}, function(err, result) {
    if (err) throw err;
    res.send(JSON.stringify(result));
  });
})

app.get('/posts/:id', (req,res) => {
  posts.findOne({"_id": new ObjectID(req.params.id)}, function(err, result) {
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
  res.send(`{"title" : ${title}}, "message" : ${message}}`)
})