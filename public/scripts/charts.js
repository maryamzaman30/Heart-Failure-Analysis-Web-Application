// public/

// For views/causes_most_deaths.ejs ---------------------------------------------------------------------------

// Async function to fetch chart data from the server endpoint
async function fetchChartData() 
{
    // Sending a GET request to fetch data from the '/analysis/causes-most-deaths' URL
    const response = await fetch('/analysis/causes-most-deaths');
    // Parsing the response as JSON and returning the parsed data
    return response.json();
}

// Function to render the chart with the provided data
function renderChart(data) 
{
    // Arrays to hold the labels and the death counts for both binary feature values (0 and 1)
    const labels = [];
    const deathCounts0 = [];
    const deathCounts1 = [];

    // Loop through each feature in the fetched data
    for (const [feature, values] of Object.entries(data)) 
    {
        // Add the feature name to the labels array
        labels.push(feature);
        
        // Find the death count for feature_value == 0, defaulting to 0 if not found
        const value0 = values.find(v => v.feature_value == 0)?.death_count || 0;
        
        // Find the death count for feature_value == 1, defaulting to 0 if not found
        const value1 = values.find(v => v.feature_value == 1)?.death_count || 0;

        // Add the death counts to their respective arrays
        deathCounts0.push(value0);
        deathCounts1.push(value1);
    }

    // Get the canvas context where the chart will be rendered
    const ctx = document.getElementById('causesMostDeathsChart').getContext('2d');

    // Create a new bar chart with the prepared data
    new Chart(ctx, 
    {
        type: 'bar', // Specifies that the chart type is 'bar'
        data: 
        {
            labels: labels, // Set the labels (categories) for the x-axis
            datasets: [
                {
                    label: 'Death Event = 0', // Label for the first dataset
                    data: deathCounts0, // Data for death event = 0
                    backgroundColor: 'rgba(75, 192, 192, 0.6)', // Set the background color for the bars
                },
                {
                    label: 'Death Event = 1', // Label for the second dataset
                    data: deathCounts1, // Data for death event = 1
                    backgroundColor: 'rgba(255, 99, 132, 0.6)', // Set the background color for the bars
                }
            ]
        },
        options: 
        {
            responsive: true, // Make the chart responsive (resize on window size change)
            plugins: 
            {
                legend: 
                {
                    position: 'top', // Position the chart legend at the top
                },
                title: 
                {
                    display: true, // Display the chart title
                    text: 'Causes Most Deaths (Binary Features)' // Title of the chart
                }
            }
        }
    });
}

// Fetch the data and render the chart, handling errors if any
fetchChartData().then(renderChart).catch(console.error);

// For views/serum-creatinine-ejection-fraction.ejs ------------------------------------------------------------

// Get the 2D context of the HTML canvas element with id 'scatterPlot' to draw the chart
const ctx = document.getElementById('scatterPlot').getContext('2d');

// Initialize the structure for the scatter plot data, with two datasets for death events
const scatterData = {
    datasets: [
        {
            label: 'Death Event = 1', // Label for the dataset where death event is 1
            data: [], // Initially empty array for data points
            backgroundColor: 'rgba(255, 99, 132, 1)', // Set the color for the data points
            borderColor: 'rgba(255, 99, 132, 1)', // Set the border color for data points
            showLine: false, // No line will be drawn, only points
            pointRadius: 5, // Size of the data points
        },
        {
            label: 'Death Event = 0', // Label for the dataset where death event is 0
            data: [], // Initially empty array for data points
            backgroundColor: 'rgba(54, 162, 235, 1)', // Set the color for the data points
            borderColor: 'rgba(54, 162, 235, 1)', // Set the border color for data points
            showLine: false, // No line will be drawn, only points
            pointRadius: 5, // Size of the data points
        }
    ]
};

// Fetch data from the server using the '/analysis/scatter-data' endpoint
fetch('/analysis/scatter-data')
    .then(response => response.json()) // Parse the response data as JSON
    .then(data => {
        // Loop through the fetched data to process each item
        data.forEach(item => {
            // Create a point with 'serum_creatinine' as the x-coordinate and 'ejection_fraction' as the y-coordinate
            const point = {
                x: item.serum_creatinine, // Serum creatinine value for the x-axis
                y: item.ejection_fraction, // Ejection fraction value for the y-axis
            };
            // If the death event is 1, add the point to the first dataset (Death Event = 1)
            if (item.death_event) 
            {
                scatterData.datasets[0].data.push(point); // Death Event = 1
            } 
            else 
            {
                // If the death event is 0, add the point to the second dataset (Death Event = 0)
                scatterData.datasets[1].data.push(point); // Death Event = 0
            }
        });

        // Create the scatter plot using the Chart.js library
        const scatterPlot = new Chart(ctx, 
        {
            type: 'scatter', // Specify the chart type as 'scatter'
            data: scatterData, // Pass the data to be plotted
            options: 
            {
                // Set up the chart's axis options
                scales: {
                    x: 
                    {
                        title: 
                        {
                            display: true, // Display a title for the x-axis
                            text: 'Serum Creatinine' // Title text for the x-axis
                        }
                    },
                    y: 
                    {
                        title: {
                            display: true, // Display a title for the y-axis
                            text: 'Ejection Fraction' // Title text for the y-axis
                        }
                    }
                }
            }
        });
    })
    .catch(error => console.error('Error fetching scatter plot data:', error)); // Catch and log any errors during the fetch

// For views/survival-rate-analysis.ejs -------------------------------------------------------------------------

// Async function to fetch survival rate data based on a selected feature
async function fetchData() 
{
    // Get the selected feature value from a dropdown menu or set a default ('sex') if no feature is selected
    const feature = document.getElementById('feature').value || 'sex'; // Default to 'sex' if nothing is selected

    // Fetch data from the server endpoint, passing the selected feature to the URL
    const response = await fetch(`/analysis/survival-rate/${feature}`);
    // Parse the response as JSON
    const data = await response.json();

    // Extract labels (feature values) and survival rates from the fetched data
    const labels = data.map(item => item.feature_value); // Extract feature values for the pie chart labels
    const values = data.map(item => item.survival_rate); // Extract corresponding survival rates for the pie chart values

    // Prepare the data for Plotly's pie chart
    const pieData = [{
        values: values, // Set the survival rates as the pie chart values
        labels: labels, // Set the feature values as the labels for the pie chart slices
        type: 'pie', // Specify that the chart is a pie chart
        hoverinfo: 'label+percent' // Show only the label and percentage on hover
    }];

    // Define the layout options for the pie chart
    const layout = {
        title: `Survival Rate by ${feature.charAt(0).toUpperCase() + feature.slice(1)}`, // Set the chart title dynamically based on the feature
    };

    // Create the pie chart using Plotly with the prepared data and layout
    Plotly.newPlot('pieChart', pieData, layout);
}

// When the button is clicked, it triggers the fetchData function
document.getElementById('survival-rate-analysis').addEventListener('click', fetchData);

// For views/survival-rate-trends.ejs -------------------------------------------------------------------------

// Async function to generate a line graph based on a selected feature
async function generateLineGraph() 
{
    // Get the selected feature value from a dropdown menu
    const feature = document.getElementById('feature').value;
    // Construct the URL for the API endpoint based on the selected feature
    const url = `/analysis/line-graph/${feature}`;

    try 
    {
        // Fetch data from the server using the constructed URL
        const response = await fetch(url);
        
        // Check if the response is successful (status code 200)
        if (!response.ok) 
        {
            throw new Error('Error fetching data'); // Throw an error if the response is not OK
        }

        // Parse the JSON data from the response
        const data = await response.json();

        // Define the trace (data) for the line graph
        const trace = {
            x: data.xValues, // Set the x-axis values (e.g., feature values)
            y: data.yValues, // Set the y-axis values (e.g., survival rates)
            type: 'scatter', // Set the chart type to scatter (used for line charts)
            mode: 'lines+markers', // Display both lines and markers on the graph
            marker: { color: 'blue' }, // Set the color of the markers to blue
        };

        // Define the layout for the graph (e.g., title, axis labels)
        const layout = {
            title: `Survival Rate vs ${feature}`, // Dynamic title based on the selected feature
            xaxis: { title: feature }, // Label for the x-axis based on the selected feature
            yaxis: { title: 'Survival Rate (Average Death Event)' }, // Label for the y-axis
        };

        // Use Plotly.js to plot the line graph with the defined trace and layout
        Plotly.newPlot('graph', [trace], layout);
    } 
    catch (error) 
    {
        // Log the error and show an alert if fetching or plotting the graph fails
        alert('Failed to generate the graph. Please try again.');
    }
}