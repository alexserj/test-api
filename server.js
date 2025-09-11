require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.options('/stats', (req, res) => {
  res.sendStatus(200);
});

app.post('/stats', async (req, res) => {
  const stats = req.body;
  const index = process.env.ELASTIC_INDEX;
  const esUrl = `${process.env.ELASTIC_URL}/${index}/_doc`;
  try {
    const esResponse = await fetch(esUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.ELASTIC_AUTH,
      },
      body: JSON.stringify(stats),
    });
    const data = await esResponse.json();
    res.status(200).json({ success: true, result: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to push to Elasticsearch' });
  }
});

app.listen(PORT, () => {
  console.log(`Middleware listening on port ${PORT}`);
});
