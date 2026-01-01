// OpenWeatherMap API Configuration
// IMPORTANT: Replace 'YOUR_API_KEY' with your actual OpenWeatherMap API key
// Get your free API key from: https://openweathermap.org/api
const API_KEY = 'da524db75fa879a348e6b81424b5b552';
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const DEFAULT_CITY = 'London'; // Default city to show on page load

// DOM Elements
const weatherForm = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const weatherCard = document.getElementById('weather-card');
const btnLoader = document.getElementById('btn-loader');

// Weather display elements
const cityNameEl = document.getElementById('city-name');
const currentDateTimeEl = document.getElementById('current-date-time');
const weatherIconEl = document.getElementById('weather-icon');
const temperatureEl = document.getElementById('temperature');
const weatherConditionEl = document.getElementById('weather-condition');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('wind-speed');

/**
 * Function to fetch weather data from OpenWeatherMap API
 * @param {string} city - The city name to fetch weather for
 * @returns {Promise<Object>} - Weather data object
 */
async function fetchWeatherData(city) {
    // Construct the API URL with city name, API key, and metric units (Celsius)
    const url = `${API_BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
    
    try {
        // Use fetch API to get weather data
        const response = await fetch(url);
        
        // Check if the response is successful
        if (!response.ok) {
            // If city not found (404) or other error
            if (response.status === 404) {
                throw new Error('City not found. Please check the city name and try again.');
            } else {
                throw new Error('Unable to fetch weather data. Please try again later.');
            }
        }
        
        // Parse the JSON response
        const data = await response.json();
        return data;
    } catch (error) {
        // Handle network errors or other exceptions
        throw error;
    }
}

/**
 * Function to update the current date and time display
 */
function updateDateTime() {
    const now = new Date();
    
    // Format the date and time
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    const formattedDateTime = now.toLocaleDateString('en-US', options);
    currentDateTimeEl.textContent = formattedDateTime;
}

/**
 * Function to display weather data on the page
 * @param {Object} data - Weather data object from API
 */
function displayWeather(data) {
    // Extract data from API response
    const cityName = data.name;
    const country = data.sys.country;
    const temperature = Math.round(data.main.temp); // Round to whole number
    const weatherCondition = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const iconCode = data.weather[0].icon;
    
    // Construct the weather icon URL
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    // Update DOM elements with weather data
    cityNameEl.textContent = `${cityName}, ${country}`;
    temperatureEl.textContent = temperature;
    weatherConditionEl.textContent = weatherCondition;
    humidityEl.textContent = `${humidity}%`;
    windSpeedEl.textContent = `${windSpeed} m/s`;
    weatherIconEl.src = iconUrl;
    weatherIconEl.alt = weatherCondition;
    
    // Update date and time
    updateDateTime();
    
    // Show the weather card
    hideError();
    hideLoader();
    weatherCard.classList.add('show');
}

/**
 * Function to show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    weatherCard.classList.remove('show');
    hideLoader();
}

/**
 * Function to hide error message
 */
function hideError() {
    errorMessage.classList.remove('show');
}

/**
 * Function to show loading spinner
 */
function showLoader() {
    loader.classList.add('show');
    searchBtn.classList.add('loading');
    weatherCard.classList.remove('show');
    hideError();
}

/**
 * Function to hide loading spinner
 */
function hideLoader() {
    loader.classList.remove('show');
    searchBtn.classList.remove('loading');
}

/**
 * Function to handle form submission
 * @param {Event} e - Form submit event
 */
async function handleFormSubmit(e) {
    e.preventDefault(); // Prevent page reload
    
    // Get the city name from input and trim whitespace
    const city = cityInput.value.trim();
    
    // Check if city input is not empty
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    // Show loading spinner
    showLoader();
    
    try {
        // Fetch weather data for the entered city
        const weatherData = await fetchWeatherData(city);
        
        // Display the weather data
        displayWeather(weatherData);
        
        // Clear the input field
        cityInput.value = '';
    } catch (error) {
        // Display error message if something goes wrong
        showError(error.message);
    }
}

/**
 * Function to load default city weather on page load
 */
async function loadDefaultWeather() {
    // Show loading spinner
    showLoader();
    
    try {
        // Fetch weather data for the default city
        const weatherData = await fetchWeatherData(DEFAULT_CITY);
        
        // Display the weather data
        displayWeather(weatherData);
    } catch (error) {
        // If default city fails, just hide loader and show card in empty state
        hideLoader();
        // User can still search for other cities
        console.error('Failed to load default weather:', error.message);
    }
}

// Event Listeners

// Listen for form submission
weatherForm.addEventListener('submit', handleFormSubmit);

// Update date and time every minute
updateDateTime(); // Initial update
setInterval(updateDateTime, 60000); // Update every 60 seconds

// Load default city weather when page loads
window.addEventListener('DOMContentLoaded', loadDefaultWeather);

