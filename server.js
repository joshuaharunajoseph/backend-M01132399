require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// enable cors and parse json body
app.use(cors());
app.use(express.json());

// logger middleware: logs incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// static image middleware: returns image file or error if missing
app.get('/images/:imageName', (req, res) => {
  const imagePath = path.join(__dirname, 'public', 'images', req.params.imageName);
  fs.access(imagePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.sendFile(imagePath);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
