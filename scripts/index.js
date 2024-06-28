document.addEventListener("DOMContentLoaded", () => {
    let lastInteractionTime = Date.now();
    const hintTimeout = 5000; // Time in milliseconds (e.g., 5000ms = 5 seconds)

    function showHint() {
        const hintElement = document.getElementById("hint");
        if (hintElement) {
            hintElement.style.opacity = "1";
        }
    }

    function hideHint() {
        const hintElement = document.getElementById("hint");
        if (hintElement) {
            hintElement.style.opacity = "0";
        }
    }

    function updateInteractionTime() {
        lastInteractionTime = Date.now();
        hideHint();
    }

    document.addEventListener("click", updateInteractionTime);
    document.addEventListener("mousemove", updateInteractionTime);
    document.addEventListener("keypress", updateInteractionTime);

    setInterval(() => {
        if (Date.now() - lastInteractionTime > hintTimeout) {
            showHint();
        }
    }, 1000); // Check every second

    const fadeInElements = document.querySelectorAll(
        ".main-title, .subtitle, .card"
    );
    const titleFadeInDelay = 500; // Delay for the main title in milliseconds
    const subtitleFadeInDelay = 1000; // Delay for the subtitle in milliseconds
    const initialCardDelay = 1000; // Initial delay before the first card appears (after subtitle is shown) in milliseconds
    const cardStaggerDelay = 250; // Delay between each card appearance in milliseconds

    fadeInElements.forEach((el, index) => {
        let delay;
        if (el.classList.contains("main-title")) {
            delay = titleFadeInDelay;
        } else if (el.classList.contains("subtitle")) {
            delay = subtitleFadeInDelay;
        } else {
            delay = initialCardDelay + (index - 2) * cardStaggerDelay;
        }
        setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
        }, delay);
    });

    document.querySelectorAll(".card").forEach((card) => {
        card.addEventListener("mouseover", () => {
            card.style.transform = "translateY(-10px)";
            card.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.2)";
        });

        card.addEventListener("mouseout", () => {
            card.style.transform = "translateY(0)";
            card.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
        });
    });
});
