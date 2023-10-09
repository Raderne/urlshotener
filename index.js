require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require("dns")
const urlParser = require("url");
const mongoose = require("mongoose");
const app = express();

const urlModel = require("./model");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post("/api/shorturl", (req, res) => {
  const urlBody = req.body.url;

  const dnsLookup = dns.lookup(urlParser.parse(urlBody).hostname , async (err, address) => {
    if (!address) {
      res.json({ error: 'invalid url' });
    } else {
      const RandomNumber = Math.floor(Math.random() * 10000)
      const urlDoc = {
          original_url : urlBody,
          short_url : RandomNumber
      }
      
      try {
        const result = await urlModel.create(urlDoc);
        
        res.json({
          original_url : urlBody,
          short_url : RandomNumber
        });
        
      } catch (err) {
        res.json({ msg: `failed to insert ${err}` })
      }
    }
  })
})

app.get("/api/shorturl/:urlShort", async (req, res) => {
  const { urlShort } = req.params;

  try {
    const getUrl = await urlModel.findOne({ short_url: urlShort });
    res.redirect(getUrl.original_url);

  } catch (error) {
    console.log(error)
  }
})

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URI).then(() => console.log("connected to db..."));

    app.listen(port, function() {
      console.log(`Listening on port ${port}`);
    });
  } catch (err) {
    console.log(err)
  }
}

start()