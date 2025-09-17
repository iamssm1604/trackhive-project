// 1. Import the express library
const express = require('express');

// 2. Create an instance of an Express application
const app = express();

// 3. Define the port number
// It will use the port from an environment variable, or default to 5000
const PORT = process.env.PORT || 5000;

// 4. Create a basic "route"
// This defines what happens when a user visits the main URL of our server
app.get('/', (req, res) => {
  res.send('Hello, World! The TrackHive API is running!');
});

// 5. Start the server and make it listen for incoming requests
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});