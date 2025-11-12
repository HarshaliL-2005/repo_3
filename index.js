require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// ===== URL Shortener Microservice =====

// In-memory storage
let urls = {};
let counter = 1;

// POST endpoint to shorten a URL
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;

  try {
    const parsedUrl = new URL(originalUrl);

    // Only accept http or https
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return res.json({ error: 'invalid url' });
    }

    // Validate hostname using DNS lookup
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      } else {
        // Store and return the shortened URL
        const shortUrl = counter++;
        urls[shortUrl] = originalUrl;
        res.json({ original_url: originalUrl, short_url: shortUrl });
      }
    });
  } catch {
    res.json({ error: 'invalid url' });
  }
});

// GET endpoint to redirect
app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = req.params.short_url;
  const originalUrl = urls[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
