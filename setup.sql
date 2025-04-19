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
