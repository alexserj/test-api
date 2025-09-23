const express = require('express');
const router = express.Router();
const { createElasticsearchIndex } = require('../utils/elasticsearch');

// /create-index controller
async function handleCreateIndex(req, res) {
  const { index, settings } = req.body;
  if (!index) {
    return res.status(400).json({ error: 'Index name required' });
  }
  try {
    const esResponse = await createElasticsearchIndex(index, settings || {});
    res.status(esResponse.status).json(esResponse.data);
  } catch (err) {
    console.error('Create index error:', err);
    res.status(500).json({ error: 'Failed to create index' });
  }
}

router.post('/', handleCreateIndex);

module.exports = router;
