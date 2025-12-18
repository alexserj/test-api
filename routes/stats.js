const express = require('express');
const router = express.Router();
const { pushToElasticsearch } = require('../utils/elasticsearch');

// /stats controller
async function handleStats(req, res) {
  try {
    // Determine index based on origin
    const origin = req.get('origin');
    let index = process.env.ELASTIC_INDEX;
    if (origin === 'https://test-lake-chi-94.vercel.app' || origin === 'https://test-roan-xi-33.vercel.app') {
      index = 'camera-analytics-staging';
    } else if (origin === 'https://libre-cyan.vercel.app') {
      index = 'libre-analitycs';
    } else if (origin === 'https://dg-fresh.vercel.app') {
      index = 'dg-fresh-analitycs';
    } else if (origin === 'https://dg-bold.vercel.app') {
      index = 'dg-bolt-analitycs'
    }

    const esResponse = await pushToElasticsearch(req.body, index);
    console.log('Elasticsearch response status:', esResponse.status);
    console.log('Elasticsearch response data:', esResponse.data);
    res.status(200).json({ success: true, result: esResponse.data });
  } catch (err) {
    console.error('Elasticsearch error:', err);
    res.status(500).json({ error: 'Failed to push to Elasticsearch' });
  }
}

router.post('/', handleStats);

module.exports = router;
