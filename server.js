const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const denominationRoutes = require('./routes/denominationRoutes');

const app = express();

console.log("🟡 Starting backend server...");

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/denomination', denominationRoutes);

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('✅ Backend is running!');
});

// ✅ Debug route to confirm controller wiring
app.get('/debug', (req, res) => {
  res.json({
    message: 'Debug route is working',
    timestamp: new Date().toISOString()
  });
});

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
  });
