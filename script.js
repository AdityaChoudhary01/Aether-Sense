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
  }
  else {
    weatherInfo.innerHTML = '';
  }
}

// Function to display weather information
function showWeather(weatherData) {
  // Clear previous weather data
  weatherInfo.innerHTML = '';

  // Get relevant weather data
  const city = weatherData.name;
  const temperature = Math.round(weatherData.main.temp - 273.15); // Convert temperature to Celsius
  const description = weatherData.weather[0].description;

  // Create HTML elements to display weather information
  const cityElement = document.createElement('h2');
  cityElement.textContent = city;

  const tempElement = document.createElement('p');
  tempElement.innerHTML = `Temperature: ${temperature}&deg;C`;

  const descElement = document.createElement('p');
  descElement.textContent = `Description: ${description}`;

  // Append elements to weatherInfo div
  weatherInfo.appendChild(cityElement);
  weatherInfo.appendChild(tempElement);
  weatherInfo.appendChild(descElement);
}
