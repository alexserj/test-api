const express = require('express');
const router = express.Router();
const { pushToElasticsearch } = require('../utils/elasticsearch');

// /stats controller
async function handleStats(req, res) {
  try {
    let body = { ...req.body };
    if (typeof body.parameters === 'string') {
      try {
        body.parameters = JSON.parse(body.parameters);
      } catch (parseErr) {
        return res.status(400).json({ error: 'Invalid JSON in parameters field' });
      }
    }
    const esResponse = await pushToElasticsearch(body);
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
