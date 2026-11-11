
"use strict";

// =====================================================
// TINY DETECTIVE
// Full game: Story -> Sentence Puzzles -> Interrogation
// -> Accusation -> Detective Report -> Next Case
// =====================================================

const TOTAL_LIVES = 3;
const PUZZLES_PER_CASE = 5;

const CASES = [
    {
        id: 1,
        title: "The Missing Necklace",
        icon: "💎",
        difficulty: "Easy",
        subtitle: "A mysterious disappearance",
        story: `At a glamorous family gathering, a beautiful diamond necklace disappears from the upstairs bedroom.

The necklace belonged to Mrs Rose, who had placed it in a jewellery box before the guests arrived.

Three guests were nearby when the necklace disappeared. Each has a different story about what happened.

You must examine the evidence, arrange the clues into sentences, and question all three suspects.

Can you discover who took the necklace?`,
        facts: [
            "The necklace was last seen in the upstairs bedroom at 8:00 PM.",
            "Three guests were inside the house during the disappearance.",
            "The bedroom window was found closed.",
            "Nobody admitted to taking the necklace."
        ],
        puzzles: [
            {
                prompt: "Reconstruct the first evidence statement:",
                words: ["The", "necklace", "was", "last", "seen", "at", "8:00", "PM."],
                answer: "The necklace was last seen at 8:00 PM."
            },
            {
                prompt: "Arrange the words to describe where the necklace was kept:",
                words: ["The", "jewellery", "box", "was", "in", "the", "bedroom."],
                answer: "The jewellery box was in the bedroom."
            },
            {
                prompt: "Reconstruct the statement about the window:",
                words: ["The", "bedroom", "window", "was", "found", "closed."],
                answer: "The bedroom window was found closed."
            },
            {
                prompt: "Build the sentence about the people in the house:",
                words: ["Three", "guests", "were", "inside", "the", "house."],
                answer: "Three guests were inside the house."
            },
            {
                prompt: "Put this final evidence statement in order:",
                words: ["Nobody", "admitted", "to", "taking", "the", "necklace."],
                answer: "Nobody admitted to taking the necklace."
            }
        ],
        suspects: [
            {
                name: "Maya Rose",
                avatar: "👩",
                description: "A family guest who was near the upstairs hallway.",
                questions: [
                    {
                        statement: "I went upstairs at 8:10 PM.",
                        answer: true,
                        explanation: "Maya's timeline confirms that she went upstairs shortly after the necklace was last seen."
                    },
                    {
                        statement: "I never entered the upstairs hallway.",
                        answer: false,
                        explanation: "Maya was seen near the upstairs hallway."
                    },
                    {
                        statement: "I knew the necklace was kept in the bedroom.",
                        answer: true,
                        explanation: "Maya knew where the jewellery was kept."
                    },
                    {
                        statement: "I stayed downstairs for the entire evening.",
                        answer: false,
                        explanation: "Maya admitted that she went upstairs."
                    },
                    {
                        statement: "I did not tell anyone that I had moved the necklace.",
                        answer: true,
                        explanation: "Maya never reported moving the necklace."
                    }
                ]
            },
            {
                name: "Oliver James",
                avatar: "👨",
                description: "A family friend who was helping with the party.",
                questions: [
                    {
                        statement: "I was helping in the kitchen at 8:00 PM.",
                        answer: true,
                        explanation: "Oliver's account places him in the kitchen."
                    },
                    {
                        statement: "I saw Maya near the upstairs stairs.",
                        answer: true,
                        explanation: "Oliver reported seeing Maya near the stairs."
                    },
                    {
                        statement: "I took the necklace from the bedroom.",
                        answer: false,
                        explanation: "Oliver denied taking the necklace."
                    },
                    {
                        statement: "The bedroom window was open.",
                        answer: false,
                        explanation: "The bedroom window was found closed."
                    },
                    {
                        statement: "I did not go into the bedroom.",
                        answer: true,
                        explanation: "Oliver's statement places him away from the bedroom."
                    }
                ]
            },
            {
                name: "Sophie Lane",
                avatar: "👧",
                description: "A guest who spent most of the evening downstairs.",
                questions: [
                    {
                        statement: "I arrived before 8:00 PM.",
                        answer: true,
                        explanation: "Sophie arrived before the necklace disappeared."
                    },
                    {
                        statement: "I went into the upstairs bedroom.",
                        answer: false,
                        explanation: "Sophie denied entering the bedroom."
                    },
                    {
                        statement: "I noticed that the necklace was missing later in the evening.",
                        answer: true,
                        explanation: "Sophie noticed the disappearance after the initial timeline."
                    },
                    {
                        statement: "I saw Oliver carrying the necklace.",
                        answer: false,
                        explanation: "There is no evidence that Oliver carried the necklace."
                    },
                    {
                        statement: "I stayed downstairs for most of the party.",
                        answer: true,
                        explanation: "Sophie's account places her downstairs for most of the evening."
                    }
                ]
            }
        ],
        culprit: "Maya Rose",
        explanation: "Maya's timeline places her upstairs shortly after the necklace was last seen. Her statements also confirm that she knew where it was kept. Her account is the one that conflicts most strongly with the evidence."
    },
    {
        id: 2,
        title: "The Vanishing Trophy",
        icon: "🏆",
        difficulty: "Easy",
        subtitle: "The school competition mystery",
        story: "The school's golden sports trophy has disappeared just before the prize ceremony. Three students were helping prepare the hall. Someone knows more than they are saying.",
        facts: [
            "The trophy was last seen on the display table.",
            "The hall was being prepared for the ceremony.",
            "Three students had access to the hall.",
            "The trophy was missing before the ceremony."
        ],
        puzzles: [],
        suspects: [],
        culprit: "",
        explanation: "This case is planned for a future update."
    },
    {
        id: 3,
        title: "The Stolen Birthday Cake",
        icon: "🎂",
        difficulty: "Easy",
        subtitle: "A very suspicious dessert",
        story: "A birthday cake disappears from the kitchen before the birthday celebration. Three guests were seen near the kitchen.",
        facts: [
            "The cake was placed on the kitchen counter.",
            "The party started at 6:00 PM.",
            "Three guests were near the kitchen.",
            "Nobody admitted taking the cake."
        ],
        puzzles: [],
        suspects: [],
        culprit: "",
        explanation: "This case is planned for a future update."
    },
    {
        id: 4,
        title: "The Secret Invitation",
        icon: "💌",
        difficulty: "Easy",
        subtitle: "A missing envelope",
        story: "An important invitation disappears from a desk. Three people had access to the room, and each has a different explanation.",
        facts: [
            "The invitation was on the desk.",
            "The room was unlocked.",
            "Three people entered the room.",
            "The envelope has not been found."
        ],
        puzzles: [],
        suspects: [],
        culprit: "",
        explanation: "This case is planned for a future update."
    },
    {
        id: 5,
        title: "The Mystery of Room 13",
        icon: "🚪",
        difficulty: "Medium",
        subtitle: "The room nobody entered",
        story: "A strange noise is heard from Room 13, but everyone claims they were nowhere near it. Three guests may be hiding something.",
        facts: [
            "The noise was heard at midnight.",
            "The room was locked.",
            "Three guests were in the building.",
            "A key was missing."
        ],
        puzzles: [],
        suspects: [],
        culprit: "",
        explanation: "This case is planned for a future update."
    },
    {
        id: 6,
        title: "The Missing Painting",
        icon: "🖼️",
        difficulty: "Medium",
        subtitle: "A blank space on the wall",
        story: "A valuable painting disappears from an art gallery. The security guard remembers three people who visited the gallery.",
        facts: [
            "The painting was on the north wall.",
            "The gallery closed at 9:00 PM.",
            "Three visitors were questioned.",
            "The security alarm was not activated."
        ],
        puzzles: [],
        suspects: [],
        culprit: "",
        explanation: "This case is planned for a future update."
    },
    {
        id: 7,
        title: "The Midnight Footsteps",
        icon: "👣",
        difficulty: "Medium",
        subtitle: "Someone was walking around",
        story: "Footsteps are heard outside a locked office late at night. Three people claim they were asleep.",
        facts: [
            "The footsteps were heard at midnight.",
            "The office door was locked.",
            "Three people were staying in the building.",
            "A muddy footprint was discovered."
        ],
        puzzles: [],
        suspects: [],
        culprit: "",
        explanation: "This case is planned for a future update."
    },
    {
        id: 8,
        title: "The Fake Alibi",
        icon: "🕰️",
        difficulty: "Medium",
        subtitle: "Time does not lie",
        story: "An expensive watch disappears during a dinner party. Three guests provide timelines that do not quite match.",
        facts: [
            "The watch was seen at 7:30 PM.",
            "The dining room clock was broken.",
            "Three guests gave statements.",
            "One timeline contains a contradiction."
        ],
        puzzles: [],
        suspects: [],
        culprit: "",
        explanation: "This case is planned for a future update."
    },
    {
        id: 9,
        title: "The Diamond Heist",
        icon: "💍",
        difficulty: "Hard",
        subtitle: "The impossible robbery",
        story: "A priceless diamond disappears from a secure exhibition. The security system was active, yet the diamond is gone.",
        facts: [
            "The diamond was displayed in a locked case.",
            "The alarm system was active.",
            "Three people had authorised access.",
            "No broken glass was found."
        ],
        puzzles: [],
        suspects: [],
        culprit: "",
        explanation: "This case is planned for a future update."
    },
    {
        id: 10,
        title: "The Detective's Final Case",
        icon: "🕵️",
        difficulty: "Hard",
        subtitle: "The biggest mystery yet",
        story: "A final mystery challenges everything you have learned. Three suspects, conflicting statements, and a secret that changes the entire investigation.",
        facts: [
            "Three suspects have been questioned.",
            "Several clues contradict each other.",
            "The final evidence is hidden in the timeline.",
            "Only careful detectives will solve the case."
        ],
        puzzles: [],
        suspects: [],
        culprit: "",
        explanation: "This case is planned for a future update."
    }
];

// =====================================================
// GAME STATE
// =====================================================

const state = {
    unlocked: 1,
    completed: [],
    points: 0,
    selectedCase: 1,

    lives: TOTAL_LIVES,
    correct: 0,
    mistakes: 0,
    totalAnswered: 0,

    puzzleIndex: 0,
    puzzleTiles: [],
    selectedTileIds: [],
    puzzleLocked: false,
    puzzlesCorrect: 0,

    suspectIndex: 0,
    questionIndex: 0,
    selectedAccusation: null,

    secondsLeft: 0,
    timerId: null,
    timerDuration: 0
};

// =====================================================
// ELEMENT HELPERS
// =====================================================

const $ = id => document.getElementById(id);

function currentCase() {
    return CASES.find(item => item.id === state.selectedCase);
}

function currentSuspect() {
    return currentCase().suspects[state.suspectIndex];
}

function showScreen(name) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const target = $(name + "Screen");

    if (target) {
        target.classList.add("active");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateHeader() {
    $("headerPoints").textContent = `⭐ ${state.points} Points`;
    $("headerLives").textContent = `❤️ ${state.lives} Lives`;
}

function setFeedback(elementId, message, type) {
    const element = $(elementId);
    element.textContent = message;
    element.className = "feedback " + (type || "");
}

function stopTimer() {
    if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
    }
}

function resetTimerDisplay(barId, timerId, duration) {
    $(barId).style.width = "100%";
    $(timerId).textContent = `⏱ ${duration}s`;
}

function startTimer(duration, timerId, barId, onExpire) {
    stopTimer();

    state.timerDuration = duration;
    state.secondsLeft = duration;

    resetTimerDisplay(barId, timerId, duration);

    state.timerId = setInterval(() => {
        state.secondsLeft--;

        $(timerId).textContent = `⏱ ${state.secondsLeft}s`;

        const percentage = Math.max(
            0,
            (state.secondsLeft / state.timerDuration) * 100
        );

        $(barId).style.width = percentage + "%";

        if (state.secondsLeft <= 0) {
            stopTimer();
            onExpire();
        }
    }, 1000);
}

function getTimeForDifficulty() {
    const difficulty = currentCase().difficulty;

    if (difficulty === "Easy") return 45;
    if (difficulty === "Medium") return 30;

    return 20;
}

// =====================================================
// SAVE AND LOAD
// =====================================================

function saveProgress() {
    const data = {
        unlocked: state.unlocked,
        completed: state.completed,
        points: state.points
    };

    localStorage.setItem("tinyDetectiveSave", JSON.stringify(data));
}

function loadProgress() {
    try {
        const saved = localStorage.getItem("tinyDetectiveSave");

        if (!saved) return;

        const data = JSON.parse(saved);

        state.unlocked = Math.min(
            CASES.length,
            Math.max(1, Number(data.unlocked) || 1)
        );

        state.completed = Array.isArray(data.completed)
            ? data.completed.filter(id =>
                Number.isInteger(id) &&
                id >= 1 &&
                id <= CASES.length
            )
            : [];

        state.points = Number(data.points) || 0;
    } catch (error) {
        console.warn("Could not load saved progress:", error);
    }

    updateHeader();
}

// =====================================================
// CASE ARCHIVE
// =====================================================

function renderCases() {
    const grid = $("caseGrid");
    grid.innerHTML = "";

    CASES.forEach(item => {
        const unlocked = item.id <= state.unlocked;
        const completed = state.completed.includes(item.id);

        const card = document.createElement("div");
        card.className = "case-card" + (!unlocked ? " locked" : "");

        const buttonText = completed
            ? "Play Again ↻"
            : unlocked
                ? "Open Case →"
                : "🔒 Locked";

        card.innerHTML = `
            <div class="case-icon">${item.icon}</div>
            <h3>Case ${item.id}: ${item.title}</h3>
            <p>${item.difficulty} · ${item.subtitle}</p>
            <p>${completed ? "✓ Completed" : unlocked ? "Available" : "Complete previous case first"}</p>
            <button class="btn ${unlocked ? "primary" : "secondary"}"
                ${unlocked ? "" : "disabled"}>
                ${buttonText}
            </button>
        `;

        if (unlocked) {
            card.querySelector("button").addEventListener("click", () => {
                openBriefing(item.id);
            });
        }

        grid.appendChild(card);
    });
}

function openBriefing(caseId) {
    state.selectedCase = caseId;

    const item = currentCase();

    if (!item) return;

    $("briefingTitle").textContent = `Case ${item.id}: ${item.title}`;
    $("briefingSubtitle").textContent = item.subtitle;
    $("briefingIcon").textContent = item.icon;
    $("briefingStory").textContent = item.story;

    $("briefingFacts").innerHTML = "";

    item.facts.forEach(fact => {
        const li = document.createElement("li");
        li.textContent = fact;
        $("briefingFacts").appendChild(li);
    });

    showScreen("briefing");
}

// =====================================================
// RESET CASE
// =====================================================

function resetCaseState() {
    stopTimer();

    state.lives = TOTAL_LIVES;
    state.correct = 0;
    state.mistakes = 0;
    state.totalAnswered = 0;

    state.puzzleIndex = 0;
    state.puzzleTiles = [];
    state.selectedTileIds = [];
    state.puzzleLocked = false;
    state.puzzlesCorrect = 0;

    state.suspectIndex = 0;
    state.questionIndex = 0;
    state.selectedAccusation = null;

    updateHeader();
}

// =====================================================
// SENTENCE BUILDING STAGE
// =====================================================

function startPuzzleStage() {
    const item = currentCase();

    if (!item || !item.puzzles || item.puzzles.length === 0) {
        alert("This case is not available yet. Case 1 is currently playable.");
        return;
    }

    resetCaseState();

    showScreen("puzzle");
    renderPuzzle();
}

function shuffleArray(array) {
    const copy = [...array];

    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}

function renderPuzzle() {
    const item = currentCase();

    if (state.puzzleIndex >= item.puzzles.length) {
        finishPuzzleStage();
        return;
    }

    const puzzle = item.puzzles[state.puzzleIndex];

    state.selectedTileIds = [];
    state.puzzleLocked = false;

    state.puzzleTiles = shuffleArray(
        puzzle.words.map((word, index) => ({
            id: index,
            text: word
        }))
    );

    $("puzzleProgress").textContent =
        `Puzzle ${state.puzzleIndex + 1} / ${item.puzzles.length}`;

    $("puzzleLives").textContent = `❤️ ${state.lives}`;
    $("puzzlePrompt").textContent = puzzle.prompt;

    setFeedback("puzzleFeedback", "", "");

    renderWordTiles();
    renderAnswerArea();

    startTimer(
        getTimeForDifficulty(),
        "puzzleTimer",
        "puzzleTimerBar",
        handlePuzzleTimeout
    );

    updateHeader();
}

function renderWordTiles() {
    const container = $("wordTiles");
    container.innerHTML = "";

    state.puzzleTiles.forEach(tile => {
        const alreadySelected = state.selectedTileIds.includes(tile.id);

        if (alreadySelected) return;

        const button = document.createElement("button");
        button.className = "word-tile";
        button.textContent = tile.text;

        button.disabled = state.puzzleLocked;

        button.addEventListener("click", () => {
            selectWord(tile.id);
        });

        container.appendChild(button);
    });
}

function renderAnswerArea() {
    const area = $("answerArea");
    area.innerHTML = "";

    if (state.selectedTileIds.length === 0) {
        const placeholder = document.createElement("span");
        placeholder.className = "answer-placeholder";
        placeholder.textContent = "Your sentence will appear here...";
        area.appendChild(placeholder);
        return;
    }

    state.selectedTileIds.forEach(tileId => {
        const tile = state.puzzleTiles.find(item => item.id === tileId);

        const button = document.createElement("button");
        button.className = "answer-tile";
        button.textContent = tile.text;
        button.disabled = state.puzzleLocked;

        button.addEventListener("click", () => {
            removeWord(tileId);
        });

        area.appendChild(button);
    });
}

function selectWord(tileId) {
    if (state.puzzleLocked) return;

    if (state.selectedTileIds.includes(tileId)) return;

    state.selectedTileIds.push(tileId);

    renderWordTiles();
    renderAnswerArea();
}

function removeWord(tileId) {
    if (state.puzzleLocked) return;

    state.selectedTileIds = state.selectedTileIds.filter(
        id => id !== tileId
    );

    renderWordTiles();
    renderAnswerArea();
}

function undoWord() {
    if (state.puzzleLocked) return;

    state.selectedTileIds.pop();

    renderWordTiles();
    renderAnswerArea();
}

function clearWords() {
    if (state.puzzleLocked) return;

    state.selectedTileIds = [];

    renderWordTiles();
    renderAnswerArea();
}

function normaliseSentence(sentence) {
    return sentence
        .toLowerCase()
        .trim()
        .replace(/[.!?]+$/g, "")
        .replace(/\s+/g, "");
}

function checkSentence() {
    if (state.puzzleLocked) return;

    if (state.selectedTileIds.length === 0) {
        setFeedback("puzzleFeedback", "Choose some word tiles first!", "bad");
        return;
    }

    const puzzle = currentCase().puzzles[state.puzzleIndex];

    const playerSentence = state.selectedTileIds
        .map(id => state.puzzleTiles.find(tile => tile.id === id).text)
        .join(" ");

    if (
        normaliseSentence(playerSentence) ===
        normaliseSentence(puzzle.answer)
    ) {
        stopTimer();

        state.puzzleLocked = true;
        state.points += 10;
        state.correct++;
        state.puzzlesCorrect++;

        updateHeader();

        setFeedback(
            "puzzleFeedback",
            "✓ Brilliant! Correct sentence! +10 points",
            "good"
        );

        $("puzzleLives").textContent = `❤️ ${state.lives}`;

        setTimeout(() => {
            state.puzzleIndex++;
            renderPuzzle();
        }, 1200);

    } else {
        state.points = Math.max(0, state.points - 5);
        state.mistakes++;
        state.lives--;

        updateHeader();

        $("puzzleLives").textContent = `❤️ ${state.lives}`;

        setFeedback(
            "puzzleFeedback",
            "Not quite! Try rearranging the words. -5 points and -1 life.",
            "bad"
        );

        if (state.lives <= 0) {
            stopTimer();

            setTimeout(() => {
                showFailedScreen();
            }, 1000);
        } else {
            state.selectedTileIds = [];
            renderWordTiles();
            renderAnswerArea();
        }
    }
}

function handlePuzzleTimeout() {
    state.points = Math.max(0, state.points - 10);
    state.mistakes++;
    state.lives--;

    updateHeader();

    $("puzzleLives").textContent = `❤️ ${state.lives}`;

    if (state.lives <= 0) {
        showFailedScreen();
        return;
    }

    setFeedback(
        "puzzleFeedback",
        "⏰ Time's up! One life lost. Moving to the next puzzle...",
        "bad"
    );

    state.puzzleLocked = true;

    setTimeout(() => {
        state.puzzleIndex++;
        renderPuzzle();
    }, 1200);
}

function finishPuzzleStage() {
    stopTimer();

    setFeedback("puzzleFeedback", "", "");

    startInvestigation();
}

// =====================================================
// INTERROGATION STAGE
// =====================================================

function startInvestigation() {
    state.suspectIndex = 0;
    state.questionIndex = 0;

    showScreen("interview");
    renderQuestion();
}

function renderQuestion() {
    const item = currentCase();

    if (state.suspectIndex >= item.suspects.length) {
        showAccusation();
        return;
    }

    const suspect = currentSuspect();
    const question = suspect.questions[state.questionIndex];

    if (!question) {
        state.suspectIndex++;
        state.questionIndex = 0;
        renderQuestion();
        return;
    }

    $("suspectAvatar").textContent = suspect.avatar;
    $("suspectName").textContent = suspect.name;
    $("suspectDescription").textContent = suspect.description;

    $("questionNumber").textContent =
        `Question ${state.questionIndex + 1} of 5`;

    $("interviewProgress").textContent =
        `Suspect ${state.suspectIndex + 1} / ${item.suspects.length}`;

    $("interviewLives").textContent = `❤️ ${state.lives}`;

    $("suspectStatement").textContent = question.statement;

    setFeedback("interviewFeedback", "", "");

    $("truthButton").disabled = false;
    $("lieButton").disabled = false;

    startTimer(
        getTimeForDifficulty(),
        "interviewTimer",
        "interviewTimerBar",
        handleInterviewTimeout
    );

    updateHeader();
}

function submitDecision(playerAnswer) {
    if ($("truthButton").disabled || $("lieButton").disabled) return;

    stopTimer();

    $("truthButton").disabled = true;
    $("lieButton").disabled = true;

    const question = currentSuspect().questions[state.questionIndex];

    state.totalAnswered++;

    if (playerAnswer === question.answer) {
        state.points += 15;
        state.correct++;

        setFeedback(
            "interviewFeedback",
            "✓ Correct! " + question.explanation + " (+15 points)",
            "good"
        );
    } else {
        state.points = Math.max(0, state.points - 5);
        state.mistakes++;
        state.lives--;

        setFeedback(
            "interviewFeedback",
            "✕ Incorrect! " + question.explanation + " (-5 points, -1 life)",
            "bad"
        );
    }

    updateHeader();

    $("interviewLives").textContent = `❤️ ${state.lives}`;

    if (state.lives <= 0) {
        setTimeout(showFailedScreen, 1500);
        return;
    }

    setTimeout(advanceQuestion, 2200);
}

function handleInterviewTimeout() {
    state.points = Math.max(0, state.points - 10);
    state.mistakes++;
    state.lives--;

    updateHeader();

    $("truthButton").disabled = true;
    $("lieButton").disabled = true;

    $("interviewLives").textContent = `❤️ ${state.lives}`;

    setFeedback(
        "interviewFeedback",
        "⏰ Time ran out! You lost one life.",
        "bad"
    );

    if (state.lives <= 0) {
        setTimeout(showFailedScreen, 1000);
        return;
    }

    setTimeout(advanceQuestion, 1500);
}

function advanceQuestion() {
    state.questionIndex++;

    if (state.questionIndex >= 5) {
        state.suspectIndex++;
        state.questionIndex = 0;
    }

    renderQuestion();
}

// =====================================================
// FINAL ACCUSATION
// =====================================================

function showAccusation() {
    stopTimer();

    const container = $("accusationChoices");
    container.innerHTML = "";

    state.selectedAccusation = null;

    currentCase().suspects.forEach(suspect => {
        const button = document.createElement("button");

        button.className = "suspect-choice";
        button.textContent = `${suspect.avatar} ${suspect.name}`;

        button.addEventListener("click", () => {
            document.querySelectorAll(".suspect-choice").forEach(choice => {
                choice.classList.remove("selected");
            });

            button.classList.add("selected");
            state.selectedAccusation = suspect.name;

            setFeedback("accusationFeedback", "", "");
        });

        container.appendChild(button);
    });

    showScreen("accusation");
}

function submitAccusation() {
    if (!state.selectedAccusation) {
        setFeedback(
            "accusationFeedback",
            "Choose a suspect before confirming your accusation!",
            "bad"
        );
        return;
    }

    const item = currentCase();

    if (state.selectedAccusation === item.culprit) {
        state.points += 100;

        if (!state.completed.includes(item.id)) {
            state.completed.push(item.id);
        }

        if (item.id < CASES.length) {
            state.unlocked = Math.max(state.unlocked, item.id + 1);
        }

        saveProgress();

        updateHeader();
        showReport(true);

    } else {
        state.points = Math.max(0, state.points - 25);
        state.mistakes++;

        updateHeader();
        showReport(false);
    }
}

// =====================================================
// DETECTIVE REPORT
// =====================================================

function showReport(won) {
    stopTimer();

    const item = currentCase();

    $("reportIcon").textContent = won ? "🏆" : "🔍";
    $("reportTitle").textContent = won
        ? "Case Solved!"
        : "Wrong Suspect!";

    $("reportMessage").textContent = won
        ? "Excellent work, Detective! You uncovered the truth."
        : "Your accusation was incorrect. Review the evidence and try again.";

    $("finalPoints").textContent = state.points;
    $("finalCorrect").textContent = state.correct;
    $("finalMistakes").textContent = state.mistakes;
    $("finalLives").textContent = state.lives;

    $("reportExplanation").textContent =
        item.explanation + ` The culprit was ${item.culprit}.`;

    if (won && item.id < CASES.length) {
        $("nextCaseButton").style.display = "inline-block";
        $("nextCaseButton").textContent = "Next Case →";
    } else if (won) {
        $("nextCaseButton").style.display = "none";
    } else {
        $("nextCaseButton").style.display = "inline-block";
        $("nextCaseButton").textContent = "Try This Case Again ↻";
    }

    showScreen("report");
}

// =====================================================
// FAILED INVESTIGATION
// =====================================================

function showFailedScreen() {
    stopTimer();
    updateHeader();
    showScreen("failed");
}

// =====================================================
// BUTTON EVENTS
// =====================================================

$("playButton").addEventListener("click", () => {
    renderCases();
    showScreen("cases");
});

$("continueButton").addEventListener("click", () => {
    renderCases();
    showScreen("cases");
});

$("backHomeButton").addEventListener("click", () => {
    showScreen("home");
});

$("backCasesButton").addEventListener("click", () => {
    renderCases();
    showScreen("cases");
});

$("enterPuzzleButton").addEventListener("click", startPuzzleStage);

$("undoWordButton").addEventListener("click", undoWord);
$("clearWordsButton").addEventListener("click", clearWords);
$("checkSentenceButton").addEventListener("click", checkSentence);

$("truthButton").addEventListener("click", () => {
    submitDecision(true);
});

$("lieButton").addEventListener("click", () => {
    submitDecision(false);
});

$("accuseButton").addEventListener("click", submitAccusation);

$("nextCaseButton").addEventListener("click", () => {
    if (state.completed.includes(state.selectedCase)) {
        const nextId = state.selectedCase + 1;

        if (nextId <= CASES.length) {
            openBriefing(nextId);
            return;
        }
    }

    openBriefing(state.selectedCase);
});

$("reportHomeButton").addEventListener("click", () => {
    renderCases();
    showScreen("home");
});

$("retryButton").addEventListener("click", () => {
    startPuzzleStage();
});

$("failedHomeButton").addEventListener("click", () => {
    renderCases();
    showScreen("home");
});

// =====================================================
// INITIALISE GAME
// =====================================================

loadProgress();
updateHeader();
showScreen("home");
