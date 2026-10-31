require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing.');
  if (require.main === module) process.exit(1);
}

const app = express();

const allowedOrigins = (
  process.env.CLIENT_URL || 'http://localhost:5173,http://127.0.0.1:5173'
)
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Connect to MongoDB before handling API requests.
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PlaceMate Backend is Running'
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'PlaceMate API is running'
  });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/applications', require('./routes/applicationRoutes'));

app.use(notFound);
app.use(errorHandler);

// Local development only.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`PlaceMate API running at http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Could not connect to MongoDB:', err.message);
      process.exit(1);
    });
}

// Vercel uses the exported Express application.
module.exports = app;