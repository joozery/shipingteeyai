const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const deliveryAddressRoutes = require('./routes/deliveryAddressRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const articleRoutes = require('./routes/articleRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', true);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'TEEYAI Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/delivery-addresses', deliveryAddressRoutes);
app.use('/api/admin-users', adminUserRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const startServer = async () => {
  // Test database connection
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    console.error('⚠️  Failed to connect to database. Please check your configuration.');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log('');
    console.log('===========================================');
    console.log(`🚀 TEEYAI Backend Server is running`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log('===========================================');
    console.log('');
  });
};

startServer();

module.exports = app;

