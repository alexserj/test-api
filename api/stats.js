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

    const esResponse = await axios.post(
      `https://my-elasticsearch-project-dcdffc.es.us-east-1.aws.elastic.cloud:443/camera-analytics/_doc`,
      // `http://localhost:9200/${index}/_doc`,
      stats,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'WkJWbU01a0I3eWVLN0k2bUI0VEg6Ni02clE0LU9kZGZtTmJycVEwTGxjQQ==',
        },
      }
    );
    res.status(200).json({ success: true, result: esResponse.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to push to Elasticsearch' });
  }
}
