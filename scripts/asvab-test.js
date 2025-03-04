/* scripts/asvab-test.js */

document.addEventListener("DOMContentLoaded", function() {
    // Parse query parameters to get the subject name.
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject') || "Unknown Subject";

    // Set the test title.
    document.getElementById("subject-title").textContent = subject + " Test";

    // Global variables for test state.
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let attemptedQuestions = [];
    let timerInterval;
    let startTime;

    // DOM elements.
    const startBtn = document.getElementById("start-btn");
    const nextBtn = document.getElementById("next-btn");
    const endBtn = document.getElementById("end-btn");
    const reviewBtn = document.getElementById("review-btn");
    const mainMenuBtn = document.getElementById("main-menu-btn");
    const submitBtn = document.getElementById("submit-btn");
    const answerInput = document.getElementById("answer-input");
    const questionText = document.getElementById("question-text");
    const feedbackDiv = document.getElementById("feedback");
    const timerSpan = document.getElementById("timer");
    const scoreSpan = document.getElementById("score");
    const progressBar = document.getElementById("progress-bar");
    const answerContainer = document.getElementById("answer-container");
    const reviewSection = document.getElementById("review-section");
    const reviewContent = document.getElementById("review-content");
    const closeReviewBtn = document.getElementById("close-review-btn");

    // Helper: Convert subject name into JSON file name.
    // For Mathematics Knowledge, we use "math_questions.json".
    function getFileNameForSubject(subject) {
        if (subject.toLowerCase() === "mathematics knowledge") {
            return "math_questions.json";
        }
        return subject.toLowerCase().replace(/[^a-z0-9]+/g, "_") + ".json";
    }

    // Shuffle an array (Fisher–Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async function loadQuestionsForSingleSubject(subject) {
        const fileName = "test_questions/" + getFileNameForSubject(subject);
        try {
            const response = await fetch(fileName);
            if (!response.ok) throw new Error("File not found");
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error("Invalid JSON format");
            return data;
        } catch (e) {
            console.error("Error loading JSON file:", e);
            feedbackDiv.innerHTML = "Error: Unable to load questions file (" + fileName + "). Please ensure the file exists.";
            startBtn.disabled = true;
            answerContainer.classList.add("hidden");
            throw e;
        }
    }

    async function loadMixedQuestions() {
        const files = [
            "math_questions.json",
            "arithmetic_reasoning.json",
            "general_science.json",
            "word_knowledge.json",
            "paragraph_comprehension.json",
            "electronics_information.json",
            "auto_shop_information.json",
            "mechanical_comprehension.json",
            "assembling_objects.json",
            "practice_main_test.json"
        ];
        let allQuestions = [];
        for (let file of files) {
            try {
                const response = await fetch("test_questions/" + file);
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        allQuestions = allQuestions.concat(data);
                    }
                }
            } catch (e) {
                console.error("Error loading file: " + file, e);
            }
        }
        if (allQuestions.length === 0) {
            feedbackDiv.innerHTML = "Error: Unable to load any questions for the Mixed Test. Please ensure the JSON files exist.";
            startBtn.disabled = true;
            answerContainer.classList.add("hidden");
            throw new Error("No questions loaded for mixed test");
        }
        return allQuestions;
    }

    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            timerSpan.textContent = "Time: " + elapsed + " seconds";
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function displayQuestion() {
        if (currentQuestionIndex < questions.length) {
            const q = questions[currentQuestionIndex];
            questionText.textContent = q.question;
            feedbackDiv.textContent = "";
            // If the question has a multiple choice array, create radio buttons.
            if (q.choices && Array.isArray(q.choices) && q.choices.length === 4) {
                // Clear previous answer container content.
                answerContainer.innerHTML = "";
                for (let i = 0; i < q.choices.length; i++) {
                    const choice = q.choices[i];
                    const radio = document.createElement("input");
                    radio.type = "radio";
                    radio.name = "choice";
                    radio.value = choice;
                    radio.id = "choice_" + i;
                    const label = document.createElement("label");
                    label.htmlFor = "choice_" + i;
                    label.textContent = choice;
                    label.style.marginRight = "10px";
                    const div = document.createElement("div");
                    div.style.marginBottom = "5px";
                    div.appendChild(radio);
                    div.appendChild(label);
                    answerContainer.appendChild(div);
                }
                // Create or re-enable the submit button if not present.
                let existingSubmit = document.getElementById("submit-btn");
                if (!existingSubmit) {
                    const submitButton = document.createElement("button");
                    submitButton.id = "submit-btn";
                    submitButton.textContent = "Submit Answer";
                    submitButton.addEventListener("click", submitAnswer);
                    answerContainer.appendChild(submitButton);
                } else {
                    existingSubmit.disabled = false;
                }
                answerContainer.classList.remove("hidden");
            } else {
                // Otherwise, use a text input.
                answerContainer.innerHTML = `
                    <input type="text" id="answer-input" placeholder="Enter your answer">
                    <button id="submit-btn">Submit Answer</button>
                `;
                answerContainer.classList.remove("hidden");
            }
            const progress = (currentQuestionIndex / questions.length) * 100;
            progressBar.style.width = progress + "%";
            scoreSpan.textContent = "Score: " + score + " / " + questions.length;
        } else {
            finishTest();
        }
    }

    function submitAnswer() {
        let userAnswer;
        const q = questions[currentQuestionIndex];
        if (q.choices && Array.isArray(q.choices) && q.choices.length === 4) {
            // Get selected radio button value.
            const radios = document.getElementsByName("choice");
            for (let radio of radios) {
                if (radio.checked) {
                    userAnswer = radio.value;
                    break;
                }
            }
            if (!userAnswer) {
                feedbackDiv.textContent = "Please select an answer.";
                return;
            }
        } else {
            // Get value from text input.
            userAnswer = document.getElementById("answer-input").value.trim();
            if (!userAnswer) {
                feedbackDiv.textContent = "Please enter an answer.";
                return;
            }
        }
        const correct = (userAnswer.toLowerCase() === q.answer.toLowerCase());
        if (correct) {
            feedbackDiv.innerHTML = "Correct!<br>Explanation: " + q.explanation;
            score++;
        } else {
            feedbackDiv.innerHTML = "Wrong! The correct answer was: " + q.answer +
                "<br>Explanation: " + q.explanation;
        }
        attemptedQuestions.push({
            question: q.question,
            userAnswer: userAnswer,
            correctAnswer: q.answer,
            explanation: q.explanation,
            correct: correct
        });
        // Disable the submit button.
        const currentSubmit = document.getElementById("submit-btn");
        if (currentSubmit) {
            currentSubmit.disabled = true;
        }
        nextBtn.classList.remove("hidden");
    }

    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestion();
            // Re-enable the submit button if necessary.
            const currentSubmit = document.getElementById("submit-btn");
            if (currentSubmit) {
                currentSubmit.disabled = false;
            }
            nextBtn.classList.add("hidden");
        } else {
            finishTest();
        }
    }

    function finishTest() {
        stopTimer();
        questionText.textContent = "Test Complete!";
        answerContainer.classList.add("hidden");
        const currentSubmit = document.getElementById("submit-btn");
        if (currentSubmit) {
            currentSubmit.disabled = true;
        }
        nextBtn.classList.add("hidden");
        endBtn.classList.add("hidden");
        reviewBtn.classList.remove("hidden");
        mainMenuBtn.classList.remove("hidden");
        feedbackDiv.innerHTML = "Final Score: " + score + " / " + questions.length;
        progressBar.style.width = "100%";
        scoreSpan.textContent = "Score: " + score + " / " + questions.length;
    }

    function reviewAnswers() {
        let reviewHTML = "";
        attemptedQuestions.forEach((attempt, index) => {
            reviewHTML += "<div class='mb-3'><h5>Question " + (index + 1) + ": " + attempt.question + "</h5>";
            reviewHTML += "<p>Your Answer: " + attempt.userAnswer + " (" + (attempt.correct ? "Correct" : "Wrong") + ")</p>";
            reviewHTML += "<p>Correct Answer: " + attempt.correctAnswer + "</p>";
            reviewHTML += "<p>Explanation: " + attempt.explanation + "</p></div><hr>";
        });
        reviewContent.innerHTML = reviewHTML;
        reviewSection.classList.remove("hidden");
    }

    // Close review button.
    closeReviewBtn.addEventListener("click", function() {
        reviewSection.classList.add("hidden");
    });

    startBtn.addEventListener("click", async function() {
        try {
            if (subject.toLowerCase() === "mixed test") {
                const mixed = await loadMixedQuestions();
                questions = shuffleArray(mixed).slice(0, 135);
            } else {
                const single = await loadQuestionsForSingleSubject(subject);
                questions = shuffleArray(single).slice(0, 35);
            }
        } catch (e) {
            return;
        }
        currentQuestionIndex = 0;
        score = 0;
        attemptedQuestions = [];
        startTimer();
        displayQuestion();
        answerContainer.classList.remove("hidden");
        startBtn.classList.add("hidden");
        endBtn.classList.remove("hidden");
    });

    submitBtn.addEventListener("click", submitAnswer);
    nextBtn.addEventListener("click", nextQuestion);
    endBtn.addEventListener("click", finishTest);
    reviewBtn.addEventListener("click", reviewAnswers);
    mainMenuBtn.addEventListener("click", function() {
        window.location.href = "misc-asvab-menu.html";
    });
});
