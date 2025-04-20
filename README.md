# Heart Failure Records Analysis Web Application

Link to demo - https://youtu.be/a-J5SkH8j-Y

Dataset used - https://archive.ics.uci.edu/dataset/519/heart+failure+clinical+records

## Description

This web application is designed to analyze heart failure clinical records. It provides various functionalities, including:

- Viewing all records of heart failure patients.
- Analyzing causes of death based on binary features (e.g., anaemia, diabetes, etc.).
- Visualizing the relationship between serum creatinine and ejection fraction through scatter plots.
- Displaying survival rates based on different features (e.g., age, sex, smoking).
- Generating statistics and trends related to heart failure data.

The application uses Node.js with Express for the backend, MySQL for the database, and EJS for rendering dynamic HTML pages.

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js**: [Download Node.js](https://nodejs.org/)
- **XAMPP**: [Download XAMPP](https://www.apachefriends.org/index.html)

## Setup Instructions

### Step 1: Install XAMPP

1. Download and install XAMPP from the official website.
2. Launch the XAMPP Control Panel and start the **Apache** and **MySQL** services.

### Step 2: Configure MySQL Environment Variables

1. Open the **Control Panel** on your Windows machine.
2. Navigate to **System and Security** > **System** > **Advanced system settings**.
3. Click on the **Environment Variables** button.
4. In the **System variables** section, find the `Path` variable and select it, then click **Edit**.
5. Add the path to your MySQL installation (usually `C:\xampp\mysql\bin`) to the list of paths.
6. Click **OK** to save the changes.

### Step 3: Set Up the Database

1. Open a terminal (Command Prompt or PowerShell).
2. Start the MySQL command line by typing `mysql -u root -p` and pressing Enter. (You may not need a password if you haven't set one.)
3. Create the database and table by executing the SQL commands from the `setup.sql` file. You can copy the following SQL commands into the terminal:

```sql
CREATE DATABASE heart_failure;

USE heart_failure;

CREATE TABLE records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    age INT,
    anaemia BOOLEAN,
    creatinine_phosphokinase INT,
    diabetes BOOLEAN,
    ejection_fraction INT,
    high_blood_pressure BOOLEAN,
    platelets DOUBLE,
    serum_creatinine DOUBLE,
    serum_sodium INT,
    sex BOOLEAN,
    smoking BOOLEAN,
    time INT,
    death_event BOOLEAN
);
```

4. Load the dataset into the `records` table. Ensure you have the `heart_failure_clinical_records_dataset.csv` file in the appropriate directory. Then run:

```sql
LOAD DATA INFILE 'heart_failure_clinical_records_dataset.csv'
INTO TABLE records
FIELDS TERMINATED BY ',' 
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(
    age, anaemia, creatinine_phosphokinase, diabetes, ejection_fraction,
    high_blood_pressure, platelets, serum_creatinine, serum_sodium, sex,
    smoking, time, death_event
);
```

### Step 4: Clone the Repository

1. Clone this repository to your local machine using Git or download it as a ZIP file and extract it.

```bash
git clone <repository-url>
```

### Step 5: Install Dependencies

1. Navigate to the project directory in your terminal.
2. Run the following command to install the required Node.js packages:

```bash
npm install
```

### Step 6: Run the Application

1. Start the application by running:

```bash
node app.js
```

2. Open your web browser and navigate to `http://localhost:3000` to access the application.

## Usage

- Use the navigation menu to explore different analysis features.
- View statistics, causes of death, survival rates, and more through the provided links.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- This application utilizes the Chart.js and Plotly.js libraries for data visualization.
- Thanks to the contributors and the community for their support and resources.
