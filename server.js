const express = require('express');
const https = require("https");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/testing1', function() {
  console.log("Database is connected successfully. ");
});
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//defing the taskSchema which accepts a string as task to do
const taskSchema = new mongoose.Schema({
  todo: String
});


const work = mongoose.model('Work', taskSchema);

const item1 = new work({
  todo: "hello"
});

const item2 = new work({
  todo: "tello"
});

const defItems = [item1, item2];
const customSchema = new mongoose.Schema({
  name: String,
  items: [taskSchema]
})

const customItems = mongoose.model('Custom', customSchema);

//getting request at root '/' route.
app.get("/", function(req, res) {
  // let month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  // let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  // let today = new Date();
  // let i = today.getDate();
  // let j = today.getMonth();
  // let k = today.getDay();
  // let z = (days[k]) + ", " + (month[j]) + " " + i;
      let z= "Today";
  work.find({}, function(err, fnd) {
    res.render("list", {x: z,newItem: fnd});
  });
});

//dynamically creating get for requests.
app.get('/:listName', function(req, res) {
  const customListName = req.params.listName;
  customItems.find({name: customListName}, function(err, fnd) {
    if (fnd.length === 0) {
      const q = new customItems({
        name: customListName,
        items: defItems
      })
      q.save();
      res.redirect("/" + customListName);
    } else {
      //console.log(fnd[0].items);
      res.render("list", {x: customListName, newItem: fnd[0].items});
    }
  });

})

{ //adding a new workitem to the database upon getting a post request.
  //the input comes from ejs file and is saved in req.body.w
  // And then redirecting to home route so as to render it.
}

app.post("/", function(req, res) {
  const workitem = new work({
    todo: req.body.w
  })
  if (req.body.button==="Today"){
    workitem.save();
    res.redirect("/");
  } else {

    customItems.findOne({name: (req.body.button)}, function(err, fnd) {
      fnd.items.push(workitem);
      fnd.save();
      //console.log(fnd);
      res.redirect("/"+(req.body.button));
    })

  }
})

//deleting when we get delete request upon clicking the checkbox

app.post("/delete", function(req, res) {
  //here if block checks if delete is called on the '/' route
  //or thecustom route defined by list params.
  if (req.body.e==="Today"){
    work.deleteOne({_id: req.body.checkBox}, function(err) {
      if (err) return handleError(err);
    });
    res.redirect("/");
  } else {
    customItems.findOneAndUpdate({name:req.body.e}, {$pull: {items:{_id: req.body.checkBox}}}, function(err, foundList){
      if (!err){
        res.redirect("/"+(req.body.e));
      }
    })
  }
})

// to listen
app.listen(4000, function() {
  console.log("you are being heard");
})
