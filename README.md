# ACIT3495-Project: K8s Deployment

2022 (C) BCIT

## Application Use-Case
**Open Weather Service API** is built for weather monitoring agencies. It provides an application service to compute raw data that has been collected, and analzes and processes the raw data into a user-friendly Application Programming Interface for frontend applications

**Open Weather Service API** provides the following functionality:

-  Exposes an API to send data over HTTP to a frontend with API calls.
-  Services are loosely coupled and scalable.

## Architecture
Open Weather Service works in the following steps: 

1.  Weather data of temperatures is deposited by an administrator.
2.  The temperature data is saved to a relational database.
3.  The data is divided into tables by datetime.
4.  The minimum value, maximum value, and average value is computed.
5.  The computed values are saved in a non-relational database
6.  The computed data is served over HTTP to a frontend with REST API calls.

### User Interfaces
**Admin Client**
-   Weather Service portal for uploading raw temperature data.
-   Data can be uploaded as a Comma Separated Values (CSV) file.
-   Saves raw data and computed data in separate in containers
-   Requires Admin Authorisation

**User Client**
-  Weather application
-  Presents organised temperature information with useful summary
-  User account required for authorisation

### Databases
Uses two different databases.
1.  MySQL for raw data
2.  NoSQL(MongoDB) for computed data
Raw data is computed for minimum, maximum, and average values.

### Microservices Design
The application is divided into 5 services:
1.  **Express.js** webclient
2.  **MySQL** for raw data
3.  **Node.js** analytics service
4.  **MongoDB** for computed data
5.  **Python-flask** application for API service

Authorisation is managed by a JWT service

### Microservice Architecture

**Frontend**
-   Reverse proxy
    -   Serve static webpage
-   User frontend server
    -   serve weather data with analysis
-   Admin frontend server
    -   Administator uploads CSV files with raw data.

**Backend**
-   MySQL Database
    -   Stores raw data in tables
-   Analytics Server
    -   Processes raw data for statistics
-   MongoDB Datastore
    -   Serves post-processed data to User frontend Server

## Repository
GitHub: https://github.com/xXDamoonXx/ACIT3495-Project

Docker Hub:
-  mysql image: damoun1380/mysql-project:tagname
-  mongo image: damoun1380/mongo:tagname
## Technical Description
