const firebaseConfig = {
    apiKey: "AIzaSyBSr0zEmbKcSpxDtsCKDqHm3VoWq2j-LVY",

    authDomain: "temperature-school.firebaseapp.com",

    databaseURL:
        "https://temperature-school-default-rtdb.europe-west1.firebasedatabase.app",

    projectId: "temperature-school",

    storageBucket: "temperature-school.firebasestorage.app",

    messagingSenderId: "147048153777",

    appId: "1:147048153777:web:39d5016ab3f87502155890",

    measurementId: "G-487F35J2H1",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

var measurementChart;

function initializeChart() {
    const ctx = document.getElementById("measurement-graph").getContext("2d");
    // Create empty chart
    measurementChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                {
                    label: [],
                    data: [],
                    borderColor: "rgba(255, 165, 0, 1)",
                    borderWidth: 2,
                    fill: false,
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
                y: { beginAtZero: true },
            },
        },
    });
}

function clearChart() {
    measurementChart.data.labels = []; // Clear the labels
    measurementChart.data.datasets.forEach((dataset) => {
        dataset.data = []; // Clear the data points
    });
    measurementChart.update(); // Update the chart to reflect changes
}

let currentDataType = "temperature"; // Default data type
let selectedDate = null;

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

                if (type == "temperature") {
                    // Render chart with processed data
                    updateChart(timestamps, temperatures, type);
                } else if (type == "humidity") {
                    updateChart(timestamps, humidities, type);
                }
            } else {
                clearChart();
            }
        })

        .catch((error) => {
            console.error("Error fetching data:", error);
        });
}

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
