const initEffects = () => {
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

    // Move animation event
    container.addEventListener("mousemove", (e) => {
        let xAxis = (window.innerWidth / 2 - e.pageX) / 25;
        let yAxis = (window.innerHeight / 2 - e.pageY) / 25;
        cardsContainer.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });

    container.addEventListener("mouseenter", (e) => {
        weatherContainer.style.transform = "translateZ(75px)";
        dateLocationContainer.style.transform = "translateZ(50px)";
        todayInfoContainer.style.transform = "translateZ(50px)";
        weekInfoContainer.style.transform = "translateZ(50px)";
        locationButtonContainer.style.transform = "translateZ(50px)";
    });

    container.addEventListener("mouseleave", (e) => {
        cardsContainer.style.transform = "rotateY(0) rotateX(0)";

        weatherContainer.style.transform = "translateZ(0)";
        dateLocationContainer.style.transform = "translateZ(0)";
        todayInfoContainer.style.transform = "translateZ(0)";
        weekInfoContainer.style.transform = "translateZ(0)";
        locationButtonContainer.style.transform = "translateZ(0)";
    });
};

export default initEffects;
