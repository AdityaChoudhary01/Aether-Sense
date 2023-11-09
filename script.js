// API Key (Register for free at https://openweathermap.org/ to obtain your own API key)
const apiKey = 'ce3183994d80cc50bcc6ad9c92131351';

// Select elements
const searchBtn = document.querySelector('#search-btn');
const cityInput = document.querySelector('#city');
const weatherInfo = document.querySelector('#weather-info');

// Event listener for search button click
searchBtn.addEventListener('click', searchWeather);

// Function to fetch weather data from OpenWeatherMap API
function searchWeather() {
  const cityName = cityInput.value.trim();
  if (cityName !== '') {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        showWeather(data);
      })
      .catch(error => {
        console.log('An error occurred:', error);
      });
  } else {
    weatherInfo.innerHTML = '';
  }
}

// Function to display weather information
function showWeather(weatherData) {
  // Clear previous weather data
  weatherInfo.innerHTML = '';

  // Get relevant weather data
  const city = weatherData.name;
  const temperature = Math.round(weatherData.main.temp - 273.15) + '°C'; // Convert temperature to Celsius
  const feelsLike = Math.round(weatherData.main.feels_like - 273.15) + '°C'; // Convert feels like temperature to Celsius
  const windSpeed = weatherData.wind.speed + ' m/s';
  const humidity = weatherData.main.humidity + '%';
  const cloudiness = weatherData.clouds.all + '%';
  const rainChance = weatherData.rain ? weatherData.rain['1h'] + 'mm' : '0mm'; // Rainfall in the last hour, if available

  // Create HTML elements to display weather information
  const cityElement = document.createElement('h2');
  cityElement.textContent = city;

  const tempElement = createWeatherItem('Temperature', temperature);
  const feelsLikeElement = createWeatherItem('Feels Like', feelsLike);
  const windElement = createWeatherItem('Wind Speed', windSpeed);
  const humidityElement = createWeatherItem('Humidity', humidity);
  const cloudElement = createWeatherItem('Cloudiness', cloudiness);
  const rainElement = createWeatherItem('Rain Chance', rainChance);

  // Append elements to weatherInfo div
  weatherInfo.appendChild(cityElement);
  weatherInfo.appendChild(tempElement);
  weatherInfo.appendChild(feelsLikeElement);
  weatherInfo.appendChild(windElement);
  weatherInfo.appendChild(humidityElement);
  weatherInfo.appendChild(cloudElement);
  weatherInfo.appendChild(rainElement);
}

// Helper function to create weather information item
function createWeatherItem(label, value) {
  const itemElement = document.createElement('p');
  const labelElement = document.createElement('span');
  const valueElement = document.createElement('span');

  labelElement.textContent = label + ': ';
  valueElement.textContent = value;

  itemElement.classList.add('weather-item');
  itemElement.appendChild(labelElement);
  itemElement.appendChild(valueElement);

  return itemElement;
}
