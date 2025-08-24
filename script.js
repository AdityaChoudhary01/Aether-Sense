// =================================================================================
//  Modern Weather App - Main Script
// =================================================================================

// --- API Key (Replace with your own if needed) ---
const apiKey = 'ce3183994d80cc50bcc6ad9c92131351';

// --- Global DOM Elements ---
const cityInput = document.querySelector('#city-input');
const searchBtn = document.querySelector('#search-btn');
const weatherGrid = document.querySelector('#weather-grid');
const themeToggleBtn = document.querySelector('#theme-toggle-btn');
const body = document.body;

// --- Global State ---
let fullForecastData = []; // To store the full 5-day forecast

// =================================================================================
//  EVENT LISTENERS
// =================================================================================

// Search functionality
searchBtn.addEventListener('click', () => fetchWeather(cityInput.value));
cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fetchWeather(cityInput.value);
});

// Theme toggle
themeToggleBtn.addEventListener('click', toggleTheme);

// Load theme and user location on page start
window.addEventListener('load', () => {
    applySavedTheme();
    getUserLocation();
});

// =================================================================================
//  THEME MANAGEMENT
// =================================================================================

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
    }
}

function toggleTheme() {
    body.classList.toggle('light-mode');
    const currentTheme = body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem('theme', currentTheme);
}

// =================================================================================
//  WEATHER DATA FETCHING
// =================================================================================

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
            fullForecastData = forecastData.list;
            displayInitialWeather(currentData, forecastData);
        })
        .catch(error => {
            console.error('An error occurred:', error);
            displayError(error.message);
        });
}

// =================================================================================
//  UI DISPLAY & CARD CREATION
// =================================================================================

function displayInitialWeather(current, forecast) {
    weatherGrid.innerHTML = ''; // Clear loader or previous content
    weatherGrid.appendChild(createCurrentWeatherCard(current));
    weatherGrid.appendChild(createAirConditionsCard(current));
    weatherGrid.appendChild(createHourlyForecastCard(forecast.list.slice(0, 8)));
    weatherGrid.appendChild(createDailyForecastCard(forecast.list));
    document.querySelector('.daily-item')?.classList.add('active'); // Highlight today
}

// --- Functions to CREATE and UPDATE cards ---

function createCurrentWeatherCard(data) {
    const card = document.createElement('div');
    card.id = 'current-weather'; card.className = 'weather-card';
    updateCurrentWeatherCard(card, data);
    return card;
}

function updateCurrentWeatherCard(cardElement, data, dayName = "Today") {
    const cityName = data.name ? `${data.name}, ${data.sys.country}` : document.querySelector('.current-details h2').textContent;
    cardElement.innerHTML = `
        <div class="current-details">
            <h2>${cityName}</h2>
            <p>${dayName}, ${data.weather[0].description}</p>
            <div class="current-temp">
                <span class="temp">${Math.round(data.main.temp)}°C</span>
                <p class="feels-like">Feels like ${Math.round(data.main.feels_like)}°C</p>
            </div>
        </div>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="${data.weather[0].description}" class="current-weather-icon">
    `;
}

function createAirConditionsCard(data) {
    const card = document.createElement('div');
    card.id = 'air-conditions'; card.className = 'weather-card';
    updateAirConditionsCard(card, data);
    return card;
}

function updateAirConditionsCard(cardElement, data) {
    const windSpeedKmh = (data.wind.speed * 3.6).toFixed(1);
    cardElement.innerHTML = `
        <h3>AIR CONDITIONS</h3>
        <div class="conditions-grid">
            <div class="condition-item"><i class="fa-solid fa-wind"></i><div><p class="label">Wind Speed</p><p class="value">${windSpeedKmh} km/h</p></div></div>
            <div class="condition-item"><i class="fa-solid fa-droplet"></i><div><p class="label">Humidity</p><p class="value">${data.main.humidity}%</p></div></div>
            <div class="condition-item"><i class="fa-solid fa-cloud"></i><div><p class="label">Cloudiness</p><p class="value">${data.clouds.all}%</p></div></div>
            <div class="condition-item"><i class="fa-solid fa-eye"></i><div><p class="label">Visibility</p><p class="value">${(data.visibility / 1000).toFixed(1)} km</p></div></div>
        </div>
    `;
}

function createHourlyForecastCard(hourlyData) {
    const card = document.createElement('div');
    card.id = 'hourly-forecast'; card.className = 'weather-card';
    updateHourlyForecastCard(card, hourlyData);
    return card;
}

function updateHourlyForecastCard(cardElement, hourlyData, title = "TODAY'S FORECAST") {
    let hourlyItemsHTML = hourlyData.map(item => {
        const hour = new Date(item.dt * 1000).getHours().toString().padStart(2, '0');
        return `
            <div class="hourly-item">
                <p class="time">${hour}:00</p>
                <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="${item.weather[0].description}">
                <p class="temp">${Math.round(item.main.temp)}°C</p>
            </div>`;
    }).join('');
    cardElement.innerHTML = `<h3>${title}</h3><div class="hourly-container">${hourlyItemsHTML}</div>`;
}

function createDailyForecastCard(forecastList) {
    const card = document.createElement('div');
    card.id = 'daily-forecast'; card.className = 'weather-card';
    const dailyData = {};
    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString('en-CA');
        if (!dailyData[date]) dailyData[date] = { temps: [], icons: {}, descs: {} };
        dailyData[date].temps.push(item.main.temp);
        dailyData[date].icons[item.weather[0].icon] = (dailyData[date].icons[item.weather[0].icon] || 0) + 1;
        dailyData[date].descs[item.weather[0].description] = (dailyData[date].descs[item.weather[0].description] || 0) + 1;
    });

    let dailyItemsHTML = Object.keys(dailyData).slice(0, 5).map(dateStr => {
        const dayData = dailyData[dateStr];
        const dayName = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
        const icon = Object.keys(dayData.icons).reduce((a, b) => dayData.icons[a] > dayData.icons[b] ? a : b);
        const desc = Object.keys(dayData.descs).reduce((a, b) => dayData.descs[a] > dayData.descs[b] ? a : b);
        return `
            <div class="daily-item" data-date="${dateStr}">
                <p class="day">${dayName}</p>
                <div class="icon-desc">
                    <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}"><p class="desc">${desc}</p>
                </div>
                <p class="temps"><strong>${Math.round(Math.max(...dayData.temps))}°</strong> / ${Math.round(Math.min(...dayData.temps))}°</p>
            </div>`;
    }).join('');
    card.innerHTML = `<h3>5-DAY FORECAST</h3><div class="daily-container">${dailyItemsHTML}</div>`;

    setTimeout(() => { // Add listeners after elements are in the DOM
        document.querySelectorAll('.daily-item').forEach(item => {
            item.addEventListener('click', () => handleDayClick(item.dataset.date));
        });
    }, 0);
    return card;
}


// =================================================================================
//  INTERACTIVITY & HELPERS
// =================================================================================

function handleDayClick(dateStr) {
    document.querySelectorAll('.daily-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.daily-item[data-date="${dateStr}"]`).classList.add('active');

    const dayData = fullForecastData.filter(item => new Date(item.dt * 1000).toLocaleDateString('en-CA') === dateStr);
    if (dayData.length > 0) {
        const representativeData = dayData.find(d => new Date(d.dt*1000).getHours() > 10) || dayData[0];
        const dayName = dateStr === new Date().toLocaleDateString('en-CA') ? 'Today' : new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
        
        updateCurrentWeatherCard(document.getElementById('current-weather'), representativeData, dayName);
        updateAirConditionsCard(document.getElementById('air-conditions'), representativeData);
        updateHourlyForecastCard(document.getElementById('hourly-forecast'), dayData, `${dayName.toUpperCase()}'S FORECAST`);
    }
}

function getUserLocation() {
    const showRandomCity = () => {
        const randomCities = ['Tokyo', 'New York', 'Paris', 'London', 'Sydney', 'Dubai'];
        fetchWeather(randomCities[Math.floor(Math.random() * randomCities.length)]);
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
            displayLoader();
            fetch(url).then(res => res.json()).then(data => fetchWeather(data.name))
                .catch(err => { console.error("Error fetching weather by location:", err); showRandomCity(); });
        }, () => { console.log("Geolocation permission denied."); showRandomCity(); });
    } else {
        console.log("Geolocation not supported.");
        showRandomCity();
    }
}

function displayLoader() { weatherGrid.innerHTML = '<div class="loader"></div>'; }
function displayError(message) { weatherGrid.innerHTML = `<div class="placeholder"><h2>Error: ${message}. Please try again.</h2></div>`; }
