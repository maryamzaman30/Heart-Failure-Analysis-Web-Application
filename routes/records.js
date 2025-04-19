// routes/records.js

// Import necessary modules
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// List records route
router.get('/', async (req, res) => {
    try 
    {
        // Query to fetch all records from the 'records' table
        const [records] = await db.query('SELECT * FROM records');
        
        // Render the 'records' page and pass the fetched records as data to the view
        res.render('records', { records });
    } 
    catch (error) 
    {
        // If there is a database error, send a 500 status with an error message
        res.status(500).send('Database Error');
    }
});

// Export the router for use in the main app
module.exports = router;