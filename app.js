// Your OpenWeatherMap API Key
const API_KEY = 'fdc6536cb2c63b617321bd4b27c0e46d';  // Replace with your actual API key
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const searchBtn = document.getElementById('search-btn');
const cityInput = document.getElementById('city-input');

function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) return showError('Please enter a city name');
    if (city.length < 2) return showError('City name too short');
    getWeather(city);
    cityInput.value = '';
}

searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') handleSearch();
});
// Function to fetch weather data
function getWeather(city) {
    // Build the complete URL
    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;
    
    // Make API call using Axios
    axios.get(url)
        .then(function(response) {
            // Success! We got the data
            console.log('Weather Data:', response.data);
            displayWeather(response.data);
        })
        .catch(function(error) {
            // Something went wrong
            console.error('Error fetching weather:', error);
            document.getElementById('weather-display').innerHTML = 
                '<p class="loading">Could not fetch weather data. Please try again.</p>';
        });
}
async function getWeather(city) {
    showLoading(); // display spinner
    
    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;
    
    try {
        const response = await axios.get(url);
        displayWeather(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            showError('City not found. Please check the spelling and try again.');
        } else {
            showError('Something went wrong. Please try again later.');
        }
    }
}
//
// Function to display weather data
function displayWeather(data) {
    // Extract the data we need
    const cityName = data.name;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    
    // Create HTML to display
    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${cityName}</h2>
            <img src="${iconUrl}" alt="${description}" class="weather-icon">
            <div class="temperature">${temperature}°C</div>
            <p class="description">${description}</p>
        </div>
    `;
    
    // Put it on the page
    document.getElementById('weather-display').innerHTML = weatherHTML;
}

// Call the function when page loads
getWeather('London');