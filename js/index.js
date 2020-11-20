import { WEATHER_API_KEY as api, WEATHER_API_KEY } from "./apikey.js";

import { initEffects, unInitEffects, removeEffect } from "./effects.js";
import Forecast from "./Forecast.js";

let forecast = new Forecast();
const DAYS_FORECASTED = 5;

document.addEventListener("readystatechange", (event) => {
    if (event.target.readyState === "complete") {
        initApp();
    }
});

const initApp = () => {
    // App event listeners
    // Only enable 3d effects for non-mobile view
    if (window.innerWidth > 768 && !detectMobile()) {
        initEffects();
    }

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

    const entryForm = document.querySelector("#entry-form");
    entryForm.addEventListener("submit", (event) => {
        event.preventDefault();
        processSubmission();
    });

    const weekListItems = document.querySelectorAll(".week-list li");
    weekListItems.forEach((item) => {
        item.addEventListener("click", () => {
            removeActive();
            setActive(item);
            renderCards();
        });
    });

    const locationButton = document.querySelector(".location-button");
    locationButton.addEventListener("click", (event) => {
        event.preventDefault();
        clearInput();
        setFocus();
    });

    // Procedural
    refreshPage();
};

const processSubmission = async () => {
    try {
        // Get city, state, and country input
        const city = getCityInput();
        const state = getStateInput();
        const country = getCountryInput();

        // Fetch latitude and longitude data using city, state, and country
        const url = getUrlByCityStateCountry(city, state, country);
        const response = await fetch(url);
        const data = await response.json();
        const { lat, lon } = data.city.coord;

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

        // Render forecast data to page
        renderCards();
    } catch (error) {
        // TODO: Handle invalid input
        // Show error + focus on error + prompt user to try again
        console.log(error);
    }
};

// Page utils //

const removeActive = () => {
    document.querySelector(".active").classList.remove("active");
};

const getActive = () => {
    return document.querySelector(".active");
};

const setActive = (element) => {
    element.classList.add("active");
};

const getActiveIndex = () => {
    return getActive().dataset.day;
};

const clearInput = () => {
    document.getElementById("city").value = "";
    document.getElementById("state").value = "";
    document.getElementById("country").value = "";
};

const setFocus = () => {
    document.getElementById("city").focus();
};

const getCityInput = () => {
    return document.getElementById("city").value.trim();
};

const getStateInput = () => {
    return document.getElementById("state").value.trim();
};

const getCountryInput = () => {
    return document.getElementById("country").value.trim();
};

const refreshPage = async () => {
    clearInput();
    setFocus();
    hideCards();

    const storedLocation = getPersistentData();
    if (storedLocation !== undefined) {
        const { city, state, country, lat, lon } = storedLocation;

        // Update forecast object
        forecast.setCity(city);
        forecast.setState(state);
        forecast.setCountry(country);
        forecast.setCoords(lat, lon);
        forecast.clearList();

        // Get Weather
        await getForecastData();

        // Render
        renderCards();
    }
};

const hideCards = () => {
    hideWeatherCard();
    hideInfoCard();
};

const hideWeatherCard = () => {
    document.querySelector(".weather-card").style.display = "none";
};

const hideInfoCard = () => {
    document.querySelector(".info-card").style.display = "none";
};

const renderCards = () => {
    renderWeatherCard();
    renderInfoCard();
};

const renderWeatherCard = () => {
    // Show weather-card
    document.querySelector(".weather-card").style.display = "";

    // Get the weather info for the day that is selected in the week-list
    const { icon, temp, desc, dayDate, location } = getDailyWeatherData(
        getActiveIndex(),
    );

    // Set weather-icon
    document.querySelector(".weather-icon").src = icon;

    // Set weather temperature
    document.querySelector(
        ".weather-temperature",
    ).textContent = forecast.formatTemp(temp);

    // Set weather description
    document.querySelector(".weather-description").textContent = titleCase(
        desc,
    );

    // Set Day
    document.querySelector(".date-dayname").textContent = getDayNameFull(
        dayDate,
    );
    document.querySelector(".date-day").textContent = formatDayText(dayDate);

    // Set location
    document.querySelector(".location").textContent = titleCase(location);
};

const renderInfoCard = () => {
    // Show info-card
    document.querySelector(".info-card").style.display = "";

    // Get the weather info for the day that is selected in the week-list
    const { clouds, humidity, wind } = getDailyWeatherData(getActiveIndex());

    // Set cloudiness
    document.querySelector(
        "#cloudiness .info-value",
    ).textContent = `${clouds} %`;

    // Set humidity
    document.querySelector(
        "#humidity .info-value",
    ).textContent = `${humidity} %`;

    // Set wind speed
    document.querySelector(
        "#wind .info-value",
    ).textContent = `${wind} ${forecast.getSpeedUnit()}`;

    // Set week-list
    const weekListItems = document.querySelectorAll(".week-list li");
    weekListItems.forEach((item, day) => {
        const { icon, temp, dayDate } = getDailyWeatherData(day);
        item.querySelector(".day-icon").src = icon;
        item.querySelector(".day-temp").textContent = forecast.formatTemp(temp);
        item.querySelector(".day-name").textContent = getDayNameDDD(dayDate);
    });
};

// API Utils //

const getUrlByCityStateCountry = (city, state, country) => {
    return `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
        city,
    )},${encodeURIComponent(state)},${encodeURIComponent(
        country,
    )}&cnt=1&appid=${WEATHER_API_KEY}`;
};

const getUrlByCoords = (lat, lon, units) => {
    return `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${units}&appid=${WEATHER_API_KEY}`;
};

const getWeatherIconURL = (icon = "01d") => {
    return `http://openweathermap.org/img/wn/${icon}@2x.png`;
};

// Storage Utils //
const getPersistentData = () => {
    const persistentData = localStorage.getItem("location");
    if (!persistentData) return;
    return JSON.parse(persistentData);
};

const updatePersistentData = (city, state, country, lat, lon) => {
    localStorage.setItem(
        "location",
        JSON.stringify({ city, state, country, lat, lon }),
    );
};

// Weather utils //
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
const formatDayText = (date) => {
    return `${getMonthName(date)} ${date.getDate()}, ${date.getFullYear()}`;
};

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

const getDayNameDDD = (date) => {
    return getDayNameFull(date).toString().slice(0, 3);
};

const getLocationText = () => {
    return titleCase(`${forecast.getCity()}, ${forecast.getCountry()}`);
};

// Misc Utils //
const detectMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(
        navigator.userAgent,
    );
};

const titleCase = (s) => {
    return s.toLowerCase().replace(/(^|\s)\S/g, (L) => L.toUpperCase());
};
