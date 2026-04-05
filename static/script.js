let forecastChart;
let latestPredictions = [];
let latestActuals = [];
let latestLabels = [];

function createChart() {
    const ctx = document.getElementById('forecastChart').getContext('2d');

    forecastChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Actual Sales',
                    data: [],
                    borderWidth: 2,
                    tension: 0.3
                },
                {
                    label: 'Predicted Sales',
                    data: [],
                    borderWidth: 2,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            animation: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateChart(labels, actuals, predictions) {
    forecastChart.data.labels = labels;
    forecastChart.data.datasets[0].data = actuals;
    forecastChart.data.datasets[1].data = predictions;
    forecastChart.update();
}

function fillTable(labels, actuals, predictions) {
    const tbody = document.getElementById('forecastTableBody');
    tbody.innerHTML = '';

    let totalActual = 0;
    let totalForecast = 0;
    let totalAccuracy = 0;

    for (let i = 0; i < labels.length; i++) {
        const actual = actuals[i];
        const predicted = predictions[i];
        const accuracy = actual === 0 ? 0 : (100 - (Math.abs(actual - predicted) / actual) * 100).toFixed(2);

        totalActual += actual;
        totalForecast += predicted;
        totalAccuracy += parseFloat(accuracy);

        const row = `
            <tr>
                <td>${labels[i]}</td>
                <td>${actual}</td>
                <td>${predicted}</td>
                <td>${accuracy}%</td>
            </tr>
        `;
        tbody.innerHTML += row;
    }

    document.getElementById('totalActual').innerText = totalActual;
    document.getElementById('totalForecast').innerText = totalForecast;
    document.getElementById('avgAccuracy').innerText = (totalAccuracy / labels.length).toFixed(2) + '%';
    document.getElementById('selectedSector').innerText = document.getElementById('sector').value;
}

function getPrediction() {
    const sector = document.getElementById('sector').value;
    const level = document.getElementById('level').value;
    const period = document.getElementById('period').value;
    const year = document.getElementById('year').value;

    fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector, level, period, year })
    })
    .then(res => res.json())
    .then(data => {
        latestLabels = data.labels;
        latestActuals = data.actuals;
        latestPredictions = data.predictions;

        updateChart(data.labels, data.actuals, data.predictions);
        fillTable(data.labels, data.actuals, data.predictions);
        document.getElementById('actionMessage').innerText = 'Forecast generated successfully.';
    })
    .catch(err => {
        console.error(err);
        document.getElementById('actionMessage').innerText = 'Error generating forecast.';
    });
}

function applyAdjustment() {
    const adjusted = document.getElementById('adjustedValue').value;
    if (!adjusted) {
        document.getElementById('actionMessage').innerText = 'Enter an adjusted forecast value first.';
        return;
    }

    latestPredictions = latestPredictions.map(() => Number(adjusted));
    updateChart(latestLabels, latestActuals, latestPredictions);
    fillTable(latestLabels, latestActuals, latestPredictions);
    document.getElementById('actionMessage').innerText = 'Forecast customization applied.';
}

function sendForApproval() {
    document.getElementById('actionMessage').innerText = 'Forecast sent for approval workflow.';
}

window.onload = createChart;