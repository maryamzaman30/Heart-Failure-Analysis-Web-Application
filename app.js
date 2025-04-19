// app.js

// Import necessary modules
const express = require('express'); // Express framework to handle routing and HTTP requests
const path = require('path'); // Path module to manage and manipulate file paths
const bodyParser = require('body-parser'); // Middleware to parse incoming request bodies
const app = express(); // Create an Express app instance

// Database connection
const db = require('./config/db'); // Import database configuration (assuming it is set up in './config/db.js')

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies (e.g., form data)
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (CSS, JS, images) from 'public' directory
app.set('view engine', 'ejs'); // Set EJS as the template engine to render dynamic HTML
app.set('views', path.join(__dirname, 'views')); // Set the views folder where EJS files are stored

// Routes
const analysisRouter = require('./routes/analysis'); // Import the router for handling analysis-related routes
app.use('/analysis', analysisRouter); // Mount the analysisRouter on the '/analysis' path

const recordsRouter = require('./routes/records'); // Import the router for handling record-related routes
app.use('/records', recordsRouter); // Mount the recordsRouter on the '/records' path

// Home Route
app.get('/', (req, res) => {
    res.render('index', { title: 'Heart Failure Records' }); // Render the home page ('index.ejs') with a dynamic title
});

// Start the server
const PORT = process.env.PORT || 3000; // Set the port default to 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Start the server