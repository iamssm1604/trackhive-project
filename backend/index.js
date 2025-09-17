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
// For any URL that starts with /api/organizations
app.use('/api/organizations', require('./routes/organizationRoutes'));

// For any URL that starts with /api/users
app.use('/api/users', require('./routes/userRoutes'));


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});