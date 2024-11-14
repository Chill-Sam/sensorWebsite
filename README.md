# Sensor Website Project

This repository contains a web-based project designed for **Hitachigymnasiet** to monitor and display sensor data. The project leverages Firebase for real-time data storage and retrieval and interfaces with ESP8266 microcontrollers for sensor data input.

## Features

- **Real-time Sensor Monitoring**: Displays data from sensors connected via ESP8266 modules.
- **Firebase Integration**: Uses Firebase for data storage and real-time data updates.
- **Responsive UI**: Frontend built with HTML, CSS, and JavaScript to create an accessible and visually appealing interface.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Firebase (database and hosting)
- **Hardware**: ESP8266 microcontroller for data gathering from sensors
- **Languages**: JavaScript (46.1%), HTML (20.6%), CSS (16.9%), C++ (16.4%)

## Getting Started

### Prerequisites

- Install Node.js and Firebase CLI to interact with the Firebase database and deploy the project.
- Set up an ESP8266 microcontroller with sensors for data collection.

### Setup and Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Chill-Sam/sensorWebsite.git
   cd sensorWebsite
   ```

2. **Firebase Setup**:
   - Log in to Firebase, create a new project, and copy the configuration details.
   - Update the Firebase config in your project to match your new Firebase project credentials.

3. **Deploy the Site**:
   ```bash
   firebase deploy
   ```

### ESP8266 Setup

The `esp8266` folder contains code to configure the ESP8266 microcontroller for sensor data collection. Load this code onto your ESP8266, ensuring Wi-Fi credentials and Firebase API endpoints are properly set.

## Usage

Once set up, the website will display sensor data in real time, pulling data from Firebase as it is updated by the ESP8266.
