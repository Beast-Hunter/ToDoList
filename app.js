const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Amrit:guramrit2003@cluster.fddqvf2.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model("Item",itemsSchema);

const buyFood = new Item({
  name: "Buy Food"
});

const getFood = new Item({
  name: "Get Food"
});

const eatFood = new Item({
  name: "Eat Food"
});
 
const defaultItems = [buyFood, getFood, eatFood];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}).then((items)=>{
  if(items.length === 0) {
    Item.insertMany(defaultItems).then(()=>{
      console.log("Items were added successfully");
    }).catch((err)=>{
      console.log(err);
    });
    res.redirect("/");
  } else {
    res.render("list", {listTitle: "Today", newListItems: items});
  }
  });
});


app.get("/:customListName",function(req,res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }).then((exists)=>{
    if(!exists){
      const list = new List ({
        name: customListName,
        items: defaultItems
      });
    
      list.save();

      res.redirect("/" + customListName);
    } else {
      res.render("list", {
        listTitle: exists.name,
        newListItems: exists.items
      })
    }
  }).catch((Err)=>{
    console.log(Err);
  });

  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName,
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }).then((exists)=>{
      exists.items.push(item);
      exists.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox; 
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId).then(()=>{
      console.log("Success");
      res.redirect("/");
    }).catch((err)=>{
      console.log(err);
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(()=>{
      res.redirect("/" + listName);
    }).catch((err)=>{
      console.log(err);
    });
  }
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
