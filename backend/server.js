const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const authRoutes = require('./routes/auth');
const billRoutes = require('./routes/bills');



// Load env vars
dotenv.config();
console.log("MONGO_URI:", process.env.MONGO_URI);
const app = express();

// ================= MIDDLEWARE =================

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (safe for deployment)
app.use(cors({
  origin: true,
  credentials: true
}));

// ================= DATABASE =================

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

connectDB();

// ================= ROUTES =================

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/bills', billRoutes);

// Test route
app.get('/api', (req, res) => {
  res.json({
    message: 'API is running successfully'
  });
});

// ================= FRONTEND =================

// Serve React build
app.use(express.static(path.join(__dirname, '../build')));

// Handle all non-API routes (React routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// ================= ERROR HANDLING =================

// 404 handler (only for API if needed)
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: err.message
  });
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});