

// Load environment variables
require('dotenv').config();

// Core dependencies
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');


const app = express();
const PORT = process.env.PORT || 3001;
app.use(morgan('dev'));

// CORS setup
const allowedOrigins = (process.env.ALLOWED_ORIGIN || '*')
  .split(',')
  .map(origin => origin.trim());
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// OPTIONS handler
app.options('/stats', (req, res) => res.sendStatus(200));
app.options('/upload', (req, res) => res.sendStatus(200));
app.options('/create-index', (req, res) => res.sendStatus(200));


// --- Route Handlers ---


// Use split route files
app.use('/stats', require('./routes/stats'));
app.use('/upload', require('./routes/upload'));
app.use('/create-index', require('./routes/createIndex'));

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Middleware listening on port ${PORT}`);
});
