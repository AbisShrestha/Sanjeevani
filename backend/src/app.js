const express = require('express');
const cors = require('cors');

require('./config/db'); // DB connection
const routes = require('./routes');

const app = express();

// Middleware setup


app.use(cors());


app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});


// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

/* 
   ROUTES
 */
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api', routes);


app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Sanjeevani Backend: LATEST_VERSION_LIVE!' });
});
// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route Not Found: ${req.method} ${req.originalUrl}` 
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url}`, err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

module.exports = app;
