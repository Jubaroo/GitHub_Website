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
    const toggleDarkModeBtn = document.getElementById("toggle-dark-mode");

    // Helper: Convert subject name into JSON file name.
    // For Mathematics Knowledge, we use "math_questions.json".
    function getFileNameForSubject(subject) {
        if(subject.toLowerCase() === "mathematics knowledge") {
            return "math_questions.json";
        }
        return subject.toLowerCase().replace(/[^a-z0-9]+/g, "_") + ".json";
    }

    // Shuffle an array using Fisher–Yates shuffle.
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Function to load questions for a single subject.
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

    // Function to load mixed questions (all subjects).
    async function loadMixedQuestions() {
        // List all subject files. Note: for Mathematics Knowledge, the file is "math_questions.json".
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

    // Start the timer.
    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(function() {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            timerSpan.textContent = "Time: " + elapsed + " seconds";
        }, 1000);
    }

    // Stop the timer.
    function stopTimer() {
        clearInterval(timerInterval);
    }

    // Display the current question.
    function displayQuestion() {
        if (currentQuestionIndex < questions.length) {
            const q = questions[currentQuestionIndex];
            questionText.textContent = q.question;
            feedbackDiv.textContent = "";
            answerInput.value = "";
            const progress = (currentQuestionIndex / questions.length) * 100;
            progressBar.style.width = progress + "%";
            scoreSpan.textContent = "Score: " + score + " / " + questions.length;
        } else {
            finishTest();
        }
    }

    // Handle answer submission.
    function submitAnswer() {
        const userAnswer = answerInput.value.trim();
        if (!userAnswer) {
            feedbackDiv.textContent = "Please enter an answer.";
            return;
        }
        const currentQ = questions[currentQuestionIndex];
        const correct = (userAnswer.toLowerCase() === currentQ.answer.toLowerCase());
        if (correct) {
            feedbackDiv.innerHTML = "Correct!<br>Explanation: " + currentQ.explanation;
            score++;
        } else {
            feedbackDiv.innerHTML = "Wrong! The correct answer was: " + currentQ.answer +
                "<br>Explanation: " + currentQ.explanation;
        }
        attemptedQuestions.push({
            question: currentQ.question,
            userAnswer: userAnswer,
            correctAnswer: currentQ.answer,
            explanation: currentQ.explanation,
            correct: correct
        });
        submitBtn.disabled = true;
        nextBtn.classList.remove("hidden");
    }

    // Move to the next question.
    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestion();
            submitBtn.disabled = false;
            nextBtn.classList.add("hidden");
        } else {
            finishTest();
        }
    }

    // Finish the test.
    function finishTest() {
        stopTimer();
        questionText.textContent = "Test Complete!";
        answerContainer.classList.add("hidden");
        submitBtn.disabled = true;
        nextBtn.classList.add("hidden");
        endBtn.classList.add("hidden");
        reviewBtn.classList.remove("hidden");
        mainMenuBtn.classList.remove("hidden");
        feedbackDiv.innerHTML = "Final Score: " + score + " / " + questions.length;
        progressBar.style.width = "100%";
        scoreSpan.textContent = "Score: " + score + " / " + questions.length;
    }

    // Review answers.
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

    // Event listeners.
    startBtn.addEventListener("click", async function() {
        try {
            if (subject.toLowerCase() === "mixed test") {
                // Load questions from all subject files and select 135 random questions.
                const mixedQuestions = await loadMixedQuestions();
                questions = shuffleArray(mixedQuestions).slice(0, 135);
            } else {
                // Load questions for a single subject and select 35 random questions.
                const singleQuestions = await loadQuestionsForSingleSubject(subject);
                questions = shuffleArray(singleQuestions).slice(0, 35);
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
    closeReviewBtn.addEventListener("click", function() {
        reviewSection.classList.add("hidden");
    });
});
