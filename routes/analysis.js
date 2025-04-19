// routes/analysis.js

// Import necessary modules
const express = require('express');
const db = require('../config/db'); // Database connection
const router = express.Router(); // Router to handle HTTP requests

// For views/causes_most_deaths.ejs ---------------------------------------------------------------------------

// Route to render the 'causes_most_deaths' page
router.get('/causes-most-deaths-page', (req, res) => {
    res.render('causes_most_deaths', { title: 'Causes Most Deaths' });
});

// Fetch death event counts for binary features
router.get('/causes-most-deaths', async (req, res) => {
    try 
    {
        const binaryFeatures = ['anaemia', 'diabetes', 'high_blood_pressure', 'sex', 'smoking']; // List of binary features
        const results = {}; // Object to store query results

        // Loop through each feature and perform SQL query to count death eventss
        for (const feature of binaryFeatures) 
        {
            const query = `
                SELECT 
                    ${feature} AS feature_value,
                    SUM(CASE WHEN death_event = 1 THEN 1 ELSE 0 END) AS death_count
                FROM records
                GROUP BY ${feature};
            `;
            const [rows] = await db.query(query); // Execute query and fetch rows
            results[feature] = rows; // Store results for each feature
        }

        res.json(results); // Return the results as JSON
    } catch (error) {
        console.error('Error fetching data for causes most deaths:', error);
        res.status(500).send('Database Error. Please check server logs for details.');
    }
});

// For views/serum-creatinine-ejection-fraction.ejs ------------------------------------------------------------

// Route to render the 'serum-creatinine-ejection-fraction' page
router.get('/serum-creatinine-ejection-fraction', (req, res) => {
    // Render the page 'serum-creatinine-ejection-fraction' and pass a title for the page
    res.render('serum-creatinine-ejection-fraction', { title: 'Serum Creatinine vs Ejection Fraction' });
});

// API Route to fetch data for the scatter plot
router.get('/scatter-data', async (req, res) => {
    try 
    {
        // SQL query to select serum creatinine, ejection fraction, and death event from the records table
        // Filters out records where serum creatinine or ejection fraction is null
        const query = `
            SELECT serum_creatinine, ejection_fraction, death_event
            FROM records
            WHERE serum_creatinine IS NOT NULL AND ejection_fraction IS NOT NULL;
        `;
        
        // Execute the query and retrieve the results
        const [results] = await db.query(query);

        // Return the results as a JSON response
        res.json(results);
    } 
    catch (error) 
    {
        // If an error occurs during the query execution, log the error and return a 500 status code with a message
        console.error('Error fetching scatter plot data:', error);
        res.status(500).send('Error fetching scatter plot data');
    }
});

// For views/statistics.ejs -------------------------------------------------------------------------

// Route to render 'statistics' page and fetch statistics from the database
router.get('/statistics', async (req, res) => {
    try {
        // SQL query to fetch overall statistics from the 'records' table
        const query = `
            SELECT 
                AVG(age) AS avg_age, MIN(age) AS min_age, MAX(age) AS max_age, COUNT(*) AS total_records,
                AVG(creatinine_phosphokinase) AS avg_creatinine_phosphokinase,
                MIN(creatinine_phosphokinase) AS min_creatinine_phosphokinase,
                MAX(creatinine_phosphokinase) AS max_creatinine_phosphokinase,
                AVG(ejection_fraction) AS avg_ejection_fraction,
                MIN(ejection_fraction) AS min_ejection_fraction,
                MAX(ejection_fraction) AS max_ejection_fraction,
                AVG(platelets) AS avg_platelets, MIN(platelets) AS min_platelets, MAX(platelets) AS max_platelets,
                AVG(serum_creatinine) AS avg_serum_creatinine, MIN(serum_creatinine) AS min_serum_creatinine,
                MAX(serum_creatinine) AS max_serum_creatinine, AVG(serum_sodium) AS avg_serum_sodium,
                MIN(serum_sodium) AS min_serum_sodium, MAX(serum_sodium) AS max_serum_sodium,
                SUM(death_event) AS total_deaths,
                AVG(death_event) AS avg_death_rate
            FROM records;
        `;

        // Execute the query and store the result in 'overallResults'
        const [overallResults] = await db.query(query);

        // Extract the first row of the result (since we are only getting one row of statistics)
        const stats = overallResults[0];

        // Ensure all values are numbers (if not null), convert to float for consistency
        Object.keys(stats).forEach(key => {
            stats[key] = stats[key] !== null ? parseFloat(stats[key]) : null;
        });

        // SQL query to fetch grouped death rate statistics by age group
        const groupRateQuery = `
            SELECT 
                CASE 
                    WHEN age < 55 THEN 'Young (< 55)'
                    WHEN age >= 55 AND age < 70 THEN 'Elderly (>= 55 & < 70)'
                    ELSE 'Old (>= 70)'
                END AS age_group,
                COUNT(*) AS total_in_group,
                SUM(death_event) AS deaths_in_group,
                SUM(death_event) / COUNT(*) AS death_rate
            FROM records
            GROUP BY age_group
            ORDER BY death_rate DESC;
        `;
        // Execute the query and store the result in 'groupRatesRaw'
        const [groupRatesRaw] = await db.query(groupRateQuery);

        // Clean up the group rate data by ensuring all values are numbers (if not null)
        const groupRates = groupRatesRaw.map(group => ({
            age_group: group.age_group,
            total_in_group: group.total_in_group !== null ? parseInt(group.total_in_group) : null,
            deaths_in_group: group.deaths_in_group !== null ? parseInt(group.deaths_in_group) : null,
            death_rate: group.death_rate !== null ? parseFloat(group.death_rate) : null,
        }));

        // Determine the maximum and minimum death rates from the grouped data
        const maxDeathRate = groupRates.length > 0 ? Math.max(...groupRates.map(g => g.death_rate || 0)) : null;
        const minDeathRate = groupRates.length > 0 ? Math.min(...groupRates.map(g => g.death_rate || 0)) : null;

        // Add max and min death rates to the overall statistics
        stats.max_death_rate = maxDeathRate;
        stats.min_death_rate = minDeathRate;

        // Render the 'statistics' page with the statistics data and group rate data
        res.render('statistics', { 
            title: 'Statistics', // Title for the page
            stats,  // The overall statistics
            groupRates // The grouped death rate statistics
        });
    } 
    catch (error) 
    {
        // If an error occurs during the query execution, log the error and return a 500 status code with a message
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Error fetching statistics' });
    }
});

// For views/survival-rate-analysis.ejs -------------------------------------------------------------------------

// Route for Survival Rate Analysis Page
router.get('/survival-rate-analysis', (req, res) => {
    // Render the 'survival-rate-analysis' page for displaying survival rate analysis
    res.render('survival-rate-analysis', { title: 'Survival Rate Analysis' });
});

// API Route: Fetch Survival Rate Data based on feature (age_groups, sex, smoking, etc.)
router.get('/survival-rate/:feature', async (req, res) => {
    try 
    {
        // Extract the feature (age_groups, sex, smoking, etc.) from the URL parameter
        const { feature } = req.params;
        let query;

        // Define different SQL queries based on the selected feature
        if (feature === 'age_groups') 
        {
            // If the feature is 'age_groups', categorize ages and calculate survival rate
            query = `
                SELECT 
                    CASE 
                        WHEN age < 55 THEN 'Young (< 55)'
                        WHEN age >= 55 AND age < 70 THEN 'Elderly (>= 55 & < 70)'
                        ELSE 'Old (>= 70)'
                    END AS feature_value,
                    (COUNT(*) - SUM(death_event)) / COUNT(*) AS survival_rate
                FROM records
                GROUP BY feature_value;
            `;
        } 
        else if (feature === 'sex') 
        {
            // If the feature is 'sex', calculate survival rate based on male or female
            query = `
                SELECT 
                    CASE 
                        WHEN sex = 1 THEN 'Male'
                        WHEN sex = 0 THEN 'Female'
                    END AS feature_value,
                    (COUNT(*) - SUM(death_event)) / COUNT(*) AS survival_rate
                FROM records
                GROUP BY sex;
            `;
        } 
        else if (feature === 'smoking') 
        {
            // If the feature is 'smoking', calculate survival rate based on smoker or non-smoker
            query = `
                SELECT 
                    CASE 
                        WHEN smoking = 1 THEN 'Smoker'
                        WHEN smoking = 0 THEN 'Non-Smoker'
                    END AS feature_value,
                    (COUNT(*) - SUM(death_event)) / COUNT(*) AS survival_rate
                FROM records
                GROUP BY smoking;
            `;
        } 
        else 
        {
            // For other features, directly use the feature column to calculate survival rate
            query = `
                SELECT 
                    ${feature} AS feature_value,
                    (COUNT(*) - SUM(death_event)) / COUNT(*) AS survival_rate
                FROM records
                GROUP BY ${feature};
            `;
        }

        // Execute the query and fetch the results
        const [results] = await db.query(query);

        // Return the results as a JSON response
        res.json(results);
    } 
    catch (error) 
    {
        // If an error occurs during the query execution, log the error and return a 500 status code with a message
        console.error('Error fetching survival rate data:', error);
        res.status(500).send('Error fetching survival rate data');
    }
});

// For views/survival-rate-trends.ejs -------------------------------------------------------------------------

// Route for the line graph analysis page
router.get('/survival-rate-trends', (req, res) => {
    // Render the 'survival-rate-trends' page to allow the user to analyze survival rate trends based on features
    res.render('survival-rate-trends', { title: 'Survival Rate Trends' });
});

// API Route: Fetch Data for Line Graph based on selected feature
router.get('/line-graph/:feature', async (req, res) => {
    try 
    {
        const { feature } = req.params; // Extract the feature (e.g., age, sex, smoking) from the URL parameter

        // Query to calculate the average death rate for each value of the selected feature
        const query = `
            SELECT ${feature} AS x_value, AVG(death_event) AS y_value
            FROM records
            WHERE ${feature} IS NOT NULL
            GROUP BY ${feature}
            ORDER BY ${feature};
        `;
        const [results] = await db.query(query); // Execute the query and fetch results from the database

        // Format the results into x and y arrays
        const data = {
            xValues: results.map(row => row.x_value), // Extract x-values (feature values) from query results
            yValues: results.map(row => 
                row.y_value !== null ? parseFloat(row.y_value).toFixed(2) : 0 // Ensure the y-value is a valid number and formatted
            ), // Extract y-values (average death event rates) and format them to two decimal places
        };

        // Return the formatted data as a JSON response
        res.json(data);
    } catch (error) 
    {
        // Log the error and return a 500 status code if the query fails
        console.error("Error fetching line graph data:", error);
        res.status(500).send('Error fetching line graph data');
    }
});

// Export the router so it can be used in the app
module.exports = router;