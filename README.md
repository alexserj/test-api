# Camera Kit Middleware to Elasticsearch

This Express app acts as a middleware between your camera kit app and Elasticsearch.

## Setup

1. Install dependencies:
   ```sh
   npm install express cors node-fetch dotenv
   ```
2. Copy `.env.example` to `.env` and fill in your values:
   ```sh
   cp .env.example .env
   # Edit .env with your Elasticsearch details
   ```
3. Start the server:
   ```sh
   node server.js
   ```

## Usage

- POST stats to `/stats` endpoint. Example:
  ```sh
  curl -X POST http://localhost:3001/stats \
    -H 'Content-Type: application/json' \
    -d '{"foo": "bar"}'
  ```

- CORS is enabled for the frontend defined in `.env`.

## Environment Variables
- `PORT`: Port to run the server (default: 3001)
- `ALLOWED_ORIGIN`: Allowed CORS origin
- `ELASTIC_URL`: Elasticsearch base URL
- `ELASTIC_INDEX`: Elasticsearch index name
- `ELASTIC_AUTH`: Elasticsearch Basic Auth (Base64)
