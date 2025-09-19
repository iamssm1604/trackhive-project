const express = require('express');
const connectDB = require('./config/db');

connectDB();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('TrackHive API is alive and running...');
});

// --- Define Routes ---
app.use('/api/organizations', require('./routes/organizationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/issues', require('./routes/issueRoutes')); // <-- ADD THIS
app.use('/api/teams', require('./routes/teamRoutes'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});