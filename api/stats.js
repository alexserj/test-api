export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stats = req.body;

    // Send to Elasticsearch
    const esResponse = await fetch(
      `https://my-elasticsearch-project-dcdffc.es.us-east-1.aws.elastic.cloud:443/${index}/_doc`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'WkJWbU01a0I3eWVLN0k2bUI0VEg6Ni02clE0LU9kZGZtTmJycVEwTGxjQQ==',
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
