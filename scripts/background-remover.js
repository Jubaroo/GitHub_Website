// background-remover.js

// List of remove.bg API keys
const apiKeys = [
    'VLiX2psPycMn2dVRfTbUZoip',
    'bWFnyvvguRTCyQ4RDu8kAamd',
    'B7C9AaygMJpwrMskPHucAZra'
];

document.getElementById("source").addEventListener("change", function () {
    const selectedSource = this.value;
    document.getElementById("image-upload").style.display =
        selectedSource === "image_file" ? "block" : "none";
    document.getElementById("url-group").style.display =
        selectedSource === "image_url" ? "block" : "none";
    document.getElementById("b64-group").style.display =
        selectedSource === "image_file_b64" ? "block" : "none";
});

document.getElementById("crop").addEventListener("change", function () {
    document.getElementById("crop-margin-group").style.display = this
        .checked
        ? "block"
        : "none";
});

document.addEventListener("DOMContentLoaded", () => {
    const sidebar = document.querySelector(".sidebar");
    const toggleButton = document.getElementById("toggle-sidebar");
    const tooltipDiv = toggleButton.querySelector(".tooltip");
    const tooltipText = toggleButton.querySelector(".tooltiptext");
    const sidebarContents = sidebar.querySelectorAll(
        ".form-group, .remove-bg-btn, #image-upload"
    );
    const imageSource = document.getElementById("source");
    const urlGroup = document.getElementById("url-group");
    const b64Group = document.getElementById("b64-group");
    const fileInput = document.getElementById("image-upload");
    const cropCheckbox = document.getElementById("crop");
    const cropMarginGroup = document.getElementById("crop-margin-group");

    let selectedSource = imageSource.value; // Track selected input type
    let isCropChecked = cropCheckbox.checked; // Track crop checkbox state

    // Function to center the button vertically
    function centerToggleButton() {
        const windowHeight = window.innerHeight;
        const buttonHeight = toggleButton.offsetHeight;
        toggleButton.style.top = `${(windowHeight - buttonHeight) / 2 - 83}px`;
    }

    // Function to hide sidebar contents immediately
    function hideSidebarContents() {
        sidebarContents.forEach((el) => {
            el.classList.remove("visible"); // Remove visibility for fade-in
            el.classList.remove("fade-in"); // Remove fade-in class
            el.style.display = "none"; // Hide immediately
        });
    }

    // Function to show sidebar contents with fade-in effect
    function showSidebarContents() {
        sidebarContents.forEach((el) => {
            if (
                (el === urlGroup && selectedSource === "image_url") ||
                (el === b64Group && selectedSource === "image_file_b64") ||
                (el !== urlGroup && el !== b64Group)
            ) {
                el.style.display = "block"; // Make visible relevant elements
                el.classList.add("fade-in");
                setTimeout(() => el.classList.add("visible"), 10); // Apply fade-in after setting display
            }
        });
        cropMarginGroup.style.display = isCropChecked ? "block" : "none"; // Show or hide crop margin
    }

    // Center the button on load and when resized
    centerToggleButton();
    window.addEventListener("resize", centerToggleButton);

    toggleButton.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");

        if (sidebar.classList.contains("collapsed")) {
            toggleButton.style.left = "0px"; // Position when collapsed
            tooltipText.textContent = "Click to expand the sidebar";
            tooltipDiv.classList.add("right"); // Add class to move tooltip to the right
            selectedSource = imageSource.value; // Save the current selected source
            isCropChecked = cropCheckbox.checked; // Save the crop checkbox state
            hideSidebarContents(); // Hide sidebar contents
        } else {
            toggleButton.style.left = "291px"; // Position when expanded
            tooltipText.textContent = "Click to collapse the sidebar";
            tooltipDiv.classList.remove("right"); // Remove class to reset tooltip position
            setTimeout(showSidebarContents, 300); // Show contents after sidebar transition
        }

        // Center the button after toggling
        centerToggleButton();
    });

    // Handle changes in the source select element
    imageSource.addEventListener("change", () => {
        selectedSource = imageSource.value; // Update the selected source
        fileInput.style.display =
            selectedSource === "image_file" ? "block" : "none";
        urlGroup.style.display =
            selectedSource === "image_url" ? "block" : "none";
        b64Group.style.display =
            selectedSource === "image_file_b64" ? "block" : "none";
    });

    // Handle changes in the crop checkbox
    cropCheckbox.addEventListener("change", () => {
        isCropChecked = cropCheckbox.checked; // Update the crop checkbox state
        cropMarginGroup.style.display = isCropChecked ? "block" : "none"; // Show or hide crop margin
    });
});

document
    .getElementById("bg-color")
    .addEventListener("input", function () {
        const colorValue = this.value;
        document.getElementById("color-preview").style.backgroundColor =
            colorValue;
        document.getElementById("bg-color-hex").value = colorValue; // Update hex value
    });

let downloadUrl = '';

async function removeBackground() {
    const fileInput = document.getElementById("image-upload");
    const imageUrlInput = document.getElementById("image-url");
    const imageB64Input = document.getElementById("image-b64");
    const comparisonContainer = document.getElementById("comparison-container");
    const originalImage = document.getElementById("original-image");
    const convertedImage = document.getElementById("converted-image");
    const downloadButton = document.getElementById("download-button");
    const message = document.getElementById("message");
    const source = document.getElementById("source").value;
    const size = document.getElementById("size").value;
    const type = document.getElementById("type").value;
    const typeLevel = document.getElementById("type-level").value;
    const format = document.getElementById("format").value;
    const roi = document.getElementById("roi").value;
    const crop = document.getElementById("crop").checked;
    const cropMargin = document.getElementById("crop-margin").value;
    const scale = document.getElementById("scale").value;
    const position = document.getElementById("position").value;
    const channels = document.getElementById("channels").value;
    const shadowType = document.getElementById("shadow-type").value;
    const shadowOpacity = document.getElementById("shadow-opacity").value;
    const semitransparency = document.getElementById("semitransparency").checked;
    const bgColor = document.getElementById("bg-color").value;
    const bgImageUrl = document.getElementById("bg-image-url").value;

    message.textContent = "";
    downloadButton.style.display = "none";
    comparisonContainer.style.display = "none";

    // Prepare the form data
    let formData = new FormData();

    if (source === "image_file" && fileInput.files.length > 0) {
        formData.append("image_file", fileInput.files[0]);
    } else if (source === "image_url") {
        formData.append("image_url", imageUrlInput.value);
    } else if (source === "image_file_b64") {
        formData.append("image_file_b64", imageB64Input.value);
    } else {
        message.textContent = "Please provide a valid image source.";
        message.style.color = "yellow";
        message.style.fontWeight = "bold";
        return;
    }

    // Append additional options
    formData.append("size", size);
    formData.append("type", type);
    formData.append("type_level", typeLevel);
    formData.append("format", format);
    if (roi) formData.append("roi", roi);
    formData.append("crop", crop);
    if (cropMargin) formData.append("crop_margin", cropMargin);
    formData.append("scale", scale);
    if (position) formData.append("position", position);
    formData.append("channels", channels);
    formData.append("shadow_type", shadowType);
    formData.append("shadow_opacity", shadowOpacity);
    formData.append("semitransparency", semitransparency);
    if (bgColor) formData.append("bg_color", bgColor);
    if (bgImageUrl) formData.append("bg_image_url", bgImageUrl);

    message.textContent = "Removing background...";

    // Iterate through API keys
    for (let i = 0; i < apiKeys.length; i++) {
        const apiKey = apiKeys[i];
        console.log(`Trying API Key: ${apiKey}`);
        try {
            const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: {
                    'X-Api-Key': apiKey
                    // Note: Do NOT set 'Content-Type' when sending FormData
                },
                body: formData
            });

            if (response.status === 200) {
                console.log("Background removal successful.");
                // Successful response
                const blob = await response.blob();
                const objectURL = URL.createObjectURL(blob);
                convertedImage.src = objectURL;

                // Determine original image source
                let originalImageSrc;
                if (source === "image_file") {
                    originalImageSrc = URL.createObjectURL(fileInput.files[0]);
                } else if (source === "image_url") {
                    originalImageSrc = imageUrlInput.value;
                } else if (source === "image_file_b64") {
                    originalImageSrc = 'data:image/png;base64,' + imageB64Input.value;
                }

                // Set both images and wait for them to load
                await Promise.all([
                    new Promise((resolve, reject) => {
                        originalImage.src = originalImageSrc;
                        originalImage.onload = resolve;
                        originalImage.onerror = () => {
                            console.error("Original image failed to load.");
                            reject();
                        };
                    }),
                    new Promise((resolve, reject) => {
                        convertedImage.src = objectURL;
                        convertedImage.onload = resolve;
                        convertedImage.onerror = () => {
                            console.error("Converted image failed to load.");
                            reject();
                        };
                    })
                ]);

                // Display the comparison slider and download button
                comparisonContainer.style.display = "block";
                downloadButton.style.display = "block";
                message.textContent = "Background removed successfully!";
                downloadUrl = objectURL;
                initComparisons();
                return; // Exit after successful processing
            } else if (response.status === 402) {
                // API key exhausted or payment required
                const errorData = await response.json();
                console.warn(`API Key ${apiKey} exhausted: ${errorData.errors[0].title}`);
                // Continue to the next API key
            } else {
                // Other errors
                const errorData = await response.json();
                message.textContent = `Error (${response.status}): ${errorData.errors[0].title}`;
                message.style.color = "yellow";
                console.error(`Error with API Key ${apiKey}:`, errorData.errors[0].title);
                return; // Exit on other errors
            }
        } catch (error) {
            console.error(`Error with API Key ${apiKey}:`, error);
            // Continue to the next API key
        }
    }

    // If all API keys are exhausted or failed
    message.textContent = "Error: All API keys have been exhausted or invalid.";
    message.style.color = "yellow";
}

function downloadImage() {
    if (!downloadUrl) {
        alert("No image available to download.");
        return;
    }
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "background-removed.png";
    document.body.appendChild(link); // Append to the DOM to make it clickable
    link.click();
    document.body.removeChild(link); // Remove after clicking
}

function initComparisons() {
    const slider = document.getElementById("slider");
    const comparisonContainer = document.getElementById("comparison-container");
    const convertedWrapper = document.querySelector(".converted-wrapper");
    const imageWrapper = document.querySelector(".image-wrapper");
    let clicked = false;

    // Reset slider position to 50%
    slider.style.left = "50%";
    convertedWrapper.style.clipPath = `inset(0 50% 0 0)`;
    imageWrapper.style.clipPath = `inset(0 0 0 50%)`;

    // Event listeners for mouse interaction
    slider.addEventListener("mousedown", () => {
        clicked = true;
        window.addEventListener("mousemove", slideMove);
        window.addEventListener("mouseup", slideStop);
    });

    // Event listeners for touch interaction
    slider.addEventListener("touchstart", () => {
        clicked = true;
        window.addEventListener("touchmove", slideMove);
        window.addEventListener("touchend", slideStop);
    });

    function slideMove(event) {
        if (!clicked) return;
        let x;
        if (event.type.startsWith('mouse')) {
            x = event.clientX;
        } else if (event.type.startsWith('touch')) {
            x = event.touches[0].clientX;
        }
        slide(getCursorPos(x));
        window.getSelection().removeAllRanges(); // Prevent text selection during slide
    }

    function slideStop() {
        clicked = false;
        window.removeEventListener("mousemove", slideMove);
        window.removeEventListener("mouseup", slideStop);
        window.removeEventListener("touchmove", slideMove);
        window.removeEventListener("touchend", slideStop);
    }

    function getCursorPos(clientX) {
        const rect = comparisonContainer.getBoundingClientRect();
        return clientX - rect.left;
    }

    function slide(x) {
        const containerWidth = comparisonContainer.offsetWidth;
        x = Math.max(0, Math.min(x, containerWidth));

        const percentage = (x / containerWidth) * 100;
        slider.style.left = `${percentage}%`;
        convertedWrapper.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
        imageWrapper.style.clipPath = `inset(0 0 0 ${percentage}%)`;
    }
}
