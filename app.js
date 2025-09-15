// ==========================
// 1️⃣ Constants / Config
// ==========================
const API_KEY = "d3fb1e90d1c85ea2e70a7770bc185ecb"; // 📝 get api key

const BASE_URL = "https://api.openweathermap.org/data/2.5/weather"; 
// 📝 url where the api listens for request
// make a variable for it to avoid repetition
// if OWM updates the endpoint we'd only have to change ts var

// ==========================
// 2️⃣ DOM Elements
// ==========================
const cityInput = document.getElementById("city-input");
const getWeatherBtn = document.getElementById("get-weather-btn");
const weatherDisplay = document.getElementById("weather-display");
const loadingMessage = document.getElementById("loading-message");

// ==========================
// 3️⃣ Helper Functions
// ==========================

// ✅ Reads the user input
function getCityInput() {
    return cityInput.value.trim();
    // 📝 removes white spaces
}

// ✅ Set Weather State
function setWeatherState(data) {
    // 1️⃣ clear old results
    weatherDisplay.innerHTML = ""; 
    // 2️⃣ extract values
    const cityName = data.name; // 📝 city name 
    const temperature = data.main.temp; // 📝 temperature     
    const description = data.weather[0].description; 
    // 📝 description of weather
    const iconCode = data.weather[0].icon;
    // 📝 var for the short code like "02d" to put in URL
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    // 📝 put iconCode here to get icon

    // 3️⃣ put values in html
    const html = `
        <h2>${cityName}</h2>
        <p>🌡 Temperature: ${temperature}°C</p>
        <p>📝 Description: ${description}</p>
        <img src="${iconUrl}" alt="${description}"> 
    `;

    // 4️⃣ insert html to weather display
    weatherDisplay.innerHTML = html;
}

// ✅ Set Loading State
function setLoadingState(isLoading) {
    if (isLoading) {
        // show "Loading..."
        loadingMessage.style.display = "block";
        // clear old results
        weatherDisplay.innerHTML = "";
    } else {
        // hide "Loading..."
        loadingMessage.style.display = "none";
    }
}

// ✅ Set Error State
function setErrorState(msg) {
    // 1️⃣ clear old results
    weatherDisplay.innerHTML = "";
    
    // 2️⃣ create an error message element 
    const errorMessage = document.createElement("p"); 
    //📝 create paragraph element
    errorMessage.textContent = msg;
    errorMessage.style.color = "red"; // inline style for now

    // 3️⃣ show it inside the weatherDisplay
    weatherDisplay.appendChild(errorMessage);
}

// ==========================
// 4️⃣ Core Functions
// ==========================

// ✅ Fetch weather data from API
async function fetchWeather(city) {
    // 📝 async = this func will run asynchronously (start now, finish later)
    // 📝 only use if func has await keyword

    try {
        // ✅ get object (string form)
        const response = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        // 📝 await = pauses here until fetch finishes, other code outside keeps running
        // 📝 fetch(url, options) = built-in JS func to make network request (usually APIs)
        // 📝 ?q=${city}&appid=${API_KEY}&units=metric = query params for API
        // q = city name
        // appid = API key (auth)
        // units = metric (Celsius), default = Kelvin

        // ✅ Error block if HTTP request failed (status not 200–299)
        if (!response.ok) throw new Error("API request failed");
        // 📝 throw = stops execution and jumps to catch

        // ✅ Turn response (string) into an actual object
        const data = await response.json();
        // 📝 .json() = reads response body string and parses into JS object

        console.log("Raw API data:", data);
        return data; // optional: can return for future use
    } catch (error) {
        // 📝 error = what went wrong (network, bad status, etc.)
        console.error("Error fetching weather:", error.message);
    }
}

// ==========================
// 5️⃣ Event Listeners / Initialization
// ==========================
getWeatherBtn.addEventListener("click", async () => {
    const city = getCityInput(); // 📝 user input gets stored here

    // 1️⃣ Handle empty input
    if (!city) {
        setErrorState("⚠️ Please enter a city");
        return; // 📝 stop here
    }

    // 2️⃣ Show loading
    setLoadingState(true);

    try {
        // run the try block: fetch weather data
        // we make `data` variable that gets the parsed object from the API
        // 3️⃣ Fetch weather data
        const data = await fetchWeather(city);

        if (data) {
            // if `data` exists, pass it to setWeatherState
            // inside setWeatherState, object values (like data.name) become variables
            // then we build the HTML and put it in the page
            // 4️⃣ Update UI with weather + save last city
            setWeatherState(data);

            // ✅ clear input after successful fetch
            cityInput.value = "";

            localStorage.setItem("lastCity", city); 
            // 📝 store to localStorage
        } else {
            // else, no data returned → pass "❌ City not found" to setErrorState
            // setErrorState clears display, makes a <p> element, sets its text & color, then appends it
            setErrorState("❌ City not found");
        }
    } catch (error) {
        // if something goes wrong in the try block (network/API error)
        // pass "🌐 Something went wrong. Try again." to setErrorState
        // also log the actual error to console
        setErrorState("🌐 Something went wrong. Try again.");
        console.error(error);
    } finally {
        // finally always runs → hide the loading state
        setLoadingState(false);
    }

});


window.addEventListener("DOMContentLoaded", async () => {
    // 📝 DOMContentLoaded = runs code as soon as all elements exist
    // window = the page/tab
    // Access the browser page/tab (window), then run this event 
    // when all the HTML elements on that page are fully loaded
    
    // 1️⃣ get lastCity from localStorage
    const lastCity = localStorage.getItem("lastCity");
    // 📝 getItem = looks for a value by its key ("lastCity", city)

    if (lastCity) { // 📝 if exist run code

        const data = await fetchWeather(lastCity); 
        // 📝 store weather info for city

        // 2️⃣ Updates the UI with the weather info    
        if (data) setWeatherState(data);
        // 📝 If `data` is truthy 
        // then run setWeatherState() and pass `data` into it
    }
});

// ✅ When user presses a key inside the input field...
cityInput.addEventListener("keydown", (e) => {
  // if that key is Enter
  if (e.key === "Enter") {
    e.preventDefault(); // 📝 stop default form behavior (like reloading page)
    getWeatherBtn.click(); // 📝 act like the "Get Weather" button was clicked
  }
});

