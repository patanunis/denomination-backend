const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const denominationRoutes = require('./routes/denominationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

console.log("🟡 Starting backend server...");

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/denomination', denominationRoutes);

// ✅ Health check
app.get('/', (req, res) => res.send('✅ Backend is running!'));
app.get('/debug', (req, res) => res.json({ message: 'Debug route is working', timestamp: new Date().toISOString() }));

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ Connected to MongoDB");
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
});

// ✅ Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  console.log('🛑 MongoDB disconnected');
  process.exit(0);
});
