// ==============================
// WeatherApp Constructor
// ==============================
function WeatherApp(apiKey) {

    this.apiKey = apiKey;

    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    this.searchBtn = document.getElementById("search-btn");
    this.cityInput = document.getElementById("city-input");
    this.weatherDisplay = document.getElementById("weather-display");
    this.recentContainer = document.getElementById("recent-searches");

    this.recentSearches = JSON.parse(localStorage.getItem("recentCities")) || [];

    this.init();
}


// ==============================
// Initialize App
// ==============================
WeatherApp.prototype.init = function () {

    this.searchBtn.addEventListener(
        "click",
        this.handleSearch.bind(this)
    );

    this.cityInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            this.handleSearch();
        }
    });

    this.renderRecentSearches();

    if (this.recentSearches.length > 0) {
        this.getWeather(this.recentSearches[0]);
    } else {
        this.showWelcome();
    }
};


// ==============================
// Handle Search
// ==============================
WeatherApp.prototype.handleSearch = function () {

    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError("Please enter a city name");
        return;
    }

    if (city.length < 2) {
        this.showError("City name must be at least 2 characters");
        return;
    }

    this.saveRecentSearch(city);

    this.getWeather(city);

    this.cityInput.value = "";
};


// ==============================
// Save Recent Searches
// ==============================
WeatherApp.prototype.saveRecentSearch = function (city) {

    this.recentSearches = this.recentSearches.filter(
        c => c.toLowerCase() !== city.toLowerCase()
    );

    this.recentSearches.unshift(city);

    if (this.recentSearches.length > 5) {
        this.recentSearches.pop();
    }

    localStorage.setItem(
        "recentCities",
        JSON.stringify(this.recentSearches)
    );

    this.renderRecentSearches();
};


// ==============================
// Render Recent Searches
// ==============================
WeatherApp.prototype.renderRecentSearches = function () {

    if (!this.recentContainer) return;

    const buttons = this.recentSearches.map(city => `
        <button class="recent-btn">${city}</button>
    `).join("");

    this.recentContainer.innerHTML = buttons;

    const btns = document.querySelectorAll(".recent-btn");

    btns.forEach(btn => {
        btn.addEventListener("click", () => {
            this.getWeather(btn.textContent);
        });
    });
};


// ==============================
// Get Weather
// ==============================
WeatherApp.prototype.getWeather = async function (city) {

    this.showLoading();

    this.searchBtn.disabled = true;
    this.searchBtn.textContent = "Searching...";

    try {

        const [currentWeather, forecastData] = await Promise.all([

            axios.get(`${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`),

            axios.get(`${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`)

        ]);

        this.displayWeather(currentWeather.data);

        this.displayForecast(forecastData.data);

    } catch (error) {

        if (error.response && error.response.status === 404) {
            this.showError("City not found.");
        } else {
            this.showError("Something went wrong.");
        }

    } finally {

        this.searchBtn.disabled = false;
        this.searchBtn.textContent = "Search";

    }
};


// ==============================
// Display Current Weather
// ==============================
WeatherApp.prototype.displayWeather = function (data) {

    const cityName = data.name;
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;

    const iconUrl =
        `https://openweathermap.org/img/wn/${icon}@2x.png`;

    const html = `
        <div class="weather-info">
            <h2>${cityName}</h2>
            <img src="${iconUrl}">
            <div class="temperature">${temp}°C</div>
            <p>${description}</p>
        </div>
    `;

    this.weatherDisplay.innerHTML = html;
};


// ==============================
// Process Forecast Data
// ==============================
WeatherApp.prototype.processForecastData = function (data) {

    const forecasts = data.list.filter(item =>
        item.dt_txt.includes("12:00:00")
    );

    return forecasts.slice(0, 5);
};


// ==============================
// Display Forecast
// ==============================
WeatherApp.prototype.displayForecast = function (data) {

    const days = this.processForecastData(data);

    const forecastHTML = days.map(day => {

        const date = new Date(day.dt * 1000);

        const dayName =
            date.toLocaleDateString("en-US", { weekday: "short" });

        const temp = Math.round(day.main.temp);

        const icon = day.weather[0].icon;

        const iconUrl =
            `https://openweathermap.org/img/wn/${icon}@2x.png`;

        return `
            <div class="forecast-card">
                <h4>${dayName}</h4>
                <img src="${iconUrl}">
                <div>${temp}°C</div>
            </div>
        `;

    }).join("");

    const section = `
        <div class="forecast-section">
            <h3>5-Day Forecast</h3>
            <div class="forecast-container">
                ${forecastHTML}
            </div>
        </div>
    `;

    this.weatherDisplay.innerHTML += section;
};


// ==============================
// Loading
// ==============================
WeatherApp.prototype.showLoading = function () {

    this.weatherDisplay.innerHTML = `
        <p class="loading">Loading weather...</p>
    `;
};


// ==============================
// Error
// ==============================
WeatherApp.prototype.showError = function (msg) {

    this.weatherDisplay.innerHTML = `
        <p class="error">${msg}</p>
    `;
};


// ==============================
// Welcome
// ==============================
WeatherApp.prototype.showWelcome = function () {

    this.weatherDisplay.innerHTML = `
        <h2>🌤 SkyFetch Weather</h2>
        <p>Search for a city to view weather.</p>
    `;
};


// ==============================
// Start App
// ==============================
const app = new WeatherApp("fdc6536cb2c63b617321bd4b27c0e46d");