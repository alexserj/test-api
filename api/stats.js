export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); // or specific domain instead of '*'
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    // Preflight request
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stats = req.body;

    const esResponse = await fetch(
      `${process.env.ELASTICSEARCH_URL}/camera-stats/_doc`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization':
            'Basic ' +
            Buffer.from(
              process.env.ELASTICSEARCH_USER + ':' + process.env.ELASTICSEARCH_PASSWORD
            ).toString('base64'),
        },
        body: JSON.stringify(stats),
      }
    );

    const data = await esResponse.json();
    res.status(200).json({ success: true, result: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to push to Elasticsearch' });
  }
}
