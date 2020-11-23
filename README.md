# INF651 Front End Web Development I - Final Project

[![Netlify Status](https://api.netlify.com/api/v1/badges/753e15f6-5cb0-4abb-9243-e3a0935548f2/deploy-status)](https://app.netlify.com/sites/tony-banh-weather-forecast/deploys)

## Requirements:
   - [x] The current weather conditions for a default location should display when the app loads. The weather display should include the icon provided by the API.
   - [x] Users should be able to save their location as persistent data which is used as the default when the app loads
   - [x] Users should be able to search for the current weather in other locations
   - [x] Users should be able to navigate your app with a keyboard and screen reader
   - [x] You will deploy your app to a free Netlify account by enabling continuous deployment from GitHub to Netlify

## App will retrieve data from the Open Weather API:
   \- OpenWeather Documentation: [https://openweathermap.org/current](https://openweathermap.org/current)

   \- OpenWeather API: [https://home.openweathermap.org/users/sign_up](https://home.openweathermap.org/users/sign_up)

## Project Submission:
    - A link to your GitHub code repository
    - A link to your deployed app on Netlify
    - A one page PDF document discussing what challenges you faced while building your project.
    - Share your project and the key parts of your discussion in the final project forum in Blackboard.

# Bundled using Parcel JS
To run on local server: 

   1. Clone the repo
   2. In your terminal

         `npm install`

   3. Get a free API key from [OpenWeatherMap](https://home.openweathermap.org/users/sign_up)
   4. Create a .env file in the root directory. In the .env file, enter:

      `WEATHER_API_KEY={api key}`

   5. Back in your terminal:

      `npm run dev`
