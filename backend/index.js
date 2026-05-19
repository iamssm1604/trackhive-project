const express = require('express');
const cors = require('cors'); // <-- FIXED: Imported CORS
const connectDB = require('./config/db');

// Initialize database connection
connectDB();

const app = express();

// --- Middleware Configuration ---
app.use(cors()); // <-- FIXED: Enabled CORS globally for frontend connections
app.use(express.json()); // Middleware to parse JSON bodies

const PORT = process.env.PORT || 5000;

// Root Health Check Route
app.get('/', (req, res) => {
  res.send('TrackHive API is alive and running...');
});

// --- Define Routes ---
app.use('/api/organizations', require('./routes/organizationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/issues', require('./routes/issueRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));

// Start the server listener
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});