
"use strict";

/* =========================================================
   TINY DETECTIVE
   CYBERPUNK DETECTIVE NOIR EDITION
   Complete investigation engine
========================================================= */

/* =========================
   CONFIGURATION
========================= */

const CONFIG = {
    TOTAL_CASES: 10,
    SUSPECTS_PER_CASE: 3,
    QUESTIONS_PER_SUSPECT: 5,

    STORAGE_KEY: "tinyDetectiveProgress_v2",

    TIMER: {
        easy: 45,
        medium: 30,
        hard: 20
    },

    STARTING_LIVES: 3,

    POINTS: {
        correct: 100,
        incorrect: -20,
        hint: -10,
        accusation: 200,
        completed: 150,
        puzzle: 100
    }
};

/* =========================
   DOM HELPERS
========================= */

const $ = (id) => document.getElementById(id);

function setText(id, value) {
    const element = $(id);
    if (element) element.textContent = value ?? "";
}

function setHTML(id, value) {
    const element = $(id);
    if (element) element.innerHTML = value ?? "";
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const screen = $(screenId);
    if (screen) screen.classList.add("active");

    gameState.currentScreen = screenId;
    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================
   CASE DATABASE

   Each case has:
   - Four evidence items
   - Three suspects
   - Five interview statements per suspect
   - One correct culprit
========================= */

function makeQuestions(suspect, caseInfo, isCulprit) {
    const trueStatements = [
        `You were present at ${suspect.location}.`,
        `You knew about the incident before the investigation began.`,
        `You had access to the area where the incident happened.`,
        `You spoke to someone connected to this case.`,
        `You have information that may help explain what happened.`
    ];

    const falseStatements = [
        `You were nowhere near ${suspect.location} that evening.`,
        `You had never heard about this incident before today.`,
        `You had absolutely no access to the crime scene.`,
        `You did not speak to anyone connected to this case.`,
        `You have no information that could help this investigation.`
    ];

    return trueStatements.map((statement, index) => {
        const isLie = isCulprit && index === 2;

        return {
            statement: isLie ? falseStatements[index] : statement,
            answer: isLie ? "lie" : "truth",
            explanation: isLie
                ? `${suspect.name}'s statement contradicts the evidence collected at ${caseInfo.location}.`
                : `The available evidence supports this statement from ${suspect.name}.`
        };
    });
}

function makeSuspect(name, role, description, location, isCulprit, caseInfo) {
    const suspect = {
        name,
        role,
        description,
        location,
        isCulprit
    };

    suspect.questions = makeQuestions(suspect, caseInfo, isCulprit);
    return suspect;
}

function createCase(
    id,
    title,
    location,
    icon,
    classification,
    story,
    evidence,
    puzzle,
    suspects,
    culpritIndex,
    explanation
) {
    const caseInfo = {
        id,
        title,
        location,
        icon,
        classification,
        story,
        evidence,
        puzzle,
        culpritIndex,
        explanation
    };

    caseInfo.suspects = suspects.map((suspect, index) =>
        makeSuspect(
            suspect.name,
            suspect.role,
            suspect.description,
            suspect.location,
            index === culpritIndex,
            caseInfo
        )
    );

    return caseInfo;
}

const caseData = [

    /* CASE 1 */
    createCase(
        1,
        "The Missing Necklace",
        "Blackwood Mansion",
        "💎",
        "THEFT",
        "A priceless necklace disappeared during an exclusive gathering at Blackwood Mansion. The doors were locked, the guests were inside, and someone in the mansion knows exactly what happened.",
        [
            "A broken display lock was found beside the empty jewellery case.",
            "A guest reported hearing footsteps near the gallery.",
            "A security camera stopped recording shortly before the theft.",
            "A small piece of dark fabric was discovered near the display."
        ],
        "The display lock was damaged before the necklace disappeared.",
        [
            {
                name: "Maya",
                role: "Mansion Guest",
                description: "A frequent guest who knows the mansion well.",
                location: "the dining room"
            },
            {
                name: "Daniel",
                role: "Personal Assistant",
                description: "An employee with access to private areas.",
                location: "the gallery"
            },
            {
                name: "Victor",
                role: "Security Officer",
                description: "Responsible for the mansion's security system.",
                location: "the security office"
            }
        ],
        1,
        "Daniel had access to the gallery and the opportunity to interfere with the display. The damaged lock and missing security footage are important clues."
    ),

    /* CASE 2 */
    createCase(
        2,
        "The Midnight Museum Theft",
        "Neon City Museum",
        "🏛️",
        "ART THEFT",
        "A rare historical artefact vanished from a secured museum exhibition after midnight. The alarm system was active, but no intruder was recorded entering the building.",
        [
            "The display case was opened using an authorised access code.",
            "A museum employee reported an unusual power interruption.",
            "Dust near the display showed evidence of recent movement.",
            "A visitor badge was discovered inside a restricted corridor."
        ],
        "The museum display was opened using an authorised access code.",
        [
            {
                name: "Elena",
                role: "Museum Curator",
                description: "Responsible for the exhibition and its artefacts.",
                location: "the exhibition hall"
            },
            {
                name: "Marcus",
                role: "Night Guard",
                description: "Patrols the museum after closing time.",
                location: "the security entrance"
            },
            {
                name: "Sofia",
                role: "Researcher",
                description: "Was studying the stolen artefact.",
                location: "the research archive"
            }
        ],
        0,
        "Elena had authorised access to the exhibition and could use the museum's access system. The display case was not forced open."
    ),

    /* CASE 3 */
    createCase(
        3,
        "The Vanishing Scientist",
        "Nova Research Laboratory",
        "🧪",
        "DISAPPEARANCE",
        "A leading scientist disappeared from a restricted laboratory. Their workstation was left running, and a confidential research file was missing.",
        [
            "The laboratory access log recorded a late-night entry.",
            "A research file was copied shortly before the disappearance.",
            "A laboratory coat was found near the emergency exit.",
            "The security system recorded an unexplained shutdown."
        ],
        "A confidential research file was copied before the scientist disappeared.",
        [
            {
                name: "Dr. Cross",
                role: "Lead Researcher",
                description: "Worked closely with the missing scientist.",
                location: "the main laboratory"
            },
            {
                name: "Lena",
                role: "Laboratory Assistant",
                description: "Maintained the laboratory equipment.",
                location: "the equipment room"
            },
            {
                name: "Adrian",
                role: "Security Technician",
                description: "Maintained the laboratory security system.",
                location: "the control room"
            }
        ],
        2,
        "Dr. Cross had the technical knowledge to interfere with the laboratory security system and access the confidential research."
    ),

    /* CASE 4 */
    createCase(
        4,
        "The Poisoned Invitation",
        "Royal Hotel",
        "🥂",
        "ATTEMPTED MURDER",
        "A prominent guest collapsed after attending a private hotel dinner. Investigators discovered that the invitation list had been changed shortly before the event.",
        [
            "A glass was recovered from the guest's table.",
            "The dinner seating arrangement had been altered.",
            "A hotel employee noticed a suspicious package.",
            "The guest received an anonymous message before dinner."
        ],
        "The dinner seating arrangement was changed shortly before the incident.",
        [
            {
                name: "Isabelle",
                role: "Event Planner",
                description: "Organised the private dinner.",
                location: "the ballroom"
            },
            {
                name: "Rafael",
                role: "Hotel Manager",
                description: "Had authority over hotel arrangements.",
                location: "the reception office"
            },
            {
                name: "Thomas",
                role: "Private Guest",
                description: "Attended the dinner as an invited guest.",
                location: "the dining room"
            }
        ],
        1,
        "Rafael could change the seating arrangement and had access to the hotel's private event records."
    ),

    /* CASE 5 */
    createCase(
        5,
        "The Stolen Identity",
        "Neon City Financial Tower",
        "🪪",
        "IDENTITY FRAUD",
        "A senior executive discovered that someone had accessed their private accounts using a stolen identity. Financial records show suspicious transactions.",
        [
            "A duplicate access card was used at the tower.",
            "An unusual transaction was recorded overnight.",
            "The executive's login details were changed.",
            "A printer produced an unauthorised identity document."
        ],
        "A duplicate access card was used to enter the financial tower.",
        [
            {
                name: "Jade",
                role: "Systems Administrator",
                description: "Managed employee access credentials.",
                location: "the server room"
            },
            {
                name: "Oliver",
                role: "Financial Analyst",
                description: "Worked with the executive's financial records.",
                location: "the finance department"
            },
            {
                name: "Nina",
                role: "Executive Assistant",
                description: "Had access to the executive's office.",
                location: "the executive office"
            }
        ],
        0,
        "Jade's administrative access made it possible to duplicate credentials and manipulate account information."
    ),

    /* CASE 6 */
    createCase(
        6,
        "The Ghost Train",
        "Underground Metro",
        "🚇",
        "SABOTAGE",
        "A driverless metro train stopped unexpectedly between stations. The control system showed no authorised shutdown, and a passenger reported seeing someone near the maintenance entrance.",
        [
            "The train's control signal was interrupted.",
            "A maintenance panel was left open.",
            "A restricted maintenance key was missing.",
            "A station camera recorded movement near the tunnel."
        ],
        "The train control signal was deliberately interrupted.",
        [
            {
                name: "Mira",
                role: "Train Operator",
                description: "Responsible for monitoring train operations.",
                location: "the control station"
            },
            {
                name: "Leon",
                role: "Station Manager",
                description: "Managed daily station operations.",
                location: "the station office"
            },
            {
                name: "Rex",
                role: "Maintenance Engineer",
                description: "Had access to the underground maintenance panels.",
                location: "the maintenance tunnel"
            }
        ],
        2,
        "Rex had access to the maintenance tunnel and the equipment needed to interrupt the train's control signal."
    ),

    /* CASE 7 */
    createCase(
        7,
        "The Disappearing Diamond",
        "Aurora Hotel",
        "💠",
        "JEWELLERY THEFT",
        "A rare diamond disappeared during a luxury hotel auction. Several guests were present, but the diamond was missing before the auction ended.",
        [
            "A display sensor was disabled.",
            "A service lift stopped on the auction floor.",
            "A staff access card was used after closing.",
            "A glove was found behind the display platform."
        ],
        "The display sensor was disabled before the diamond was taken.",
        [
            {
                name: "Amara",
                role: "Auction Host",
                description: "Presented the diamond during the auction.",
                location: "the auction hall"
            },
            {
                name: "Zane",
                role: "Hotel Technician",
                description: "Maintained the hotel's display equipment.",
                location: "the service corridor"
            },
            {
                name: "Elliot",
                role: "Private Collector",
                description: "Had placed a bid on the diamond.",
                location: "the guest lounge"
            }
        ],
        1,
        "Zane could access the display sensor and the service areas without attracting attention."
    ),

    /* CASE 8 */
    createCase(
        8,
        "The Hacker's Alibi",
        "Cyber Division Headquarters",
        "💻",
        "CYBERCRIME",
        "A protected government database was accessed without authorisation. The hacker left a message claiming to have an impossible alibi.",
        [
            "The database recorded a local access attempt.",
            "A firewall rule was changed.",
            "An encrypted file was copied.",
            "A terminal was left running in a restricted room."
        ],
        "A firewall rule was changed before the database was accessed.",
        [
            {
                name: "Morgan",
                role: "Cyber Investigator",
                description: "Investigated digital security breaches.",
                location: "the investigation office"
            },
            {
                name: "Tara",
                role: "Network Specialist",
                description: "Maintained the division's network.",
                location: "the network centre"
            },
            {
                name: "Kai",
                role: "Systems Analyst",
                description: "Had access to the protected database.",
                location: "the restricted terminal room"
            }
        ],
        2,
        "Kai had access to the restricted terminal and the technical permissions required to alter the firewall rule."
    ),

    /* CASE 9 */
    createCase(
        9,
        "The Last Photograph",
        "Silverlight Studio",
        "📷",
        "MISSING EVIDENCE",
        "A photographer's final image disappeared from a secure studio archive. The photograph may contain evidence connected to an unsolved crime.",
        [
            "The archive's access history was edited.",
            "A camera memory card was missing.",
            "The studio door was opened after closing.",
            "A photograph was found in a waste bin."
        ],
        "The studio archive access history was edited after closing time.",
        [
            {
                name: "Noah",
                role: "Studio Photographer",
                description: "Created the missing photograph.",
                location: "the photography studio"
            },
            {
                name: "Chloe",
                role: "Archive Assistant",
                description: "Organised the studio's digital archive.",
                location: "the archive room"
            },
            {
                name: "Ethan",
                role: "Studio Manager",
                description: "Managed the studio and its employees.",
                location: "the management office"
            }
        ],
        0,
        "Noah had direct knowledge of the missing photograph and the opportunity to remove the original image."
    ),

    /* CASE 10 */
    createCase(
        10,
        "The Final Protocol",
        "Central Intelligence Tower",
        "🛰️",
        "CLASSIFIED",
        "A classified security protocol was activated without authorisation. The tower has entered lockdown, and the investigation may reveal a betrayal within the organisation.",
        [
            "The protocol was activated using an internal command.",
            "A senior access credential was used.",
            "A restricted server was accessed.",
            "A security recording was deleted."
        ],
        "The final protocol was activated using an internal command.",
        [
            {
                name: "Agent Vale",
                role: "Intelligence Officer",
                description: "Responsible for internal intelligence reports.",
                location: "the intelligence floor"
            },
            {
                name: "Commander Rex",
                role: "Division Commander",
                description: "Had senior authority within the tower.",
                location: "the command centre"
            },
            {
                name: "Agent Nova",
                role: "Security Specialist",
                description: "Managed the tower's security systems.",
                location: "the security server room"
            }
        ],
        1,
        "Commander Rex had the senior authority and access needed to activate the classified protocol."
    )
];

/* =========================
   PLAYER PROGRESS
========================= */

function loadProgress() {
    const defaultProgress = {
        points: 0,
        reputation: 0,
        completedCases: [],
        unlockedCases: [1],
        bestScores: {},
        completedInvestigations: []
    };

    try {
        const saved = JSON.parse(
            localStorage.getItem(CONFIG.STORAGE_KEY)
        );

        if (!saved || typeof saved !== "object") {
            return defaultProgress;
        }

        return {
            ...defaultProgress,
            ...saved,
            completedCases: Array.isArray(saved.completedCases)
                ? saved.completedCases
                : [],
            unlockedCases: Array.isArray(saved.unlockedCases)
                ? saved.unlockedCases
                : [1],
            bestScores: saved.bestScores || {},
            completedInvestigations: saved.completedInvestigations || []
        };
    } catch (error) {
        console.warn("Could not load saved progress:", error);
        return defaultProgress;
    }
}

let playerProgress = loadProgress();

function saveProgress() {
    try {
        localStorage.setItem(
            CONFIG.STORAGE_KEY,
            JSON.stringify(playerProgress)
        );
    } catch (error) {
        console.warn("Could not save progress:", error);
    }

    updateHUD();
}

function resetProgress() {
    playerProgress = {
        points: 0,
        reputation: 0,
        completedCases: [],
        unlockedCases: [1],
        bestScores: {},
        completedInvestigations: []
    };

    saveProgress();
}

/* =========================
   GAME STATE
========================= */

const gameState = {
    currentScreen: "homeScreen",

    currentCase: null,
    difficulty: "medium",

    currentSuspect: 0,
    currentQuestion: 0,

    selectedSuspect: null,

    selectedWords: [],
    availableWords: [],

    score: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    hintsUsed: 0,

    lives: CONFIG.STARTING_LIVES,

    timeRemaining: 0,
    timerInterval: null,
    timeoutHandle: null,

    puzzleCompleted: false,
    interviewCompleted: false,
    accusationCompleted: false,

    caseStarted: false,
    caseCompleted: false,

    answers: [],
    suspectResults: {},

    answeredCurrentQuestion: false,
    selectedWordIds: []
};

/* =========================
   HUD
========================= */

function updateHUD() {
    setText("headerPoints", playerProgress.points);
    setText("playerPoints", playerProgress.points);
    setText("playerReputation", playerProgress.reputation);

    setText(
        "completedCases",
        playerProgress.completedCases.length
    );

    setText("totalCases", CONFIG.TOTAL_CASES);

    const hearts = Array.from(
        { length: CONFIG.STARTING_LIVES },
        (_, index) => index < gameState.lives ? "♥" : "♡"
    ).join(" ");

    setText("headerLives", hearts);
    setText("puzzleLives", hearts);
    setText("interviewLives", hearts);
    setText("finalLives", hearts);
}

/* =========================
   TIMER
========================= */

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }

    if (gameState.timeoutHandle) {
        clearTimeout(gameState.timeoutHandle);
        gameState.timeoutHandle = null;
    }
}

function startTimer(stage) {
    stopTimer();

    const duration = CONFIG.TIMER[gameState.difficulty] || 30;
    gameState.timeRemaining = duration;

    updateTimerDisplay(stage, duration);

    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;

        updateTimerDisplay(stage, duration);

        if (gameState.timeRemaining <= 0) {
            stopTimer();
            handleTimeout(stage);
        }
    }, 1000);
}

function updateTimerDisplay(stage, duration) {
    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = gameState.timeRemaining % 60;

    const formatted =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    if (stage === "puzzle") {
        setText("puzzleTimer", `TIME: ${formatted}`);

        const bar = $("puzzleTimerBar");
        if (bar) {
            bar.style.width =
                `${Math.max(0, gameState.timeRemaining / duration * 100)}%`;
        }
    }

    if (stage === "interview") {
        setText("interviewTimer", `TIME: ${formatted}`);

        const bar = $("interviewTimerBar");
        if (bar) {
            bar.style.width =
                `${Math.max(0, gameState.timeRemaining / duration * 100)}%`;
        }
    }
}

function handleTimeout(stage) {
    if (!gameState.caseStarted || gameState.caseCompleted) return;

    gameState.lives--;
    gameState.incorrectAnswers++;

    updateHUD();

    if (gameState.lives <= 0) {
        failCase("You ran out of lives.");
        return;
    }

    if (stage === "puzzle") {
        setText("puzzleFeedback", "Time expired! Try the puzzle again.");
        const feedback = $("puzzleFeedback");
        if (feedback) feedback.className = "feedback incorrect";

        gameState.timeoutHandle = setTimeout(() => {
            if (gameState.currentScreen === "puzzleScreen") {
                startTimer("puzzle");
            }
        }, 1200);
    } else {
        setText("interviewFeedback", "Time expired! You lost one life.");
        const feedback = $("interviewFeedback");
        if (feedback) feedback.className = "feedback incorrect";

        gameState.timeoutHandle = setTimeout(() => {
            if (gameState.currentScreen === "interviewScreen") {
                advanceAfterQuestion();
            }
        }, 1200);
    }
}

/* =========================
   CASE ARCHIVE
========================= */

function renderCaseArchive() {
    const container = $("caseGrid");
    if (!container) return;

    container.innerHTML = "";

    caseData.forEach(caseInfo => {
        const unlocked =
            playerProgress.unlockedCases.includes(caseInfo.id);

        const completed =
            playerProgress.completedCases.includes(caseInfo.id);

        const card = document.createElement("article");
        card.className = `case-card ${unlocked ? "" : "locked"}`;

        card.innerHTML = `
            <span class="case-icon">${escapeHTML(caseInfo.icon)}</span>

            <h3>${escapeHTML(caseInfo.title)}</h3>

            <p>${escapeHTML(caseInfo.location)}</p>

            <p>${escapeHTML(caseInfo.classification)}</p>

            <p>
                ${completed ? "✓ COMPLETED" : unlocked ? "AVAILABLE" : "LOCKED"}
            </p>

            <button
                class="btn ${unlocked ? "primary" : "secondary"}"
                ${unlocked ? "" : "disabled"}
                data-case-id="${caseInfo.id}">
                ${completed ? "REPLAY CASE" : unlocked ? "OPEN CASE" : "LOCKED"}
            </button>
        `;

        const button = card.querySelector("button");

        if (unlocked) {
            button.addEventListener("click", () => startCase(caseInfo.id));
        }

        container.appendChild(card);
    });
}

/* =========================
   START CASE
========================= */

function startCase(caseId) {
    const caseInfo = caseData.find(item => item.id === caseId);

    if (!caseInfo) return;

    if (!playerProgress.unlockedCases.includes(caseId)) {
        return;
    }

    stopTimer();

    gameState.currentCase = caseInfo;

    gameState.currentSuspect = 0;
    gameState.currentQuestion = 0;
    gameState.selectedSuspect = null;

    gameState.score = 0;
    gameState.correctAnswers = 0;
    gameState.incorrectAnswers = 0;
    gameState.hintsUsed = 0;

    gameState.lives = CONFIG.STARTING_LIVES;

    gameState.puzzleCompleted = false;
    gameState.interviewCompleted = false;
    gameState.accusationCompleted = false;

    gameState.caseStarted = true;
    gameState.caseCompleted = false;

    gameState.answers = [];
    gameState.suspectResults = {};

    gameState.answeredCurrentQuestion = false;

    updateHUD();

    setText("briefingTitle", caseInfo.title);
    setText("briefingIcon", caseInfo.icon);
    setText("briefingSubtitle", caseInfo.classification);
    setText("briefingClassification", caseInfo.classification);
    setText("briefingLocation", caseInfo.location);
    setText("briefingCaseNumber", `TD-${String(caseInfo.id).padStart(3, "0")}`);
    setText("briefingStory", caseInfo.story);

    const facts = $("briefingFacts");

    if (facts) {
        facts.innerHTML = caseInfo.evidence.map((item, index) => `
            <div>
                <strong>CLUE ${index + 1}:</strong>
                ${escapeHTML(item)}
            </div>
        `).join("");
    }

    const evidenceList = $("evidenceList");
    if (evidenceList) evidenceList.innerHTML = "";

    showScreen("briefingScreen");
}

function beginPuzzle() {
    if (!gameState.currentCase) return;

    gameState.selectedWords = [];
    gameState.selectedWordIds = [];
    gameState.puzzleCompleted = false;

    const sentence = gameState.currentCase.puzzle;

    gameState.availableWords = sentence
        .replace(/[.!?]/g, "")
        .split(/\s+/)
        .map((word, index) => ({
            id: index,
            text: word
        }));

    gameState.availableWords.sort(() => Math.random() - 0.5);

    renderPuzzle();
    showScreen("puzzleScreen");
    startTimer("puzzle");
}

/* =========================
   SENTENCE PUZZLE
========================= */

function renderPuzzle() {
    const caseInfo = gameState.currentCase;

    setText(
        "puzzlePrompt",
        `Case evidence: ${caseInfo.evidence[0]} Reconstruct the statement.`
    );

    setText("puzzleProgress", "EVIDENCE PUZZLE");

    const answerArea = $("answerArea");
    const wordTiles = $("wordTiles");

    if (!answerArea || !wordTiles) return;

    answerArea.innerHTML = "";
    wordTiles.innerHTML = "";

    gameState.selectedWords.forEach((word, index) => {
        const button = document.createElement("button");
        button.className = "word-tile selected";
        button.textContent = word.text;

        button.addEventListener("click", () => {
            removeSelectedWord(index);
        });

        answerArea.appendChild(button);
    });

    gameState.availableWords.forEach(word => {
        if (gameState.selectedWordIds.includes(word.id)) return;

        const button = document.createElement("button");
        button.className = "word-tile";
        button.textContent = word.text;

        button.addEventListener("click", () => {
            selectWord(word.id);
        });

        wordTiles.appendChild(button);
    });
}

function selectWord(wordId) {
    if (gameState.puzzleCompleted) return;

    const word = gameState.availableWords.find(item => item.id === wordId);

    if (!word || gameState.selectedWordIds.includes(wordId)) return;

    gameState.selectedWords.push(word);
    gameState.selectedWordIds.push(wordId);

    renderPuzzle();
}

function removeSelectedWord(index) {
    if (gameState.puzzleCompleted) return;

    gameState.selectedWords.splice(index, 1);
    gameState.selectedWordIds.splice(index, 1);

    renderPuzzle();
}

function undoWord() {
    if (gameState.selectedWords.length === 0) return;

    gameState.selectedWords.pop();
    gameState.selectedWordIds.pop();

    renderPuzzle();
}

function clearWords() {
    if (gameState.puzzleCompleted) return;

    gameState.selectedWords = [];
    gameState.selectedWordIds = [];

    renderPuzzle();
}

function checkSentence() {
    if (gameState.puzzleCompleted) return;

    const submitted = gameState.selectedWords
        .map(word => word.text)
        .join(" ")
        .toLowerCase();

    const correct = gameState.currentCase.puzzle
        .replace(/[.!?]/g, "")
        .toLowerCase();

    if (submitted === correct) {
        gameState.puzzleCompleted = true;

        stopTimer();

        gameState.score += CONFIG.POINTS.puzzle;
        gameState.correctAnswers++;

        setText("puzzleFeedback", "Correct! Evidence statement reconstructed.");
        $("puzzleFeedback").className = "feedback correct";

        updateHUD();

        gameState.timeoutHandle = setTimeout(() => {
            if (gameState.caseStarted && !gameState.caseCompleted) {
                beginInvestigation();
            }
        }, 1300);
    } else {
        gameState.incorrectAnswers++;
        gameState.lives--;

        gameState.score = Math.max(
            0,
            gameState.score + CONFIG.POINTS.incorrect
        );

        updateHUD();

        setText("puzzleFeedback", "Incorrect arrangement. Check the word order.");
        $("puzzleFeedback").className = "feedback incorrect";

        if (gameState.lives <= 0) {
            stopTimer();
            failCase("You lost all your lives during evidence analysis.");
        }
    }
}

/* =========================
   INTERVIEW STAGE
========================= */

function beginInvestigation() {
    stopTimer();

    gameState.currentSuspect = 0;
    gameState.currentQuestion = 0;
    gameState.interviewCompleted = false;
    gameState.suspectResults = {};

    renderSuspectList();
    openSuspect(0);
}

function renderSuspectList() {
    const container = $("suspectChoices");
    if (!container || !gameState.currentCase) return;

    container.innerHTML = "";

    gameState.currentCase.suspects.forEach((suspect, index) => {
        const button = document.createElement("button");
        button.className = "suspect-choice";
        button.textContent = suspect.name;

        button.addEventListener("click", () => openSuspect(index));

        container.appendChild(button);
    });
}

function openSuspect(index) {
    if (!gameState.currentCase) return;

    stopTimer();

    gameState.currentSuspect = index;
    gameState.currentQuestion = 0;

    const suspect = gameState.currentCase.suspects[index];

    setText("suspectName", suspect.name);
    setText("suspectDescription", suspect.description);
    setText("suspectRole", suspect.role);
    setText("suspectAvatar", suspect.name.charAt(0).toUpperCase());

    const nextQuestionButton = $("nextQuestionButton");
    const nextSuspectButton = $("nextSuspectButton");
    const continueButton = $("continueAccusationButton");

    if (nextQuestionButton) nextQuestionButton.hidden = true;
    if (nextSuspectButton) nextSuspectButton.hidden = true;
    if (continueButton) continueButton.hidden = true;

    showScreen("interviewScreen");
    renderQuestion();
}

function renderQuestion() {
    const suspect = gameState.currentCase.suspects[
        gameState.currentSuspect
    ];

    const question = suspect.questions[gameState.currentQuestion];

    gameState.answeredCurrentQuestion = false;

    setText(
        "interviewProgress",
        `SUSPECT ${gameState.currentSuspect + 1} / ${CONFIG.SUSPECTS_PER_CASE}`
    );

    setText(
        "questionNumber",
        `QUESTION ${gameState.currentQuestion + 1} / ${CONFIG.QUESTIONS_PER_SUSPECT}`
    );

    setText("suspectStatement", question.statement);
    setText("interviewFeedback", "");

    const truthButton = $("truthButton");
    const lieButton = $("lieButton");

    if (truthButton) truthButton.disabled = false;
    if (lieButton) lieButton.disabled = false;

    if ($("nextQuestionButton")) $("nextQuestionButton").hidden = true;
    if ($("nextSuspectButton")) $("nextSuspectButton").hidden = true;
    if ($("continueAccusationButton")) $("continueAccusationButton").hidden = true;

    startTimer("interview");
}

function answerQuestion(answer) {
    if (gameState.answeredCurrentQuestion) return;

    gameState.answeredCurrentQuestion = true;
    stopTimer();

    const suspect = gameState.currentCase.suspects[
        gameState.currentSuspect
    ];

    const question = suspect.questions[gameState.currentQuestion];

    const correct = answer === question.answer;

    if (correct) {
        gameState.score += CONFIG.POINTS.correct;
        gameState.correctAnswers++;
    } else {
        gameState.score = Math.max(
            0,
            gameState.score + CONFIG.POINTS.incorrect
        );

        gameState.incorrectAnswers++;
        gameState.lives--;
    }

    gameState.answers.push({
        suspect: suspect.name,
        question: gameState.currentQuestion + 1,
        answer,
        correct
    });

    if (!gameState.suspectResults[suspect.name]) {
        gameState.suspectResults[suspect.name] = {
            correct: 0,
            incorrect: 0
        };
    }

    if (correct) {
        gameState.suspectResults[suspect.name].correct++;
    } else {
        gameState.suspectResults[suspect.name].incorrect++;
    }

    const feedback = $("interviewFeedback");

    if (feedback) {
        feedback.textContent = correct
            ? `Correct! ${question.explanation}`
            : `Incorrect. ${question.explanation}`;

        feedback.className = correct
            ? "feedback correct"
            : "feedback incorrect";
    }

    if ($("truthButton")) $("truthButton").disabled = true;
    if ($("lieButton")) $("lieButton").disabled = true;

    updateHUD();

    if (gameState.lives <= 0) {
        failCase("You lost all your lives during the interrogation.");
        return;
    }

    if ($("nextQuestionButton")) {
        $("nextQuestionButton").hidden = false;
    }
}

function advanceAfterQuestion() {
    if (!gameState.answeredCurrentQuestion) return;

    gameState.currentQuestion++;

    if (gameState.currentQuestion < CONFIG.QUESTIONS_PER_SUSPECT) {
        renderQuestion();
        return;
    }

    finishSuspectInterview();
}

function finishSuspectInterview() {
    stopTimer();

    if ($("truthButton")) $("truthButton").disabled = true;
    if ($("lieButton")) $("lieButton").disabled = true;
    if ($("nextQuestionButton")) $("nextQuestionButton").hidden = true;

    if (gameState.currentSuspect < CONFIG.SUSPECTS_PER_CASE - 1) {
        if ($("nextSuspectButton")) {
            $("nextSuspectButton").hidden = false;
        }
    } else {
        gameState.interviewCompleted = true;

        if ($("continueAccusationButton")) {
            $("continueAccusationButton").hidden = false;
        }
    }
}

function nextSuspect() {
    if (gameState.currentSuspect >= CONFIG.SUSPECTS_PER_CASE - 1) return;

    openSuspect(gameState.currentSuspect + 1);
}

/* =========================
   HINT SYSTEM
========================= */

function useHint() {
    if (gameState.answeredCurrentQuestion) return;

    const suspect = gameState.currentCase.suspects[
        gameState.currentSuspect
    ];

    const question = suspect.questions[gameState.currentQuestion];

    gameState.hintsUsed++;
    gameState.score = Math.max(
        0,
        gameState.score + CONFIG.POINTS.hint
    );

    updateHUD();

    const feedback = $("interviewFeedback");

    if (feedback) {
        feedback.textContent =
            `HINT: ${question.explanation}`;

        feedback.className = "feedback info";
    }
}

/* =========================
   ACCUSATION STAGE
========================= */

function openAccusation() {
    stopTimer();

    if (!gameState.interviewCompleted) return;

    gameState.selectedSuspect = null;

    const container = $("accusationChoices");
    if (!container) return;

    container.innerHTML = "";

    gameState.currentCase.suspects.forEach((suspect, index) => {
        const button = document.createElement("button");

        button.className = "accusation-choice";

        button.innerHTML = `
            <span class="case-icon">◈</span>
            <strong>${escapeHTML(suspect.name)}</strong>
            <p>${escapeHTML(suspect.role)}</p>
        `;

        button.addEventListener("click", () => {
            document.querySelectorAll(".accusation-choice")
                .forEach(choice => choice.classList.remove("selected"));

            button.classList.add("selected");
            gameState.selectedSuspect = index;

            if ($("accuseButton")) $("accuseButton").disabled = false;

            setText(
                "accusationFeedback",
                `${suspect.name} selected. Confirm your accusation.`
            );

            $("accusationFeedback").className = "feedback info";
        });

        container.appendChild(button);
    });

    if ($("accuseButton")) $("accuseButton").disabled = true;

    setText("accusationFeedback", "");
    showScreen("accusationScreen");
}

function submitAccusation() {
    if (gameState.selectedSuspect === null) return;
    if (gameState.accusationCompleted) return;

    gameState.accusationCompleted = true;

    const correct =
        gameState.selectedSuspect === gameState.currentCase.culpritIndex;

    if (correct) {
        gameState.score += CONFIG.POINTS.accusation;
        gameState.score += CONFIG.POINTS.completed;

        gameState.correctAnswers++;

        gameState.caseCompleted = true;
        gameState.caseStarted = false;

        playerProgress.points += gameState.score;
        playerProgress.reputation += 10;

        const caseId = gameState.currentCase.id;

        if (!playerProgress.completedCases.includes(caseId)) {
            playerProgress.completedCases.push(caseId);
        }

        playerProgress.bestScores[caseId] = Math.max(
            playerProgress.bestScores[caseId] || 0,
            gameState.score
        );

        if (!playerProgress.unlockedCases.includes(caseId + 1) &&
            caseId < CONFIG.TOTAL_CASES) {
            playerProgress.unlockedCases.push(caseId + 1);
        }

        playerProgress.completedInvestigations.push({
            caseId,
            score: gameState.score,
            date: new Date().toISOString()
        });

        saveProgress();
        showFinalReport(true);

    } else {
        gameState.incorrectAnswers++;
        gameState.caseCompleted = true;
        gameState.caseStarted = false;

        setText(
            "failedMessage",
            "Your accusation was incorrect. Review the evidence and try the case again."
        );

        saveProgress();
        showFinalReport(false);
    }
}

/* =========================
   FINAL REPORT
========================= */

function showFinalReport(won) {
    stopTimer();

    const caseInfo = gameState.currentCase;
    const culprit = caseInfo.suspects[caseInfo.culpritIndex];

    setText(
        "reportTitle",
        won ? "CASE SUCCESSFULLY SOLVED" : "INCORRECT ACCUSATION"
    );

    setText(
        "reportIcon",
        won ? "🏆" : "⚠️"
    );

    setText(
        "reportMessage",
        won
            ? `You identified ${culprit.name} as the culprit!`
            : `The actual culprit was ${culprit.name}.`
    );

    setText("finalPoints", gameState.score);
    setText("finalCorrect", gameState.correctAnswers);
    setText("finalMistakes", gameState.incorrectAnswers);
    setText("finalLives", gameState.lives);

    setText(
        "reportExplanation",
        `${caseInfo.explanation} ${culprit.name} was responsible for the incident.`
    );

    const nextButton = $("nextCaseButton");

    if (nextButton) {
        nextButton.hidden =
            !won || caseInfo.id >= CONFIG.TOTAL_CASES;
    }

    showScreen("reportScreen");
}

function failCase(message) {
    if (gameState.caseCompleted) return;

    stopTimer();

    gameState.caseStarted = false;
    gameState.caseCompleted = true;

    setText("failedMessage", message);

    showScreen("failedScreen");
}

/* =========================
   RETRY AND NEXT CASE
========================= */

function retryCase() {
    if (!gameState.currentCase) return;

    startCase(gameState.currentCase.id);
}

function nextCase() {
    if (!gameState.currentCase) return;

    const nextId = gameState.currentCase.id + 1;

    if (nextId > CONFIG.TOTAL_CASES) {
        showScreen("homeScreen");
        return;
    }

    if (playerProgress.unlockedCases.includes(nextId)) {
        startCase(nextId);
    } else {
        renderCaseArchive();
        showScreen("casesScreen");
    }
}

/* =========================
   NAVIGATION
========================= */

function goHome() {
    stopTimer();
    gameState.caseStarted = false;

    updateHUD();
    showScreen("homeScreen");
}

function goToCases() {
    stopTimer();
    renderCaseArchive();
    showScreen("casesScreen");
}

function leaveActivity() {
    stopTimer();
    goToCases();
}

/* =========================
   DIFFICULTY
========================= */

function setDifficulty(difficulty) {
    if (!CONFIG.TIMER[difficulty]) return;

    gameState.difficulty = difficulty;
}

/* =========================
   EVENT BINDING
========================= */

function bindButton(id, callback) {
    const button = $(id);

    if (button) {
        button.addEventListener("click", callback);
    }
}

function bindEvents() {
    bindButton("playButton", goToCases);

    bindButton("continueButton", () => {
        renderCaseArchive();
        showScreen("casesScreen");
    });

    bindButton("backHomeButton", goHome);

    bindButton("backCasesButton", goToCases);

    bindButton("enterPuzzleButton", beginPuzzle);

    bindButton("undoWordButton", undoWord);

    bindButton("clearWordsButton", clearWords);

    bindButton("checkSentenceButton", checkSentence);

    bindButton("truthButton", () => answerQuestion("truth"));

    bindButton("lieButton", () => answerQuestion("lie"));

    bindButton("nextQuestionButton", advanceAfterQuestion);

    bindButton("nextSuspectButton", nextSuspect);

    bindButton("continueAccusationButton", openAccusation);

    bindButton("accuseButton", submitAccusation);

    bindButton("retryButton", retryCase);

    bindButton("failedHomeButton", goHome);

    bindButton("nextCaseButton", nextCase);

    bindButton("reportHomeButton", goHome);
}

/* =========================
   CASE DATABASE VALIDATION
========================= */

function validateCases() {
    const errors = [];

    if (caseData.length !== CONFIG.TOTAL_CASES) {
        errors.push(
            `Expected ${CONFIG.TOTAL_CASES} cases but found ${caseData.length}.`
        );
    }

    caseData.forEach(caseInfo => {
        if (caseInfo.suspects.length !== CONFIG.SUSPECTS_PER_CASE) {
            errors.push(`${caseInfo.title}: incorrect suspect count.`);
        }

        if (
            !caseInfo.suspects[caseInfo.culpritIndex] ||
            caseInfo.culpritIndex < 0
        ) {
            errors.push(`${caseInfo.title}: invalid culprit index.`);
        }

        caseInfo.suspects.forEach(suspect => {
            if (suspect.questions.length !== CONFIG.QUESTIONS_PER_SUSPECT) {
                errors.push(`${caseInfo.title}: ${suspect.name} has an incorrect question count.`);
            }
        });
    });

    if (errors.length) {
        console.error("CASE DATABASE VALIDATION ERRORS:", errors);
        return false;
    }

    console.log(
        `Tiny Detective: ${caseData.length} cases loaded successfully.`
    );

    return true;
}

/* =========================
   INITIALISE GAME
========================= */

function initialiseGame() {
    validateCases();

    bindEvents();

    updateHUD();

    renderCaseArchive();

    showScreen("homeScreen");

    console.log("--------------------------------");
    console.log("TINY DETECTIVE INITIALISED");
    console.log("Cyberpunk Detective Noir Edition");
    console.log(`${caseData.length} cases available`);
    console.log("--------------------------------");
}

/* =========================
   START GAME
========================= */

document.addEventListener("DOMContentLoaded", initialiseGame);
