require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;

let db;

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

// get all lessons
app.get('/lessons', async (req, res) => {
  try {
    const lessons = await db.collection('lessons').find({}).toArray();
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch lessons' });
  }
});

// save new order
app.post('/orders', async (req, res) => {
  try {
    const { name, phone, lessonIDs, space } = req.body;
    const order = { name, phone, lessonIDs, space, date: new Date() };
    const result = await db.collection('orders').insertOne(order);
    res.status(201).json({ message: 'Order submitted', orderId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Could not save order' });
  }
});

// connect to database and start server
async function start() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    db = client.db(DB_NAME);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
}

start();
