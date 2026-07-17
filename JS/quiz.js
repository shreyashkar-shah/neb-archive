/* ====================================================
   NEB Archive — Quiz Page Logic
   Vanilla JS, no dependencies
   ==================================================== */

// Mock Data Array
const quizData = [
    {
        question: "What is the SI unit of electric current?",
        options: ["Volt", "Ampere", "Ohm", "Watt"],
        correctAnswer: "Ampere"
    },
    {
        question: "Which of the following is a vector quantity?",
        options: ["Speed", "Mass", "Velocity", "Temperature"],
        correctAnswer: "Velocity"
    },
    {
        question: "What is the acceleration due to gravity on the surface of the Earth (approx)?",
        options: ["8.9 m/s²", "9.8 m/s²", "10.8 m/s²", "11.2 m/s²"],
        correctAnswer: "9.8 m/s²"
    },
    {
        question: "Who is known as the father of modern physics?",
        options: ["Isaac Newton", "Galileo Galilei", "Albert Einstein", "Nikola Tesla"],
        correctAnswer: "Albert Einstein"
    },
    {
        question: "What does DNA stand for?",
        options: ["Deoxyribonucleic Acid", "Dioxyribonucleic Acid", "Deoxyribonitric Acid", "Deoxyribonuclear Acid"],
        correctAnswer: "Deoxyribonucleic Acid"
    }
];

document.addEventListener('DOMContentLoaded', () => {

    /* ------------------------------------------------
       1. MOBILE MENU TOGGLE (Shared Logic)
       ------------------------------------------------ */
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            hamburger.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen);
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                if (navLinks.classList.contains('open')) {
                    navLinks.classList.remove('open');
                    hamburger.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }

    /* ------------------------------------------------
       2. QUIZ LOGIC & STATE MANAGEMENT
       ------------------------------------------------ */
    const quizBox = document.getElementById('quiz-box');
    let currentQuestionIndex = 0;
    let score = 0;
    let isAnswered = false;

    // Function to render the current question
    function renderQuiz() {
        isAnswered = false;
        const currentQuestion = quizData[currentQuestionIndex];
        const progress = ((currentQuestionIndex) / quizData.length) * 100;

        // Generate HTML for the quiz box
        quizBox.innerHTML = `
            <div class="quiz-progress-container">
                <div class="quiz-progress-bar" style="width: ${progress}%"></div>
            </div>
            <div class="quiz-info">
                <span class="quiz-question-num">Question ${currentQuestionIndex + 1} of ${quizData.length}</span>
                <span class="quiz-score">Score: <span>${score}</span></span>
            </div>
            <h3 class="quiz-question">${currentQuestion.question}</h3>
            <div class="quiz-options" id="quizOptions">
                ${currentQuestion.options.map(option => `
                    <button class="quiz-option" data-value="${option}">${option}</button>
                `).join('')}
            </div>
            <div class="quiz-actions" id="quizActions">
                ${currentQuestionIndex === quizData.length - 1 
                    ? '<button class="btn btn-primary" id="nextBtn">See Results →</button>' 
                    : '<button class="btn btn-primary" id="nextBtn">Next Question →</button>'}
            </div>
        `;

        // Attach event listeners to the new option buttons
        const optionButtons = document.querySelectorAll('.quiz-option');
        optionButtons.forEach(btn => {
            btn.addEventListener('click', selectAnswer);
        });

        // Attach event listener to the Next button
        document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    }

    // Function to handle answer selection
    function selectAnswer(e) {
        if (isAnswered) return; // Prevent multiple clicks
        isAnswered = true;

        const selectedOption = e.target;
        const selectedValue = selectedOption.dataset.value;
        const correctAnswer = quizData[currentQuestionIndex].correctAnswer;
        const optionsContainer = document.getElementById('quizOptions');

        // Disable hover effects and pointer events
        optionsContainer.classList.add('answered');

        // Check if correct
        if (selectedValue === correctAnswer) {
            selectedOption.classList.add('correct');
            score++;
            // Update score display live
            document.querySelector('.quiz-score span').textContent = score;
        } else {
            selectedOption.classList.add('incorrect');
            // Highlight the correct answer
            optionsContainer.querySelectorAll('.quiz-option').forEach(btn => {
                if (btn.dataset.value === correctAnswer) {
                    btn.classList.add('correct');
                }
            });
        }

        // Show the Next/Results button
        document.getElementById('quizActions').classList.add('show');
    }

    // Function to handle "Next Question" click
    function nextQuestion() {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            renderQuiz();
        } else {
            showResults();
        }
    }

    // Function to show final results
    function showResults() {
        let message = "";
        let icon = "";
        const percentage = (score / quizData.length) * 100;

        if (percentage === 100) {
            icon = "🏆";
            message = "Perfect score! You're a genius.";
        } else if (percentage >= 60) {
            icon = "🎉";
            message = "Great job! You're well prepared.";
        } else {
            icon = "📚";
            message = "Good effort. Keep practicing!";
        }

        // Set progress bar to 100%
        quizBox.innerHTML = `
            <div class="quiz-progress-container">
                <div class="quiz-progress-bar" style="width: 100%"></div>
            </div>
            <div class="quiz-result">
                <div class="result-icon">${icon}</div>
                <h3>Quiz Completed!</h3>
                <p class="score-text">You scored ${score} out of ${quizData.length}</p>
                <p>${message}</p>
                <button class="btn btn-primary" id="retryBtn">↻ Retry Quiz</button>
            </div>
        `;

        // Attach event listener to Retry button
        document.getElementById('retryBtn').addEventListener('click', retryQuiz);
    }

    // Function to reset and restart the quiz
    function retryQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        renderQuiz();
    }

    // Initialize the quiz on page load
    renderQuiz();

    /* ------------------------------------------------
       3. AUTO-UPDATE FOOTER YEAR
       ------------------------------------------------ */
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

        /* ------------------------------------------------
       DARK MODE TOGGLE LOGIC
       ------------------------------------------------ */
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            // Get current theme from <html> attribute
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            // Switch theme
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Apply new theme to <html>
            document.documentElement.setAttribute('data-theme', newTheme);
            
            // Save preference to localStorage
            localStorage.setItem('theme', newTheme);
        });
    }

});