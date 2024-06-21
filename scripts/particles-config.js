// particles-config.js
document.addEventListener("DOMContentLoaded", () => {
  particlesJS("particles-js", {
    particles: {
      number: {
        value: 80,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: { value: "#ffffff" },
      shape: {
        type: "circle",
        stroke: { width: 0, color: "#000000" },
        polygon: { nb_sides: 5 },
      },
      opacity: {
        value: 0.5,
        anim: { enable: false, speed: 1, opacity_min: 0.1, sync: false },
      },
      size: {
        value: 3,
        random: true,
        anim: { enable: false, speed: 40, size_min: 0.1, sync: false },
      },
      line_linked: {
        enable: true,
        distance: 200,
        color: "#ffffff",
        opacity: 0.4,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1,
        direction: "none",
        out_mode: "out",
      },
    },
    interactivity: {
      detect_on: "window",
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" },
        resize: true,
      },
      modes: {
        grab: {
          distance: 400,
          line_linked: { opacity: 1 },
        },
        bubble: {
          distance: 400,
          size: 40,
          duration: 2,
          opacity: 8,
          speed: 3,
        },
        repulse: {
          distance: 75,
          duration: 0.4,
        },
        push: { particles_nb: 8 },
        remove: { particles_nb: 2 },
      },
    },
    retina_detect: true,
  });

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
