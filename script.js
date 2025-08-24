// IMPORTANT: Replace with your own API key from https://openweathermap.org/
const apiKey = 'ce3183994d80cc50bcc6ad9c92131351'; //

// Select Elements
const cityInput = document.querySelector('#city-input');
const searchBtn = document.querySelector('#search-btn');
const weatherGrid = document.querySelector('#weather-grid');

// Add event listeners
searchBtn.addEventListener('click', () => fetchWeather(cityInput.value));
cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        fetchWeather(cityInput.value);
    }
});
window.addEventListener('load', getUserLocation);

// --- Core Function: Fetch Weather Data ---
function fetchWeather(city) {
    if (!city) {
        displayError("Please enter a city name.");
        return;
    }
    displayLoader();

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    Promise.all([fetch(currentWeatherUrl), fetch(forecastUrl)])
        .then(async ([currentRes, forecastRes]) => {
            if (!currentRes.ok) throw new Error((await currentRes.json()).message);
            if (!forecastRes.ok) throw new Error((await forecastRes.json()).message);
            return [await currentRes.json(), await forecastRes.json()];
        })
        .then(([currentData, forecastData]) => {
            displayAllWeather(currentData, forecastData);
        })
        .catch(error => {
            console.error('An error occurred:', error);
            displayError(error.message);
        });
}

// --- Display Functions ---
function displayAllWeather(current, forecast) {
    weatherGrid.innerHTML = ''; // Clear loader or previous content
    weatherGrid.appendChild(createCurrentWeatherCard(current));
    weatherGrid.appendChild(createAirConditionsCard(current));
    weatherGrid.appendChild(createHourlyForecastCard(forecast.list));
    weatherGrid.appendChild(createDailyForecastCard(forecast.list));
}

function createCurrentWeatherCard(data) {
    const card = document.createElement('div');
    card.id = 'current-weather';
    card.className = 'weather-card';
    card.innerHTML = `
        <div class="current-details">
            <h2>${data.name}, ${data.sys.country}</h2>
            <p>${data.weather[0].description}</p>
            <div class="current-temp">
                <span class="temp">${Math.round(data.main.temp)}°C</span>
                <p class="feels-like">Feels like ${Math.round(data.main.feels_like)}°C</p>
            </div>
        </div>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="${data.weather[0].description}" class="current-weather-icon">
    `;
    return card;
}

function createAirConditionsCard(data) {
    const card = document.createElement('div');
    card.id = 'air-conditions';
    card.className = 'weather-card';
    const windSpeedKmh = (data.wind.speed * 3.6).toFixed(1);
    card.innerHTML = `
        <h3>AIR CONDITIONS</h3>
        <div class="conditions-grid">
            <div class="condition-item">
                <i class="fa-solid fa-wind"></i>
                <div>
                    <p class="label">Wind Speed</p>
                    <p class="value">${windSpeedKmh} km/h</p>
                </div>
            </div>
            <div class="condition-item">
                <i class="fa-solid fa-droplet"></i>
                <div>
                    <p class="label">Humidity</p>
                    <p class="value">${data.main.humidity}%</p>
                </div>
            </div>
            <div class="condition-item">
                <i class="fa-solid fa-cloud"></i>
                <div>
                    <p class="label">Cloudiness</p>
                    <p class="value">${data.clouds.all}%</p>
                </div>
            </div>
            <div class="condition-item">
                <i class="fa-solid fa-eye"></i>
                <div>
                    <p class="label">Visibility</p>
                    <p class="value">${(data.visibility / 1000).toFixed(1)} km</p>
                </div>
            </div>
        </div>
    `;
    return card;
}

function createHourlyForecastCard(hourlyData) {
    const card = document.createElement('div');
    card.id = 'hourly-forecast';
    card.className = 'weather-card';
    let hourlyItemsHTML = '';
    for (let i = 0; i < 8; i++) { // Next 24 hours (8 * 3-hour intervals)
        const item = hourlyData[i];
        const hour = new Date(item.dt * 1000).getHours().toString().padStart(2, '0');
        hourlyItemsHTML += `
            <div class="hourly-item">
                <p class="time">${hour}:00</p>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
                <p class="temp">${Math.round(item.main.temp)}°C</p>
            </div>`;
    }
    card.innerHTML = `<h3>TODAY'S FORECAST</h3><div class="hourly-container">${hourlyItemsHTML}</div>`;
    return card;
}

function createDailyForecastCard(forecastList) {
    const card = document.createElement('div');
    card.id = 'daily-forecast';
    card.className = 'weather-card';
    const dailyData = {};
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-CA');
        if (!dailyData[date]) dailyData[date] = { temps: [], icons: {}, descs: {} };
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].icons[item.weather[0].icon] = (dailyData[date].icons[item.weather[0].icon] || 0) + 1;
        dailyData[date].descs[item.weather[0].description] = (dailyData[date].descs[item.weather[0].description] || 0) + 1;
    });
    let dailyItemsHTML = '';
    Object.keys(dailyData).slice(1, 6).forEach(dateStr => { // Next 5 days
        const dayData = dailyData[dateStr];
        const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
        const icon = Object.keys(dayData.icons).reduce((a, b) => dayData.icons[a] > dayData.icons[b] ? a : b);
        const desc = Object.keys(dayData.descs).reduce((a, b) => dayData.descs[a] > dayData.descs[b] ? a : b);
        dailyItemsHTML += `
            <div class="daily-item">
                <p class="day">${dayName}</p>
                <div class="icon-desc">
                    <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
                    <p class="desc">${desc}</p>
                </div>
                <p class="temps"><strong>${Math.round(Math.max(...dayData.temps))}°</strong> / ${Math.round(Math.min(...dayData.temps))}°</p>
            </div>`;
    });
    card.innerHTML = `<h3>5-DAY FORECAST</h3><div class="daily-container">${dailyItemsHTML}</div>`;
    return card;
}

// --- UI Helpers: Loader, Error, Geolocation ---
function displayLoader() {
    weatherGrid.innerHTML = '<div class="loader"></div>';
}

function displayError(message) {
    weatherGrid.innerHTML = `<div class="placeholder"><h2>Error: ${message}. Please try again.</h2></div>`;
}

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
            displayLoader();
            fetch(url).then(res => res.json()).then(data => fetchWeather(data.name))
                .catch(err => {
                    console.error("Error fetching weather by location:", err);
                    displayError("Could not fetch weather for your location.");
                });
        }, () => console.log("Geolocation permission denied."));
    }
}
