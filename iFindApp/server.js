const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');
const notificationRoutes = require('./routes/notificationRoutes'); // <-- ADD THIS LINE

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: "API is healthy" });
});

// Mount all your route handlers with /api prefix
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/notifications', notificationRoutes); // <-- AND ADD THIS LINE

// Default route or health check (optional)
app.get('/', (req, res) => {
  res.send('Lost and Found API running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});