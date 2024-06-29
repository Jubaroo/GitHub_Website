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
    const crop = document.getElementById("crop").checked ? "true" : "false";
    const cropMargin = document.getElementById("crop-margin").value;
    const scale = document.getElementById("scale").value;
    const position = document.getElementById("position").value;
    const channels = document.getElementById("channels").value;
    const shadowType = document.getElementById("shadow-type").value;
    const shadowOpacity = document.getElementById("shadow-opacity").value;
    const semitransparency = document.getElementById("semitransparency").checked ? "true" : "false";
    const bgColor = document.getElementById("bg-color").value;
    const bgImageUrl = document.getElementById("bg-image-url").value;

    message.textContent = "";
    downloadButton.style.display = "none";
    comparisonContainer.style.display = "none";

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

    formData.append("size", size);
    formData.append("type", type);
    formData.append("type_level", typeLevel);
    formData.append("format", format);
    formData.append("roi", roi);
    formData.append("crop", crop);
    formData.append("crop_margin", cropMargin);
    formData.append("scale", scale);
    formData.append("position", position);
    formData.append("channels", channels);
    formData.append("shadow_type", shadowType);
    formData.append("shadow_opacity", shadowOpacity);
    formData.append("semitransparency", semitransparency);
    formData.append("bg_color", bgColor);
    formData.append("bg_image_url", bgImageUrl);

    console.log(...formData.entries());

    message.textContent = "Removing background...";

    try {
        const response = await fetch('https://your-app-name.herokuapp.com/remove-background', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageUrl: source === "image_url" ? imageUrlInput.value : null,
                options: Object.fromEntries(formData)
            })
        });

        if (response.ok) {
            const result = await response.json();
            // Handle the result and display images
            originalImage.onload = () => {
                comparisonContainer.style.width = originalImage.width + "px";
                comparisonContainer.style.height = originalImage.height + "px";
                convertedImage.style.width = originalImage.width + "px";
                convertedImage.style.height = originalImage.height + "px";

                comparisonContainer.style.display = "block";
                downloadButton.style.display = "block";
                message.textContent = "Background removed successfully!";
                initComparisons();
            };

            originalImage.src = URL.createObjectURL(fileInput.files[0]);
            convertedImage.src = result.data; // Adjust according to the actual response structure
            downloadUrl = result.data;
        } else {
            message.textContent = `Error: ${response.statusText}`;
        }
    } catch (error) {
        console.error("Error removing background:", error);
        message.textContent = `Error: ${error.message}`;
    }
}

function downloadImage() {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "background-removed.png";
    link.click();
}

function initComparisons() {
    const slider = document.getElementById("slider");
    const comparisonContainer = document.getElementById("comparison-container");
    const convertedWrapper = document.querySelector(".converted-wrapper");
    const imageWrapper = document.querySelector(".image-wrapper");
    let clicked = false;

    slider.style.left = comparisonContainer.offsetWidth / 2 + "px";
    convertedWrapper.style.clipPath = `rect(0, ${comparisonContainer.offsetWidth / 2}px, ${comparisonContainer.offsetHeight}px, 0)`;
    imageWrapper.style.clipPath = `rect(0, ${comparisonContainer.offsetWidth}px, ${comparisonContainer.offsetHeight}px, ${comparisonContainer.offsetWidth / 2}px)`;

    slider.addEventListener("mousedown", () => {
        clicked = true;
        window.addEventListener("mousemove", slideMove);
        window.addEventListener("mouseup", slideStop);
    });

    function slideMove(event) {
        if (!clicked) return;
        slide(getCursorPos(event));
        window.getSelection().removeAllRanges();
    }

    function slideStop() {
        clicked = false;
        window.removeEventListener("mousemove", slideMove);
        window.removeEventListener("mouseup", slideStop);
    }

    function getCursorPos(event) {
        const rect = comparisonContainer.getBoundingClientRect();
        return event.clientX - rect.left;
    }

    function slide(x) {
        const containerWidth = comparisonContainer.offsetWidth;
        x = Math.max(0, Math.min(x, containerWidth));

        slider.style.left = x + "px";
        convertedWrapper.style.clipPath = `rect(0, ${x}px, ${comparisonContainer.offsetHeight}px, 0)`;
        imageWrapper.style.clipPath = `rect(0, ${containerWidth}px, ${comparisonContainer.offsetHeight}px, ${x}px)`;
    }
}
