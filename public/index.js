// Constants
const temperatureColor = "rgba(255, 165, 0, 1)";
const humidityColor = "rgba(75, 192, 192, 1)";

// Setup Firebase
const firebaseConfig = {};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();
const dbRef = database.ref("readings");

// Gets data of type ("temperature" or "humidity")
// Return promise for data
function fetchData(type) {
    // Start and end of day
    const startOfDay = getStartOfDay();
    const endOfDay = getEndOfDay();

    // Filter database for items
    return dbRef
        .orderByChild("timestamp")
        .startAt(startOfDay / 1000)
        .endAt(endOfDay / 1000)
        .once("value")
        .then((snapshot) => {
            const data = snapshot.val();
            if (!data) {
                return; // No data found for day
            }
            // Process data
            const isTemperature = type == "temperature" ? true : false;

            const dataset = Object.values(data).map((entry) => ({
                x: entry.timestamp * 1000,
                y: isTemperature ? entry.temperature : entry.humidity,
            }));
            return dataset;
        });
}

// Get latest reading from Firebase
function getLatestReading() {
    return dbRef
        .orderByKey()
        .limitToLast(1)
        .once("value")
        .then((snapshot) => {
            if (snapshot.exists()) {
                const latestReading = Object.values(snapshot.val())[0];
                return latestReading;
            }
        })
        .catch((error) => {
            console.error("Error fetching latest reading: ", error);
        });
}

// Updates latest section
function updateLatest() {
    getLatestReading().then((reading) => {
        const currentTemperature = document.getElementById(
            "current-temperature",
        );
        const currentHumidity = document.getElementById("current-humidity");

        if (!reading) {
            return; // No data or error
        }

        // Set color of text
        currentTemperature.style.color =
            reading.temperature > 24 ? "rgba(255, 0, 0, 1)" : temperatureColor;

        currentHumidity.style.color =
            reading.humidity > 40 ? "rgba(0, 0, 255, 1)" : humidityColor;

        currentTemperature.innerHTML = reading.temperature + "°C";
        currentHumidity.innerHTML = reading.humidity + "%";
    });
}

// Date handling
const dateInput = document.getElementById("date-input");
const offset = 3600000; // Shift timezone to Europe/Berlin
function getStartOfDay() {
    const date = dateInput.value;
    if (!date) {
        return 0;
    }
    return new Date(date).setHours(0, 0, 0, 0) - offset;
}

function getEndOfDay() {
    const date = dateInput.value;
    if (!date) {
        return 0;
    }
    return new Date(date).setHours(23, 59, 59, 999) - offset;
}

// Chartjs
var chart;

function initializeChart() {
    const ctx = document.getElementById("measurement-graph").getContext("2d");

    // Create a empty chart
    chart = new Chart(ctx, {
        type: "line",
        data: {
            datasets: [
                {
                    label: "Temperature",
                    data: [],
                    borderColor: temperatureColor,
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    yAxisID: "y1",
                },
                {
                    label: "Humidity",
                    data: [],
                    borderColor: humidityColor,
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    yAxisID: "y2",
                },
            ],
        },
        options: {
            // Make graph scale properly
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            parse: false,
            scales: {
                x: {
                    type: "linear",
                    title: {
                        display: true,
                        text: "Time",
                    },
                    ticks: {
                        callback: function (value, index, ticks) {
                            // Format timestamp to readable format
                            return new Date(value).toLocaleTimeString("sv-Se", {
                                timeZone: "Europe/Berlin",
                            });
                        },
                    },
                    // Will be set dynamically
                    min: 0,
                    max: 0,
                },
                y1: {
                    type: "linear",
                    position: "left",
                    title: {
                        display: true,
                        text: "Temperature (°C)",
                    },
                },
                y2: {
                    type: "linear",
                    position: "right",
                    title: {
                        display: true,
                        text: "Humidity (%)",
                    },
                },
            },
            plugins: {
                decimation: {
                    enabled: true,
                    algorithm: "lttb",
                    samples: 1440,
                },
                tooltip: {
                    callbacks: {
                        title: function (context) {
                            // Format the timestamp (x value) in the tooltip title to HH:mm:ss
                            const timestamp = context[0].raw.x;
                            return new Date(timestamp).toLocaleTimeString(
                                "sv-SE",
                                {
                                    timeZone: "Europe/Berlin",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                },
                            );
                        },
                    },
                },
            },
        },
    });
}

// Empty chart
function clearDataset(type) {
    let i = type == "temperature" ? 0 : 1;
    chart.data.datasets[i].data = [];
    chart.update();
}

function clearChart() {
    clearDataset("temperature");
    clearDataset("humidity");
}

// Update chart
function updateChart(type) {
    var i = type == "temperature" ? 0 : 1; // Check if temperature or humidity
    fetchData(type).then((dataset) => {
        // Start and end of day
        const startOfDay = getStartOfDay();
        const endOfDay = getEndOfDay();

        chart.options.scales.x.min = startOfDay;
        chart.options.scales.x.max = endOfDay;

        chart.data.datasets[i].data = dataset;
        chart.update();
    });
}

let showTemperature = true;
let showHumidity = false;

function update() {
    if (showTemperature) {
        updateChart("temperature");
    } else {
        clearDataset("temperature");
    }

    if (showHumidity) {
        updateChart("humidity");
    } else {
        clearDataset("humidity");
    }
}

// Event handler
dateInput.addEventListener("change", (event) => {
    update();
});

document.querySelectorAll("#setting-wrapper button").forEach((button) => {
    button.addEventListener("click", (event) => {
        let selectedType = event.target.innerText.toLowerCase();

        switch (selectedType) {
            case "temperature":
                showTemperature = !showTemperature;
                break;
            case "humidity":
                showHumidity = !showHumidity;
                break;
            default:
                break;
        }

        update();
    });
});

// Startup
updateLatest();
initializeChart();
update();
dateInput.valueAsDate = new Date();

// Update
setInterval(() => {
    updateLatest();
    update();
}, 2500);
