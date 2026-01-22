require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/db');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware');

const app = express();

// CORS configuration
// app.use(cors({
//   origin: [
//     process.env.FRONTEND_URL,
//     "http://localhost:5173"
//   ],
//   credentials: true
// }));

app.use(cors({
  origin: true,
  credentials: true
}));


// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api', routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Test database connection
  await testConnection();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
