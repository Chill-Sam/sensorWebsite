const firebaseConfig = {};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

// Initialize chart
var measurementChart;

// Initialize an empty chart
function initializeChart() {
    const ctx = document.getElementById("measurement-graph").getContext("2d");
    myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [], // Empty labels array
            datasets: [
                {
                    label: "Temperature (°C)",
                    data: [],
                    borderColor: "rgba(75, 192, 192, 1)",
                    fill: false,
                    yAxisID: "y1",
                },

                {
                    label: "Humidity (%)",
                    data: [],
                    borderColor: "rgba(153, 102, 255, 1)",
                    fill: false,
                    yAxisID: "y2",
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            scales: {
                x: {
                    type: "category",
                    title: {
                        display: true,
                        text: "Time",
                    },
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
                    grid: {
                        drawOnChartArea: false,
                    },
                },
            },
        },
    });
}

// Empties chart
function clearChart() {
    measurementChart.data.labels = []; // Clear the labels
    measurementChart.data.datasets.forEach((dataset) => {
        dataset.data = []; // Clear the data points
    });
    measurementChart.update(); // Update the chart to reflect changes
}

let currentDataType = "temperature"; // Default data type
document.getElementById("input-date").valueAsDate = new Date(); // Set selected date to today
let selectedDate = null; // init selected date (gets updated later)

// Get data from Firebase
function fetchData(type) {
    const dateInput = document.getElementById("date-input").value;
    if (!dateInput) {
        return;
    }

    const selectedDate = new Date(dateInput);
    const startOfDay = selectedDate.setHours(0, 0, 0, 0);
    const endOfDay = selectedDate.setHours(23, 59, 59, 999);

    const readingsRef = database.ref("readings");
    readingsRef
        .orderByChild("timestamp")
        .startAt(startOfDay)

        .endAt(endOfDay)

        .once("value", (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Process data for Chart.js
                const timestamps = [];
                const temperatures = [];
                const humidities = [];

                Object.values(data).forEach((entry) => {
                    timestamps.push(
                        new Date(entry.timestamp).toLocaleTimeString(),
                    );

                    temperatures.push(entry.temperature);
                    humidities.push(entry.humidity);
                });

                // Render chart with processed data
                updateChart(timestamps, temperatures, humidities);
            }
        })

        .catch((error) => {
            console.error("Error fetching data:", error);
        });
}

// Gets the latest readings
function getLatestReading() {
    const currentTemperature = document.getElementById("current-temperature");
    const currentHumidity = document.getElementById("current-humidity");
    const readingsRef = database.ref("readings");
    readingsRef
        .orderByKey()
        .limitToLast(1)
        .once("value", (snapshot) => {
            if (snapshot.exists()) {
                const latestReading = Object.values(snapshot.val())[0];
                currentTemperature.innerHTML = latestReading.temperature + "°C";
                currentHumidity.innerHTML = latestReading.humidity + "%";
            } else {
                console.log("No readings available");
            }
        })
        .catch((error) => {
            console.error("Error fetching latest reading:", error);
        });
}

// Update chart
function updateChart(labels, values, type) {
    measurementChart.data.labels = labels;
    measurementChart.data.datasets[0].data = values;
    measurementChart.data.datasets[0].label =
        type.charAt(0).toUpperCase() + type.slice(1);
    (measurementChart.data.datasets[0].borderColor =
        type == "temperature"
            ? "rgba(255, 165, 0, 1)"
            : "rgba(75, 192, 192, 1)"),
        measurementChart.update();
}

// Setup event handlers for updating the graph
document.querySelectorAll("#setting-wrapper button").forEach((button) => {
    button.addEventListener("click", (event) => {
        currentDataType = event.target.innerText.toLowerCase();
        fetchData(currentDataType);
    });
});

document.getElementById("date-input").addEventListener("change", (event) => {
    fetchData();
});

function updateData() {
    // workaround function
    fetchData(currentDataType);
}

// Run functions and setup intervals

initializeChart();
fetchData(currentDataType);
setInterval(updateData, 2500); // workaround bug

getLatestReading();
setInterval(getLatestReading, 2500);
