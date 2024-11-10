const firebaseConfig = {};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

// Chart
let myChart;

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

// Call this function once to initialize the chart with empty data
initializeChart();

// Function to update the chart with new data
function updateChart(timestamps, temperatures, humidities) {
    // Clear the existing data if necessary
    myChart.data.labels = timestamps;
    myChart.data.datasets[0].data = temperatures; // Update Temperature dataset
    myChart.data.datasets[1].data = humidities; // Update Humidity dataset

    // Update the chart with smooth animation

    myChart.update("active"); // `active` mode enables smooth animations
}

function getDataForSelectedDate() {
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

function updateChart(timestamps, temperatures, humidities) {
    // Clear the existing data if necessary
    myChart.data.labels = timestamps;
    myChart.data.datasets[0].data = temperatures; // Update Temperature dataset
    myChart.data.datasets[1].data = humidities; // Update Humidity dataset

    // Update the chart with smooth animation
    myChart.update("active"); // `active` mode enables smooth animations
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

document.querySelectorAll("#setting-wrapper button").forEach((button) => {
    button.addEventListener("click", (event) => {
        currentDataType = event.target.innerText.toLowerCase();
        fetchData(currentDataType);
    });
});

document.getElementById("date-input").addEventListener("change", (event) => {
    fetchData(currentDataType);
});

initializeChart();
fetchData(currentDataType);
setInterval(fetchData, 2500, currentDataType);

getLatestReading();
setInterval(getLatestReading, 2500);
