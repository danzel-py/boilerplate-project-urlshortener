require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose')
const { reset } = require('nodemon');
var num = 1

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const urlData = mongoose.model("urlData", {
  url: { type: String },
  code: { type: Number, required: true},
  name: {type: String},
  count: {type: Number}

})

const incr = () =>{
  urlData.findOneAndUpdate({'name': 'counter'}, {$inc : {'count' : 1}},{new: true},(err,data)=>{
    if (err) return console.log(err)
    console.log(data)
  })
}

const getNum = (req,res,next) => {
  urlData.findOne({ name: 'counter' }).select(['count']).exec((err, count) => {
    if (err) return console.log(err)
    num = count.toObject().count
  })
  next()
}


app.use(cors());

app.use(express.urlencoded())

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});



app.route('/api/shorturl/new')
  .post((req, res) => {
    let regex = /^https?:\/\//
    if (regex.test(req.body.url) === true) {
      urlData.findOne({ name: 'counter' }).select(['count']).exec(async (err, count) => {
        if (err)
          return console.log(err);
        num = await count.toObject().count;
        console.log('num now' + num);
      })
      incr()// to increment the counter
      urlData.create({ url: req.body.url, code: num }, (err) => {
        if (err)
          console.log(err);
      })
      res.send({ original_url: req.body.url, short_url: num })
    }
    else {
      res.send({ error: 'Invalid URL' })
    }
    console.log('Data Sent')
  })

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});


      /* urlData.deleteMany({url: req.body.url}).then(function(){ 
        console.log("Data deleted"); // Success 
    }).catch(function(error){ 
        console.log(error); // Failure 
    });  */ 
