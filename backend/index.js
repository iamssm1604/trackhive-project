const express = require('express');
const connectDB = require('./config/db');

connectDB();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json()); // <-- ADD THIS

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('TrackHive API is alive and running...');
});

// Define Routes
app.use('/api/organizations', require('./routes/organizationRoutes')); // <-- ADD THIS

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});