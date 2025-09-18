require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const morgan = require('morgan');


const app = express();
const PORT = process.env.PORT || 3001;
app.use(morgan('dev'));

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
  const index = 'camera-analytics';
  const esUrl = `https://my-elasticsearch-project-dcdffc.es.us-east-1.aws.elastic.cloud:443/${index}/_doc`;
  try {
    const esResponse = await axios.post(
      esUrl,
      stats,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'WkJWbU01a0I3eWVLN0k2bUI0VEg6Ni02clE0LU9kZGZtTmJycVEwTGxjQQ==',
        },
        validateStatus: () => true // allow all status codes
      }
    );
    console.log('Elasticsearch response status:', esResponse.status);
    console.log('Elasticsearch response data:', esResponse.data);
    res.status(200).json({ success: true, result: esResponse.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to push to Elasticsearch' });
  }
});

app.listen(PORT, () => {
  console.log(`Middleware listening on port ${PORT}`);
});
