// Movement animation
const cardsContainer = document.querySelector(".cards-container");
const container = document.querySelector(".container");
const weatherContainer = document.querySelector(".weather-container");
const dateLocationContainer = document.querySelector(
    ".date-location-container",
);
const todayInfoContainer = document.querySelector(".today-info-container");
const weekInfoContainer = document.querySelector(".week-info-container");
const locationButtonContainer = document.querySelector(
    ".location-button-container",
);

export const rotationEffect = (event) => {
    let xAxis = (window.innerWidth / 2 - event.pageX) / 25;
    let yAxis = (window.innerHeight / 2 - event.pageY) / 25;
    cardsContainer.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
};

export const popOutEffect = (event) => {
    weatherContainer.style.transform = "translateZ(75px)";
    dateLocationContainer.style.transform = "translateZ(50px)";
    todayInfoContainer.style.transform = "translateZ(50px)";
    weekInfoContainer.style.transform = "translateZ(50px)";
    locationButtonContainer.style.transform = "translateZ(50px)";
};

export const removeEffect = (event) => {
    cardsContainer.style.transform = "rotateY(0) rotateX(0)";

    weatherContainer.style.transform = "translateZ(0)";
    dateLocationContainer.style.transform = "translateZ(0)";
    todayInfoContainer.style.transform = "translateZ(0)";
    weekInfoContainer.style.transform = "translateZ(0)";
    locationButtonContainer.style.transform = "translateZ(0)";
};

export const initEffects = () => {
    container.addEventListener("mousemove", rotationEffect);
    container.addEventListener("mouseenter", popOutEffect);
    container.addEventListener("mouseleave", removeEffect);
};

export const unInitEffects = () => {
    container.removeEventListener("mousemove", rotationEffect);
    container.removeEventListener("mouseenter", popOutEffect);
    container.removeEventListener("mouseleave", removeEffect);
};
