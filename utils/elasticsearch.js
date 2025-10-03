// Elasticsearch helpers
const axios = require('axios');


const getElasticsearchUrl = (index) => {
  const idx = index || process.env.ELASTIC_INDEX;
  return `${process.env.ELASTIC_URL}/${idx}/_doc`;
};

const elasticsearchHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': process.env.ELASTIC_AUTH,
});


async function pushToElasticsearch(stats, index) {
  const esUrl = getElasticsearchUrl(index);
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
