const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const dotenv = require("dotenv");
dotenv.config();
const url = process.env.MONGODB;
const port = process.env.PORT;

const noteSchema = new Schema({
  text: String,
  priority: String,
  createdAt: Date,
  updatedAt: Date,
});

noteSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

noteSchema.set("toJSON", {
  virtuals: true,
});

const Note = mongoose.models.Note
  ? mongoose.model("Note")
  : mongoose.model("Note", noteSchema);

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("MONGODB CONNECTED");
});

app.use(express.static("build"));
app.use(express.json());

app.post("/notes", function (req, res) {
  const note = new Note(req.body);
  note.save().then((doc) => {
    res.json(doc);
  });
});

app.get("/notes", function (req, res) {
  Note.find({})
    .sort({ updatedAt: "desc" })
    .then((docs) => {
      res.json(docs);
    });
});

app.put("/notes/:id", function (req, res) {
  Note.findOneAndReplace({ _id: req.params.id }, req.body, {
    returnDocument: "after",
  }).then((doc) => {
    res.json(doc);
  });
});

app.delete("/notes/:id", function (req, res) {
  Note.findByIdAndDelete({ _id: req.params.id }).then((doc) => {
    res.json(doc);
  });
});

app.listen(port, function () {
  console.log("server started at :", port);
});
