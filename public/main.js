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
                    label: "Temperature",
                    data: [],
                    borderColor: "rgba(75, 192, 192, 1)",
                    fill: false,
                    pointRadius: 0,
                    tension: 0.1,
                    yAxisID: "y1",
                },
                {
                    label: "Humidity",
                    data: [],
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    tension: 0.1,
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

function clearDataset(type) {
    let i = type == "temperature" ? 0 : 1;
    measurementChart.data.datasets[i].data = [];
    measurementChart.update();
}

let selectedTemp = true;
let selectedHum = false;
document.getElementById("date-input").valueAsDate = new Date(); // Set selected date to today
let selectedDate = null; // init selected date (gets updated later)

// Get data from Firebase
function fetchData(type) {
    const dateInput = document.getElementById("date-input").value;
    if (!dateInput) {
        return;
    }

    const selectedDate = new Date(dateInput);
    const startOfDay = selectedDate.setHours(0, 0, 0) / 1000;
    const endOfDay = selectedDate.setHours(23, 59, 59) / 1000;

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
                        new Date(entry.timestamp * 1000).toLocaleTimeString(
                            "sv-SE",
                            { timeZone: "Europe/Berlin" },
                        ),
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

                currentTemperature.style.color =
                    latestReading.temperature > 24
                        ? "rgba(255, 0, 0, 1)"
                        : "rgba(255, 165, 0, 1)";

                currentHumidity.style.color =
                    latestReading.humidity > 40
                        ? "rgba(0, 0, 255, 1)"
                        : "rgba(75, 192, 192, 1)";
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
    let i = type == "temperature" ? 0 : 1; // update temperature dataset or humidity
    measurementChart.data.datasets[i].data = values;
    measurementChart.data.datasets[i].label =
        type.charAt(0).toUpperCase() + type.slice(1);
    measurementChart.data.datasets[i].borderColor =
        type == "temperature"
            ? "rgba(255, 165, 0, 1)"
            : "rgba(75, 192, 192, 1)";
    measurementChart.update();
}

// Setup event handlers for updating the graph
document.querySelectorAll("#setting-wrapper button").forEach((button) => {
    button.addEventListener("click", (event) => {
        // Dirty solution, but fixes the state handling
        let selectedType = event.target.innerText.toLowerCase();
        if (selectedType == "temperature") {
            selectedTemp = !selectedTemp;
            if (selectedTemp) {
                fetchData("temperature");
            } else {
                clearDataset("temperature");
            }
        } else if (selectedType == "humidity") {
            selectedHum = !selectedHum;
            if (selectedHum) {
                fetchData("humidity");
            } else {
                clearDataset("humidity");
            }
        }
    });
});

document.getElementById("date-input").addEventListener("change", (event) => {
    fetchData();
});

function updateData() {
    // workaround function
    if (selectedTemp) {
        fetchData("temperature");
    }

    if (selectedHum) {
        fetchData("humidity");
    }
}

// Run functions and setup intervals

initializeChart();
updateData();
setInterval(updateData, 2500); // workaround bug

getLatestReading();
setInterval(getLatestReading, 2500);
