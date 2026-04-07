const express = require('express');
const router = express.Router();
const { pushToElasticsearch } = require('../utils/elasticsearch');

// /stats controller
async function handleStats(req, res) {
  try {
    // Combine X-App-Variant header and origin checks
    const appVariant = req.get('X-App-Variant');
    const origin = req.get('origin');
    let index = process.env.ELASTIC_INDEX;
    // Approved origins for each variant
    const mainOrigins = [
      'https://dg-bold.vercel.app'
    ];
    const mobileOrigins = [
      'https://dg-bold-mobile.vercel.app',
      'https://boldlooksaigenerator.dolcegabbana.com'
    ];
    if (appVariant === 'main' && mainOrigins.includes(origin)) {
      index = 'dg-bolt-analitycs';
    } else if (appVariant === 'mobile' && mobileOrigins.includes(origin)) {
      index = 'dg-bold-mobile-analitycs';
    } else if (!appVariant) {
      // fallback to origin logic for legacy support
      if (origin === 'https://test-lake-chi-94.vercel.app' || origin === 'https://test-roan-xi-33.vercel.app') {
        index = 'camera-analytics-staging';
      } else if (origin === 'https://libre-cyan.vercel.app') {
        index = 'libre-analitycs';
      } else if (origin === 'https://dg-fresh.vercel.app') {
        index = 'dg-fresh-analitycs';
      } else if (mainOrigins.includes(origin)) {
        index = 'dg-bolt-analitycs';
      } else if (origin === 'https://dg-fresh-mobile.vercel.app' || origin === 'https://ailipswardrobe.dolcegabbana.com') {
        index = 'dg-fresh-mobile-analitycs';
      } else if (mobileOrigins.includes(origin)) {
        index = 'dg-bold-mobile-analitycs';
      }
    } else {
      // If header is present but origin is not approved, fallback or reject
      return res.status(403).json({ error: 'Origin not approved for this variant' });
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
