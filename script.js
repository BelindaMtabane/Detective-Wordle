
/* =========================================
   TINY DETECTIVE
   MAIN GAME ENGINE
========================================= */

// =========================================
// 1. CASE DATA
// =========================================

const caseData = {
    title: "The Missing Necklace",

    culprit: "maya",

    suspects: [
        {
            id: "maya",
            name: "Maya Rose",
            role: "The Birthday Host",
            description: "She organized the party and knew exactly where the necklace was kept."
        },
        {
            id: "oliver",
            name: "Oliver James",
            role: "The Family Friend",
            description: "He was seen walking near the bedroom during the party."
        },
        {
            id: "sophie",
            name: "Sophie Lane",
            role: "The Cousin",
            description: "She was one of the last guests to leave the house."
        }
    ],

    questions: [
        {
            title: "The Disappearance",
            description: "Start by establishing when the necklace disappeared.",
            sentence: "The necklace disappeared during the birthday party.",
            words: ["The", "necklace", "disappeared", "during", "the", "birthday", "party."],
            evidence: "The necklace disappeared during the birthday party.",
            hint: "Start with the word 'The'."
        },
        {
            title: "The Bedroom",
            description: "A witness remembers where the necklace was kept.",
            sentence: "The necklace was kept inside a bedroom drawer.",
            words: ["The", "necklace", "was", "kept", "inside", "a", "bedroom", "drawer."],
            evidence: "The necklace was kept inside a bedroom drawer.",
            hint: "The sentence begins with 'The necklace'."
        },
        {
            title: "The Suspicious Guest",
            description: "Someone was seen entering the bedroom.",
            sentence: "Maya entered the bedroom before the guests arrived.",
            words: ["Maya", "entered", "the", "bedroom", "before", "the", "guests", "arrived."],
            evidence: "Maya entered the bedroom before the guests arrived.",
            hint: "The person in this sentence is Maya."
        },
        {
            title: "The Missing Key",
            description: "A spare bedroom key was discovered near the kitchen.",
            sentence: "Maya carried the spare bedroom key.",
            words: ["Maya", "carried", "the", "spare", "bedroom", "key."],
            evidence: "Maya carried the spare bedroom key.",
            hint: "Start with Maya."
        },
        {
            title: "The Final Clue",
            description: "The final witness reveals something important.",
            sentence: "Maya hid the necklace inside her handbag.",
            words: ["Maya", "hid", "the", "necklace", "inside", "her", "handbag."],
            evidence: "Maya hid the necklace inside her handbag.",
            hint: "The sentence starts with Maya and ends with handbag."
        }
    ]
};


// =========================================
// 2. GAME STATE
// =========================================

let currentQuestion = 0;
let selectedWords = [];
let shuffledWords = [];
let attemptsLeft = 3;

let score = 0;
let correctAnswers = 0;
let totalAttempts = 0;
let evidenceCollected = [];

let selectedSuspect = null;
let hintUsed = false;
let caseFinished = false;


// =========================================
// 3. SCREEN NAVIGATION
// =========================================

function showScreen(screenId) {

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const target = document.getElementById(screenId);

    if (target) {
        target.classList.add("active");
        window.scrollTo(0, 0);
    }
}


// =========================================
// 4. STARTING A CASE
// =========================================

function startCase() {
    showScreen("case-briefing");
}


function beginInvestigation() {

    currentQuestion = 0;
    score = 0;
    correctAnswers = 0;
    totalAttempts = 0;

    attemptsLeft = 3;

    evidenceCollected = [];
    selectedWords = [];
    selectedSuspect = null;

    hintUsed = false;
    caseFinished = false;

    showScreen("gameplay");

    loadQuestion();
}


// =========================================
// 5. SHUFFLE WORDS
// =========================================

function shuffleArray(array) {

    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}


// =========================================
// 6. LOAD QUESTION
// =========================================

function loadQuestion() {

    const question = caseData.questions[currentQuestion];

    if (!question) {
        showAccusation();
        return;
    }

    selectedWords = [];
    attemptsLeft = 3;
    hintUsed = false;

    shuffledWords = shuffleArray(
        question.words.map((word, index) => ({
            id: index,
            word: word,
            used: false
        }))
    );

    document.getElementById("question-title").textContent =
        question.title;

    document.getElementById("question-description").textContent =
        question.description;

    document.getElementById("question-progress").textContent =
        `CLUE ${currentQuestion + 1} / ${caseData.questions.length}`;

    document.getElementById("progress-bar").style.width =
        `${(currentQuestion / caseData.questions.length) * 100}%`;

    document.getElementById("feedback").textContent = "";

    document.getElementById("feedback").className = "feedback";

    renderWords();
    updateAnswerSlots();
    updateAttempts();
    updateScore();

    document.getElementById("next-question-btn").hidden = true;
    document.getElementById("check-answer-btn").disabled = false;
}


// =========================================
// 7. DISPLAY WORD BUTTONS
// =========================================

function renderWords() {

    const bank = document.getElementById("word-bank");

    bank.innerHTML = "";

    shuffledWords.forEach(item => {

        const button = document.createElement("button");

        button.className = "word-tile";
        button.textContent = item.word;
        button.disabled = item.used;

        button.onclick = () => selectWord(item.id);

        bank.appendChild(button);
    });
}


// =========================================
// 8. SELECT WORD
// =========================================

function selectWord(wordId) {

    if (attemptsLeft <= 0) return;

    const item = shuffledWords.find(word => word.id === wordId);

    if (!item || item.used) return;

    item.used = true;

    selectedWords.push(item);

    renderWords();
    updateAnswerSlots();
}


// =========================================
// 9. UPDATE ANSWER AREA
// =========================================

function updateAnswerSlots() {

    const area = document.getElementById("answer-slots");

    area.innerHTML = "";

    if (selectedWords.length === 0) {

        area.textContent = "Select words below to build your sentence.";

        return;
    }

    selectedWords.forEach((item, index) => {

        const tile = document.createElement("span");

        tile.className = "selected-word";
        tile.textContent = item.word;

        const removeButton = document.createElement("button");

        removeButton.textContent = "×";
        removeButton.title = "Remove word";

        removeButton.onclick = () => removeWord(index);

        tile.appendChild(removeButton);

        area.appendChild(tile);
    });
}


// =========================================
// 10. REMOVE SELECTED WORD
// =========================================

function removeWord(index) {

    if (attemptsLeft <= 0) return;

    const removed = selectedWords.splice(index, 1)[0];

    const original = shuffledWords.find(
        item => item.id === removed.id
    );

    if (original) {
        original.used = false;
    }

    renderWords();
    updateAnswerSlots();
}


// =========================================
// 11. RESET WORDS
// =========================================

function resetWords() {

    if (attemptsLeft <= 0) return;

    selectedWords = [];

    shuffledWords.forEach(item => {
        item.used = false;
    });

    renderWords();
    updateAnswerSlots();

    document.getElementById("feedback").textContent = "";
}


// =========================================
// 12. CHECK ANSWER
// =========================================

function checkAnswer() {

    if (attemptsLeft <= 0) return;

    const question = caseData.questions[currentQuestion];

    if (selectedWords.length !== question.words.length) {

        showFeedback(
            "Select all the words before checking your sentence.",
            "error"
        );

        return;
    }

    totalAttempts++;

    const playerAnswer = selectedWords
        .map(item => item.word)
        .join(" ");

    const correctAnswer = question.sentence;

    if (playerAnswer === correctAnswer) {

        correctAnswers++;

        const pointsEarned = hintUsed ? 80 : 100;

        score += pointsEarned;

        if (!evidenceCollected.includes(question.evidence)) {

            evidenceCollected.push(question.evidence);
        }

        showFeedback(
            `Excellent detective work! +${pointsEarned} points. Evidence collected!`,
            "success"
        );

        document.getElementById("check-answer-btn").disabled = true;

        document.getElementById("next-question-btn").hidden = false;

        updateEvidence();
        updateScore();
        updateProgress();

    } else {

        attemptsLeft--;

        updateAttempts();

        if (attemptsLeft > 0) {

            showFeedback(
                `Not quite! Try again. ${attemptsLeft} attempts remaining.`,
                "error"
            );

        } else {

            score = Math.max(0, score - 20);

            showFeedback(
                `No attempts left! Correct sentence: ${correctAnswer}`,
                "error"
            );

            document.getElementById("check-answer-btn").disabled = true;
            document.getElementById("next-question-btn").hidden = false;

            updateScore();
        }
    }
}


// =========================================
// 13. FEEDBACK
// =========================================

function showFeedback(message, type) {

    const feedback = document.getElementById("feedback");

    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
}


// =========================================
// 14. HINT SYSTEM
// =========================================

function useHint() {

    if (attemptsLeft <= 0 || hintUsed) return;

    const question = caseData.questions[currentQuestion];

    hintUsed = true;

    score = Math.max(0, score - 20);

    showFeedback(
        `💡 Detective hint: ${question.hint} (20 points deducted)`,
        "success"
    );

    updateScore();
}


// =========================================
// 15. ATTEMPTS DISPLAY
// =========================================

function updateAttempts() {

    const hearts = "❤️ ".repeat(attemptsLeft);
    const emptyHearts = "🖤 ".repeat(3 - attemptsLeft);

    document.getElementById("attempt-display").textContent =
        hearts + emptyHearts;
}


// =========================================
// 16. EVIDENCE BOARD
// =========================================

function updateEvidence() {

    const list = document.getElementById("evidence-list");

    list.innerHTML = "";

    if (evidenceCollected.length === 0) {

        list.innerHTML = '<p class="empty-evidence">No evidence collected yet.</p>';

        return;
    }

    evidenceCollected.forEach((evidence, index) => {

        const item = document.createElement("div");

        item.className = "evidence-item";

        item.textContent = `🔎 CLUE ${index + 1}: ${evidence}`;

        list.appendChild(item);
    });
}


// =========================================
// 17. SCORE AND PROGRESS
// =========================================

function updateScore() {

    document.getElementById("score-display").textContent =
        `⭐ ${score} POINTS`;
}


function updateProgress() {

    const progress =
        ((currentQuestion + 1) / caseData.questions.length) * 100;

    document.getElementById("progress-bar").style.width =
        `${progress}%`;
}


// =========================================
// 18. NEXT QUESTION
// =========================================

function nextQuestion() {

    currentQuestion++;

    if (currentQuestion >= caseData.questions.length) {

        showAccusation();

        return;
    }

    loadQuestion();
}


// =========================================
// 19. ACCUSATION SCREEN
// =========================================

function showAccusation() {

    showScreen("accusation");

    selectedSuspect = null;

    const grid = document.getElementById("suspect-grid");

    grid.innerHTML = "";

    document.getElementById("accuse-button").disabled = true;

    document.getElementById("accusation-feedback").textContent =
        "Study the suspects and choose carefully!";

    caseData.suspects.forEach(suspect => {

        const card = document.createElement("div");

        card.className = "suspect-card";

        card.innerHTML = `
            <div class="image-placeholder suspect-image">
                <span>ADD PORTRAIT</span>
                <small>${suspect.name}</small>
            </div>

            <h3>${suspect.name}</h3>
            <p><strong>${suspect.role}</strong></p>
            <p>${suspect.description}</p>
        `;

        card.onclick = () => selectSuspect(suspect.id, card);

        grid.appendChild(card);
    });
}


// =========================================
// 20. SELECT SUSPECT
// =========================================

function selectSuspect(suspectId, selectedCard) {

    selectedSuspect = suspectId;

    document.querySelectorAll(".suspect-card").forEach(card => {
        card.classList.remove("selected");
    });

    selectedCard.classList.add("selected");

    document.getElementById("accuse-button").disabled = false;

    document.getElementById("accusation-feedback").textContent =
        "Are you sure? Confirm your accusation.";
}


// =========================================
// 21. MAKE ACCUSATION
// =========================================

function makeAccusation() {

    if (!selectedSuspect || caseFinished) return;

    caseFinished = true;

    const isCorrect = selectedSuspect === caseData.culprit;

    if (isCorrect) {

        score += 200;

    } else {

        score = Math.max(0, score - 50);
    }

    showFinalReport(isCorrect);
}


// =========================================
// 22. FINAL DETECTIVE REPORT
// =========================================

function showFinalReport(isCorrect) {

    showScreen("final-report");

    const culprit = caseData.suspects.find(
        suspect => suspect.id === caseData.culprit
    );

    const rank = getDetectiveRank(score);

    document.getElementById("report-icon").textContent =
        isCorrect ? "🏆" : "🕵️";

    document.getElementById("report-title").textContent =
        isCorrect ? "CASE CLOSED!" : "CASE SOLVED... EVENTUALLY!";

    document.getElementById("report-description").textContent =
        isCorrect
            ? "Brilliant detective work! You identified the correct culprit and solved the mystery."
            : "Your accusation was incorrect, but the investigation revealed the truth. Better luck next time!";

    document.getElementById("real-culprit").textContent =
        culprit.name;

    document.getElementById("final-score").textContent =
        score;

    const accuracy = totalAttempts > 0
        ? Math.round((correctAnswers / totalAttempts) * 100)
        : 0;

    document.getElementById("final-accuracy").textContent =
        `${accuracy}%`;

    document.getElementById("final-evidence").textContent =
        `${evidenceCollected.length}/${caseData.questions.length}`;

    document.getElementById("final-rank").textContent = rank;

    updateProgress();
}


// =========================================
// 23. DETECTIVE RANK
// =========================================

function getDetectiveRank(points) {

    if (points >= 650) return "Master Detective 🏆";

    if (points >= 450) return "Expert Detective ⭐";

    if (points >= 250) return "Junior Detective 🔎";

    return "Rookie Detective 🕵️";
}


// =========================================
// 24. RESTART CASE
// =========================================

function restartCase() {

    beginInvestigation();
}


// =========================================
// 25. EXIT CONFIRMATION
// =========================================

function confirmExit() {

    const exit = confirm(
        "Are you sure you want to leave this investigation? Your current progress will be lost."
    );

    if (exit) {

        showScreen("case-files");
    }
}


// =========================================
// 26. INITIALIZE GAME
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    // Add the next-question button to the puzzle controls.
    const actions = document.querySelector(".puzzle-actions");

    const nextButton = document.createElement("button");

    nextButton.id = "next-question-btn";
    nextButton.className = "btn btn-primary";
    nextButton.textContent = "NEXT CLUE →";
    nextButton.hidden = true;
    nextButton.onclick = nextQuestion;

    actions.appendChild(nextButton);

    // Connect the answer button.
    const checkButton = document.querySelector(
        ".puzzle-actions .btn-primary"
    );

    checkButton.id = "check-answer-btn";

    // Show the main menu first.
    showScreen("main-menu");

    updateScore();
});
