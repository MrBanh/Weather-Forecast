export default class Forecast {
    constructor() {
        this._city = "";
        this._state = "";
        this._country = "";
        this._coords = {
            lat: "",
            lon: "",
        };

        this._measureSystem = "imperial";
        this._list = [];
    }

    setCity(city) {
        this._city = city;
    }

    getCity() {
        return this._city;
    }

    setState(state) {
        this._state = state;
    }

    getState() {
        return this._state;
    }

    setCountry(country) {
        this._country = country;
    }

    getCountry() {
        return this._country;
    }

    setCoords(latitude, longitude) {
        this._coords.lat = latitude;
        this._coords.lon = longitude;
    }

    getCoords() {
        return this._coords;
    }

    setMeasureSystem(system) {
        if (
            system.toLowerCase() === "imperial" ||
            system.toLowerCase() === "metric"
        ) {
            this._measureSystem = system;
        }
        return;
    }

    getMeasureSystem() {
        return this._measureSystem;
    }

    getSpeedUnit() {
        switch (this._measureSystem) {
            case "imperial":
                return "mph";
            case "metric":
                return "m/s";
        }
    }

    getTempUnit() {
        switch (this._measureSystem) {
            case "imperial":
                return "°F";
            case "metric":
                return "°C";
        }
    }

    formatTemp(temp) {
        return `${parseInt(temp)} ${this.getTempUnit()}`;
    }

    addToList(weather) {
        this._list.push(weather);
    }

    getList() {
        return this._list;
    }

    clearList() {
        this._list = [];
    }

    getWeather(index) {
        return this._list[index];
    }
}
