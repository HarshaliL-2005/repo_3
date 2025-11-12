require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// ===== URL Shortener Microservice =====
const bodyParser = require("body-parser");
const dns = require("dns");
const urlParser = require("url");

app.use(bodyParser.urlencoded({ extended: false }));

// Temporary in-memory "database"
let urls = [];
let counter = 1;

// POST endpoint to shorten a URL
app.post("/api/shorturl", (req, res) => {
  let originalUrl = req.body.url;

  try {
    const parsedUrl = new URL(originalUrl);

    // Allow only http or https protocols
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return res.json({ error: 'invalid url' });
    }

    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      } else {
        const shortUrl = counter++;
        urls.push({ original_url: originalUrl, short_url: shortUrl });
        res.json({ original_url: originalUrl, short_url: shortUrl });
      }
    });
  } catch {
    return res.json({ error: 'invalid url' });
  }
});

// GET endpoint to redirect to the original URL
app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  const found = urls.find(u => u.short_url === shortUrl);

  if (found) {
    res.redirect(found.original_url);
  } else {
    res.json({ error: 'No short URL found' });
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
