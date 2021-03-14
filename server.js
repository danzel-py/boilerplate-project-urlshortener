require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose')
const { reset } = require('nodemon');

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

const urlData = mongoose.model("urlData", {
  url: { type: String },
  code: { type: Number, required: true },
  name: { type: String },
  count: { type: Number }

})

const incr = () => {
  urlData.findOneAndUpdate({ 'name': 'counter' }, { $inc: { 'count': 1 } }, { new: true }, (err, data) => {
    if (err) return console.log(err)
  })
}

const getNum = () => {
  urlData.findOne({ name: 'counter' }).select(['count']).exec(async (err, data) => {
    if (err)
      return console.log(err);
    var num = await data.toObject().count;
    console.log('next count  ====== ' + num);
  })
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

app.get('/api/shorturl/:code', (req,res)=>{
  urlData.findOne({code: req.params.code}).select(['url']).exec((err,data)=>{
    if(err) return console.log(err)
    res.redirect(data.toObject().url)
  })
})


app.route('/api/shorturl/new')
  .post((req, res) => {
    urlData.findOne({ name: 'counter' }).select(['count']).exec( (err, data) => {
      if (err) return console.log(err)
      var num =  data.toObject().count
      console.log('next count  ====== ' + num)
      let regex = /^https?:\/\//
      if (regex.test(req.body.url) === true) {
        incr()// to increment the counter
        urlData.create({ url: req.body.url, code: num }, (err) => {
          if (err)
            console.log(err);
        })
        res.send({ original_url: req.body.url, short_url: num })
        console.log('Data Sent')
      }
      else {
        res.send({ error: 'Invalid URL' })
      }
    })
  })

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});


/* urlData.deleteMany({url: req.body.url}).then(function(){
  console.log("Data deleted"); // Success
}).catch(function(error){
  console.log(error); // Failure
});  */
