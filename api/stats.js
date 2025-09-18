const axios = require('axios');
export default async function handler(req, res) {
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://test-lake-chi-94.vercel.app' // your frontend URL
    // 'http://localhost:9000'
  );
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stats = req.body;
    const esUrl = 'https://my-elasticsearch-project-dcdffc.es.us-east-1.aws.elastic.cloud:443/camera-analytics/_doc';
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
    if (esResponse.status >= 200 && esResponse.status < 300) {
      res.status(200).json({ success: true, result: esResponse.data });
    } else {
      res.status(esResponse.status).json({ success: false, error: esResponse.data });
    }
  } catch (err) {
    console.error('Request to Elasticsearch failed:', err);
    if (err.response) {
      res.status(err.response.status).json({ error: err.response.data });
    } else {
      res.status(500).json({ error: 'Failed to push to Elasticsearch' });
    }
  }
}
