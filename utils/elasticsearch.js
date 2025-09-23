// Elasticsearch helpers
const axios = require('axios');

const getElasticsearchUrl = () => {
  const index = process.env.ELASTIC_INDEX;
  return `${process.env.ELASTIC_URL}/${index}/_doc`;
};

const elasticsearchHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': process.env.ELASTIC_AUTH,
});

async function pushToElasticsearch(stats) {
  const esUrl = getElasticsearchUrl();
  return axios.post(esUrl, stats, {
    headers: elasticsearchHeaders(),
    validateStatus: () => true,
  });
}

async function createElasticsearchIndex(index, settings = {}) {
  const url = `${process.env.ELASTIC_URL}/${index}`;
  return axios.put(url, settings, {
    headers: elasticsearchHeaders(),
    validateStatus: () => true,
  });
}

module.exports = {
  pushToElasticsearch,
  createElasticsearchIndex,
};
