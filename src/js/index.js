import { initEffects, unInitEffects, removeEffect } from "./effects.js";
import Forecast from "./Forecast.js";

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
let forecast = new Forecast();
const DAYS_FORECASTED = 5;

// Form elements selectors
const entryFormElement = document.querySelector("#entry-form");
const entryFormInputElements = Array.from(
    entryFormElement.getElementsByTagName("input"),
);
const cityInputElement = document.getElementById("city");
const stateInputElement = document.getElementById("state");
const countryInputElement = document.getElementById("country");
const lookUpBtnElement = document.getElementById("btn-lookUp");
const invalidFormFeedbackElement = document.getElementById(
    "invalid-form-feedback",
);
const confirmationElement = document.getElementById("confirmation");

// Card elements selectors
// Weather card
const weatherCardElement = document.querySelector(".weather-card");
const weatherIconElement = document.querySelector(".weather-icon");
const weatherTemperatureElement = document.querySelector(
    ".weather-temperature",
);
const weatherDescriptionElement = document.querySelector(
    ".weather-description",
);
const dateDayNameElement = document.querySelector(".date-dayname");
const dateDayElement = document.querySelector(".date-day");
const locationElement = document.querySelector(".location");

// Info Card
const infoCardElement = document.querySelector(".info-card");
const cloudsElement = document.querySelector("#cloudiness .info-value");
const humidityElement = document.querySelector("#humidity .info-value");
const windElement = document.querySelector("#wind .info-value");
const weekListItemElements = document.querySelectorAll(".week-list li");
const changeLocationBtnElement = document.querySelector(".location-button");

// When DOM loads in
document.addEventListener("readystatechange", (event) => {
    if (event.target.readyState === "complete") {
        initApp();
    }
});

/**
 * @description Initializes the web app with event listeners
 */
const initApp = () => {
    // App event listeners

    // Only enable 3d effects for non-mobile view
    if (window.innerWidth > 768 && !detectMobile()) {
        initEffects();
    }

    // If user changes screen size, detect if it's desktop or mobile view
    window.addEventListener("resize", (event) => {
        // If not mobile view
        if (window.innerWidth > 768 && !detectMobile()) {
            // enable 3d effects
            initEffects();
        } else {
            // if resized to desktop view, disable 3d effects
            unInitEffects();
            // remove 3d effect in the case user was previously in desktop view
            removeEffect();
        }
    });

    // Event listeners for forecast search form
    entryFormElement.addEventListener("submit", (event) => {
        event.preventDefault();
        processSubmission();
        lookUpBtnElement.focus();
    });

    entryFormInputElements.forEach((input) => {
        input.addEventListener("focus", () => {
            if (invalidFormFeedbackElement.style.visibility === "visible") {
                hideInvalidFormFeedback();
            }
            updateScreenReaderConfirmation("");
        });
    });

    // Event listener for week-list items
    weekListItemElements.forEach((item) => {
        item.addEventListener("keypress", (event) => {
            // For screen reader users, allow users to use spacebar or enter key to select
            // one of the week-list item
            if (a11yKeyboardClick(event)) {
                removeActive();
                setActive(item);
                renderCards();
            }
        });

        item.addEventListener("click", () => {
            removeActive();
            setActive(item);
            renderCards();
        });
    });

    // Event listener for location-button
    changeLocationBtnElement.addEventListener("click", (event) => {
        event.preventDefault();
        clearInput();
        setFocus();
    });

    // Procedural
    refreshPage();
};

/**
 * @description 
 *  Obtain the user input
 *  Asynchronously get latitude and longitude,
 *  Confirm user input for screen reader
 *  Update storage
 *  Fetch weather forecast
 */
const processSubmission = async () => {
    try {
        // Get city, state, and country input
        const city = getCityInput();
        const state = getStateInput();
        let country = getCountryInput();

        // For screen readers, repeat to user their input
        updateScreenReaderConfirmation(
            `Searching for ${city}, ${state} ${country}`,
        );

        // Fetch latitude and longitude data using city, state, and country
        const url = getUrlByCityStateCountry(city, state, country);
        const response = await fetch(url);
        const data = await response.json();
        const { lat, lon } = data.city.coord;
        country = data.city.country; // in case user did not enter country

        // Update forecast object
        forecast.setCity(city);
        forecast.setState(state);
        forecast.setCountry(country);
        forecast.setCoords(lat, lon);
        forecast.clearList();

        // Update persistent storage
        updatePersistentData(city, state, country, lat, lon);

        // Get Weather Forecast and update forecast object
        await getForecastData();

        // Reset the active week-list item upon user submission
        removeActive();
        setActive(weekListItemElements[0]);

        // Render forecast data to page
        renderCards();
    } catch (error) {
        showInvalidFormFeedback();
    }
};

// Page utils //

/**
 * @description
 *  Removes the "active" class from the element
 *  Stops screen reader from mentioning the element as selected
 */
const removeActive = () => {
    const element = document.querySelector(".active");
    element.classList.remove("active");
    element.removeAttribute("aria-selected"); // for screen readers
};

/**
 * @returns {HTMLLIElement} - current element with an active class
 */
const getActive = () => {
    return document.querySelector(".active");
};

/**
 * @description
 *  Adds the active class to the week-list item selected by user
 *  Sets aria-selected to true for screen readers to know which item they selected
 * @param {HTMLLIElement} element - user selected week-list item
 */
const setActive = (element) => {
    element.classList.add("active");

    // For screen readers, let user know which tab is active
    element.setAttribute("aria-selected", true);
};

/**
 * @returns {string | number} - the value in the data-day attribute of the week-list li tags
 */
const getActiveIndex = () => {
    return getActive().dataset.day;
};

/**
 * @description
 *  Clears city, state, and country input box
 */
const clearInput = () => {
    cityInputElement.value = "";
    stateInputElement.value = "";
    countryInputElement.value = "";
};

/**
 * @description
 *  Sets focus event on city input box
 */
const setFocus = () => {
    cityInputElement.focus();
};

/**
 * @returns {string} - The text input from city input box, in title case
 */
const getCityInput = () => {
    return titleCase(cityInputElement.value.trim());
};

/**
 * @returns {string} -The text input from state input box, in all upper case
 */
const getStateInput = () => {
    return stateInputElement.value.trim().toUpperCase();
};

/**
 * @returns {string} - The text input from country input box, in all upper case
 */
const getCountryInput = () => {
    return countryInputElement.value.trim().toUpperCase();
};

/**
 * @description
 *  Makes the invalid feedback available to user and screen readers if we cannot find weather
 *  forecast with their input
 */
const showInvalidFormFeedback = () => {
    invalidFormFeedbackElement.style.visibility = "visible";
    invalidFormFeedbackElement.removeAttribute("aria-hidden");
    invalidFormFeedbackElement.setAttribute("tabindex", 0);
};

/**
 * @description
 *  Hides the invalid feedback from display and screen readers
 */
const hideInvalidFormFeedback = () => {
    invalidFormFeedbackElement.style.visibility = "hidden";
    invalidFormFeedbackElement.setAttribute("aria-hidden", true);
    invalidFormFeedbackElement.setAttribute("tabindex", -1);
};

/**
 * @description
 *  Clears all inputs
 *  Set focus to city input box
 *  Hides the weather cards
 *  Pulls user's default location from persistent storage (local storage)
 *  If persistent data has data, update forecast object and render weather cards
 */
const refreshPage = async () => {
    clearInput();
    setFocus();
    hideCards();

    const storedLocation = getPersistentData();
    if (storedLocation !== undefined) {
        const { city, state, country, lat, lon } = storedLocation;

        // Update forecast object
        forecast.setCity(titleCase(city));
        forecast.setState(state.toUpperCase());
        forecast.setCountry(country.toUpperCase());
        forecast.setCoords(lat, lon);
        forecast.clearList();

        // Get Weather
        await getForecastData();

        // Render
        renderCards();
    }
};

/**
 * @description
 *  Hides the weather card and info card
 */
const hideCards = () => {
    hideWeatherCard();
    hideInfoCard();
};

/**
 * @description
 *  Hides the weather card
 */
const hideWeatherCard = () => {
    weatherCardElement.style.display = "none";
};

/**
 * @description
 *  Hides the info card
 */
const hideInfoCard = () => {
    infoCardElement.style.display = "none";
};

/**
 * @description
 *  Renders the weather card and info card
 */
const renderCards = () => {
    renderWeatherCard();
    renderInfoCard();
};

/**
 * @description
 *  Displays the weather card
 *  Obtain the selected weather data (based on which week-list item is selected)
 *  Display the weather icon, temperature, description, date, and location based on selected weather data
 */
const renderWeatherCard = () => {
    // Show weather-card
    weatherCardElement.style.display = "";

    // Get the weather info for the day that is selected in the week-list
    const { icon, temp, desc, dayDate, location } = getDailyWeatherData(
        getActiveIndex(),
    );

    // Set weather-icon
    weatherIconElement.src = icon;
    weatherIconElement.alt = `${desc} image`;

    // Set weather temperature
    weatherTemperatureElement.textContent = forecast.formatTemp(temp);

    // Set weather description
    weatherDescriptionElement.textContent = titleCase(desc);

    // Set Day
    dateDayNameElement.textContent = getDayNameFull(dayDate);
    dateDayElement.textContent = formatDayText(dayDate);

    // Set location
    locationElement.textContent = location;
};

/**
 * @description
 *  Show the info card
 *  Obtain the selected weather data based on which week-list item was selected
 *  Display cloudiness, humidity, wind speed
 *  Obtain 5 day forecast
 *  Display the weather icon, temperature, and day as a list for next 5 day forecast
 */
const renderInfoCard = () => {
    // Show info-card
    infoCardElement.style.display = "";

    // Get the weather info for the day that is selected in the week-list
    const { clouds, humidity, wind } = getDailyWeatherData(getActiveIndex());

    // Set cloudiness
    cloudsElement.textContent = `${clouds} %`;

    // Set humidity
    humidityElement.textContent = `${humidity} %`;

    // Set wind speed
    windElement.textContent = `${wind} ${forecast.getSpeedUnit()}`;

    // Set week-list
    weekListItemElements.forEach((item, day) => {
        const { icon, temp, dayDate } = getDailyWeatherData(day);

        // Set aria-label for each week list item for screen reader
        item.setAttribute(
            "aria-label",
            `${getDayNameFull(dayDate)} ${forecast.formatTemp(temp)}`,
        );

        // Display weather icon, temperature, and day name on week list
        item.querySelector(".day-icon").src = icon;
        item.querySelector(".day-temp").textContent = forecast.formatTemp(temp);
        item.querySelector(".day-name").textContent = getDayNameDDD(dayDate);
    });
};

/**
 * @description
 * For screen readers, it will read back their submitted input as confirmation
 * @param {string} text - String to read back to screen reader
 */
const updateScreenReaderConfirmation = (text) => {
    confirmationElement.textContent = text;
};

// API Utils //

/**
 * @param {string} city - City input
 * @param {string} state - State input
 * @param {string} country - Country input
 * @returns {string} - Openweathermap URL with specified city, state, and country parameters
 */
const getUrlByCityStateCountry = (city, state, country) => {
    return `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        city,
    )},${encodeURIComponent(state)},${encodeURIComponent(
        country,
    )}&cnt=1&appid=${WEATHER_API_KEY}`;
};

/**
 * @param {string} lat - Latitude
 * @param {string} lon - Longitude
 * @param {string} units - Measurement system, metric or imperial
 * @returns {string} - Openweathermap URL with latitude and longitude parameters
 */
const getUrlByCoords = (lat, lon, units) => {
    return `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${WEATHER_API_KEY}`;
};

/**
 * @param {string} icon - Icon string from API
 * @returns {string} - Openweathermap URL for getting weather icon
 */
const getWeatherIconURL = (icon = "01d") => {
    return `http://openweathermap.org/img/wn/${icon}@2x.png`;
};

// Storage Utils //

/**
 * @returns {Object} - The "location" key's values from localStorage if any
 */
const getPersistentData = () => {
    const persistentData = localStorage.getItem("location");
    if (!persistentData) return;
    return JSON.parse(persistentData);
};

/**
 * @description
 *  Stores data in localStorage
 * @param {string} city - City
 * @param {string} state - State
 * @param {string} country - Country
 * @param {string} lat - latitude
 * @param {string} lon - longitude
 */
const updatePersistentData = (city, state, country, lat, lon) => {
    localStorage.setItem(
        "location",
        JSON.stringify({ city, state, country, lat, lon }),
    );
};

// Weather utils //

/**
 * @description
 *  Obtains weather forecast using latitude and longitude, and updates the
 *  forecast object's {Object[]} _list property to contain 5 days forecast
 */
const getForecastData = async () => {
    const { lat, lon } = forecast.getCoords();
    const url = getUrlByCoords(lat, lon, forecast.getMeasureSystem());
    const response = await fetch(url);
    const data = await response.json();

    forecast.addToList(data.current);

    for (let i = 1; i < DAYS_FORECASTED; ++i) {
        forecast.addToList(data.daily[i]);
    }
};

/**
 * @description
 *  Gets the weather data from the forecast object's _list property, based on day (0 - 4)
 * @param {number} day - between 0 - 4
 * @returns {Object} - weather data
 */
const getDailyWeatherData = (day) => {
    const selectedDay = forecast.getList()[day];

    // weather-icon url
    const icon = getWeatherIconURL(selectedDay.weather[0].icon);

    // weather temperature
    const temp = selectedDay.temp.day ? selectedDay.temp.day : selectedDay.temp;

    // weather description
    const desc = selectedDay.weather[0].description;

    // day date
    const dayDate = new Date(selectedDay.dt * 1000);

    // location
    const location = getLocationText();

    // cloudiness
    const clouds = selectedDay.clouds;

    // humidity
    const humidity = selectedDay.humidity;

    // wind speed
    const wind = selectedDay.wind_speed;

    return { icon, temp, desc, dayDate, location, clouds, humidity, wind };
};

// Date Location Utils //

/**
 * 
 * @param {Date object} date - Date
 * @returns {string} - Formatted string of the date as MM DD, YYYY
 */
const formatDayText = (date) => {
    return `${getMonthName(date)} ${date.getDate()}, ${date.getFullYear()}`;
};

/**
 * @param {Date object} date - Date
 * @returns {string} - Month abbreviated to 3 letters
 */
const getMonthName = (date) => {
    return [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ][date.getMonth()];
};

/**
 * @param {Date object} date - Date
 * @returns {string} - Full day name based on the date
 */
const getDayNameFull = (date) => {
    return [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ][date.getDay()];
};

/**
 * 
 * @param {Date object} date - date
 * @returns {string} - Day name abbreviated to 3 letters
 */
const getDayNameDDD = (date) => {
    return getDayNameFull(date).toString().slice(0, 3);
};

/**
 * @returns {string} - City, Country
 */
const getLocationText = () => {
    return `${forecast.getCity()}, ${forecast.getCountry()}`;
};

// Misc Utils //

/**
 * @returns {boolean} - True if browser detects mobile device, false otherwise
 */
const detectMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(
        navigator.userAgent,
    );
};

/**
 * @param {string} s 
 * @returns {string} - s in title case (for example -> For Example)
 */
const titleCase = (s) => {
    return s.toLowerCase().replace(/(^|\s)\S/g, (L) => L.toUpperCase());
};

/**
 * @param {Event} event - event that took place in the DOM
 * @returns {boolean} - True if enter or space key was pressed, false otherwise
 */
const a11yKeyboardClick = (event) => {
    const code = event.charCode || event.keyCode;
    return code === 32 || code === 13;
};
