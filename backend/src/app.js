const express = require('express');
const cors = require('cors');

require('./config/db'); // DB connection
const routes = require('./routes');

const app = express();

/* ============================
   GLOBAL MIDDLEWARES
============================ */

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

/* 
   REQUEST LOGGER
 */
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

/* 
   ROUTES
 */
// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

/* 
   ROUTES
 */
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api', routes);

/* 
   HEALTH CHECK / TEST
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'Sanjeevani API running' });
});

module.exports = app;
