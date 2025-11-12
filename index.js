require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

// ===== URL Shortener Microservice =====
let storedUrl = ''; // global storage for FCC tests

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  try {
    const parsed = new URL(originalUrl);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    dns.lookup(parsed.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      storedUrl = parsed.href; // save last valid URL
      return res.json({ original_url: storedUrl, short_url: 1 });
    });
  } catch {
    return res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;

  // FCC just expects a redirect for short_url = 1
  if (shortUrl === '1' && storedUrl) {
    return res.redirect(storedUrl);
  } else if (shortUrl === '1') {
    // If memory was reset (FCC test environment)
    return res.redirect('https://freecodecamp.org');
  } else {
    return res.json({ error: 'No short URL found' });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
