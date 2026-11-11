
const CASES = [
  {
    id: 1,
    title: "The Missing Necklace",
    difficulty: "Easy",
    seconds: 45,
    summary: "A valuable necklace disappears during a birthday party at Rosewood House.",
    story: "At 7:30 pm, the guests at Rosewood House gathered for a birthday celebration. At 8:00 pm, the host placed her grandmother's ruby necklace inside a small jewellery box in the upstairs bedroom. By 8:20 pm, the box was empty. The bedroom window was closed, and the only people who went upstairs during that time were Maya Rose, Oliver James and Sophie Lane. Nobody admits taking the necklace. Their stories sound reasonable at first, but some details do not fit together.",
    facts: [
      "The necklace was placed in the upstairs bedroom at 8:00 pm.",
      "The necklace was discovered missing at 8:20 pm.",
      "The bedroom window was closed.",
      "Maya, Oliver and Sophie all had access to the upstairs hallway."
    ],
    culprit: "maya",
    explanation: "Maya claimed she stayed in the kitchen, but details in her answers place her upstairs near the bedroom. She also knew the jewellery box was open before anyone announced that the necklace was missing.",
    suspects: [
      {
        id: "maya",
        name: "Maya Rose",
        role: "Birthday party guest",
        avatar: "👩🏻",
        questions: [
          {
            q: "Where were you between 8:00 and 8:20 pm?",
            a: "I was in the kitchen the entire time, helping prepare the birthday cake.",
            lie: true,
            why: "A guest saw Maya leave the kitchen shortly after 8:05 pm."
          },
          {
            q: "Did you go upstairs during the party?",
            a: "No. I never went upstairs after arriving.",
            lie: true,
            why: "A muddy shoeprint matching Maya's shoes was found in the upstairs hallway."
          },
          {
            q: "When did you last see the necklace?",
            a: "I saw it in the jewellery box before dinner, around 7:15 pm.",
            lie: false,
            why: "This matches the host's earlier account."
          },
          {
            q: "Did you know where the jewellery box was kept?",
            a: "I knew it was usually kept in the upstairs bedroom.",
            lie: false,
            why: "Maya had visited the house before."
          },
          {
            q: "Did you touch the jewellery box tonight?",
            a: "Absolutely not. I did not even enter that bedroom.",
            lie: true,
            why: "A piece of Maya's scarf fibre was caught on the jewellery box."
          }
        ]
      },
      {
        id: "oliver",
        name: "Oliver James",
        role: "The host's cousin",
        avatar: "🧑🏻",
        questions: [
          {
            q: "Where were you when the necklace disappeared?",
            a: "I was outside on the back patio making a phone call.",
            lie: false,
            why: "A phone record supports a call made from the patio."
          },
          {
            q: "Did you go upstairs at any point?",
            a: "Yes, around 7:50 pm. I went to get my jacket before the necklace was put away.",
            lie: false,
            why: "His visit was before the necklace was placed in the box."
          },
          {
            q: "Did you know the necklace was valuable?",
            a: "I knew it was an old family necklace, but I did not know its value.",
            lie: false,
            why: "This is consistent with what he told the other guests."
          },
          {
            q: "Did you see Maya during the evening?",
            a: "I saw her near the kitchen doorway just after 8:10 pm.",
            lie: false,
            why: "This places Maya near the kitchen, but does not prove she stayed there."
          },
          {
            q: "Did you open the bedroom jewellery box?",
            a: "No. I did not go near the bedroom after 7:50 pm.",
            lie: false,
            why: "No evidence contradicts this statement."
          }
        ]
      },
      {
        id: "sophie",
        name: "Sophie Lane",
        role: "The birthday host's friend",
        avatar: "👩🏽",
        questions: [
          {
            q: "When did you first notice the necklace was missing?",
            a: "At about 8:20 pm, when the host checked the jewellery box.",
            lie: false,
            why: "This matches the host's timeline."
          },
          {
            q: "Were you in the upstairs hallway?",
            a: "Yes, briefly. I went to the bathroom at around 8:12 pm.",
            lie: false,
            why: "Sophie openly confirms being upstairs."
          },
          {
            q: "Did you enter the bedroom?",
            a: "No. I used the bathroom at the end of the hallway.",
            lie: false,
            why: "The bathroom is separate from the bedroom."
          },
          {
            q: "Did Maya seem nervous?",
            a: "She seemed distracted and kept asking when the cake would be served.",
            lie: false,
            why: "This is an observation, not proof of theft."
          },
          {
            q: "Did you see anyone carrying the jewellery box?",
            a: "No, I did not see anyone carrying it.",
            lie: false,
            why: "No evidence contradicts this statement."
          }
        ]
      }
    ]
  },

  // These cases are listed now. Their full stories and suspects will be added later.
  { id: 2, title: "The Vanishing Trophy", difficulty: "Easy", seconds: 45, summary: "A school competition trophy disappears before the award ceremony." },
  { id: 3, title: "The Stolen Birthday Cake", difficulty: "Easy", seconds: 45, summary: "The centrepiece cake vanishes just before the guests arrive." },
  { id: 4, title: "The Secret Invitation", difficulty: "Easy", seconds: 45, summary: "An anonymous invitation causes trouble at a family celebration." },
  { id: 5, title: "The Mystery of Room 13", difficulty: "Medium", seconds: 30, summary: "A locked hotel room contains a mystery nobody can explain." },
  { id: 6, title: "The Missing Painting", difficulty: "Medium", seconds: 30, summary: "A painting disappears during a private gallery event." },
  { id: 7, title: "The Midnight Footsteps", difficulty: "Medium", seconds: 30, summary: "Someone walks through a house after everyone has gone to bed." },
  { id: 8, title: "The Fake Alibi", difficulty: "Medium", seconds: 30, summary: "Three people give accounts that cannot all be true." },
  { id: 9, title: "The Diamond Heist", difficulty: "Hard", seconds: 20, summary: "A carefully planned robbery leaves almost no obvious clues." },
  { id: 10, title: "The Detective's Final Case", difficulty: "Hard", seconds: 20, summary: "The biggest mystery challenges everything the detective has learned." }
];

const STORAGE_KEY = "tinyDetectiveProgress_v1";

const state = {
  unlocked: 1,
  completed: [],
  points: 0,
  selectedCase: 1,
  suspectIndex: 0,
  questionIndex: 0,
  completedSuspects: [],
  lives: 3,
  correct: 0,
  totalAnswered: 0,
  timeoutCount: 0,
  secondsLeft: 45,
  timerId: null,
  selectedAccusation: null
};

const $ = id => document.getElementById(id);

function currentCase() {
  return CASES.find(c => c.id === state.selectedCase);
}

function currentSuspect() {
  return currentCase().suspects[state.suspectIndex];
}

function totalQuestions() {
  return currentCase().suspects.length * 5;
}

// Save the player's points and unlocked cases in this browser.
function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    state.unlocked = Math.max(1, Math.min(10, saved.unlocked || 1));
    state.completed = Array.isArray(saved.completed) ? saved.completed : [];
    state.points = Number(saved.points) || 0;
  } catch (error) {
    console.warn("Could not load saved progress.", error);
  }

  updatePoints();
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    unlocked: state.unlocked,
    completed: state.completed,
    points: state.points
  }));

  updatePoints();
}

function updatePoints() {
  $("topPoints").textContent = state.points;
  $("gamePoints").textContent = state.points;
}

function showScreen(name) {
  stopTimer();

  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  $(name + "Screen").classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// Build the case archive and show which cases are unlocked.
function renderCases() {
  const grid = $("caseGrid");
  grid.innerHTML = "";

  CASES.forEach(c => {
    const unlocked = c.id <= state.unlocked;
    const completed = state.completed.includes(c.id);

    const card = document.createElement("article");
    card.className = "case-card " + (unlocked ? "available" : "locked");

    card.innerHTML = `
      <span class="case-number">CASE ${String(c.id).padStart(3, "0")}</span>
      <h3>${escapeHTML(c.title)}</h3>
      <p>${escapeHTML(c.summary)}</p>
      <div class="tag-row">
        <span class="tag">${c.difficulty.toUpperCase()}</span>
        ${completed ? '<span class="tag tag-soft">COMPLETED ✓</span>' : ""}
      </div>
      <button class="btn ${unlocked ? "btn-primary" : "btn-quiet"}"
        ${unlocked ? "" : "disabled"}>
        ${completed ? "Play again ↻" : unlocked ? "Open case →" : "🔒 Locked"}
      </button>
    `;

    if (unlocked) {
      card.querySelector("button").addEventListener("click", () => {
        openBriefing(c.id);
      });
    }

    grid.appendChild(card);
  });
}

// Show the story before starting the interrogation.
function openBriefing(caseId) {
  state.selectedCase = caseId;

  const c = currentCase();

  $("briefingTitle").textContent = c.title;
  $("briefingDifficulty").textContent = c.difficulty.toUpperCase();

  $("briefingStory").textContent = c.story ||
    "This case file is being prepared. Complete the first investigation to unlock it.";

  $("briefingFacts").innerHTML = (c.facts || [
    "A new mystery is waiting to be investigated."
  ]).map(f => `<li>${escapeHTML(f)}</li>`).join("");

  $("briefingTimerInfo").textContent =
    `You will have ${c.seconds} seconds per question.`;

  $("enterRoomButton").disabled = !c.suspects;
  $("enterRoomButton").textContent = c.suspects
    ? "Enter interrogation room →"
    : "Case content coming soon";

  showScreen("briefing");
}

// Reset all temporary information when starting or retrying a case.
function resetCaseState() {
  stopTimer();

  state.suspectIndex = 0;
  state.questionIndex = 0;
  state.completedSuspects = [];
  state.lives = 3;
  state.correct = 0;
  state.totalAnswered = 0;
  state.timeoutCount = 0;
  state.selectedAccusation = null;
}

function startInvestigation() {
  if (!currentCase().suspects) return;

  resetCaseState();

  $("interviewCaseTitle").textContent = currentCase().title;
  $("lives").textContent = state.lives;

  renderSuspectList();
  selectSuspect(0);
  showScreen("interview");
}

// Draw the suspect buttons.
function renderSuspectList() {
  const list = $("suspectList");
  list.innerHTML = "";

  currentCase().suspects.forEach((suspect, index) => {
    const done = state.completedSuspects.includes(suspect.id);

    const button = document.createElement("button");
    button.className = "suspect-choice" +
      (index === state.suspectIndex ? " selected" : "");

    button.disabled = done;

    button.innerHTML = `
      <span class="suspect-face">${suspect.avatar}</span>
      <span>
        <strong>${escapeHTML(suspect.name)}</strong>
        <small>${done ? "Interview complete" : escapeHTML(suspect.role)}</small>
      </span>
      ${done ? '<span class="done-mark">✓</span>' : ""}
    `;

    button.addEventListener("click", () => selectSuspect(index));
    list.appendChild(button);
  });
}

// Allow the player to choose which suspect to question first.
function selectSuspect(index) {
  if (state.completedSuspects.includes(currentCase().suspects[index].id)) {
    return;
  }

  stopTimer();
  state.suspectIndex = index;
  state.questionIndex = 0;

  renderSuspectList();
  renderQuestion();
}

// Show the current suspect's next question.
function renderQuestion() {
  const suspect = currentSuspect();
  const question = suspect.questions[state.questionIndex];

  if (!question) return;

  $("suspectAvatar").textContent = suspect.avatar;
  $("suspectName").textContent = suspect.name;
  $("suspectRole").textContent = suspect.role;
  $("suspectStatus").textContent = "UNDER QUESTIONING";

  $("questionNumber").textContent =
    `QUESTION ${state.questionIndex + 1} OF 5`;

  $("questionText").textContent = question.q;
  $("answerText").textContent = question.a;

  $("questionFeedback").textContent = "";
  $("questionFeedback").className = "question-feedback";

  document.querySelectorAll(".decision-btn").forEach(button => {
    button.disabled = false;
  });

  const completedCount =
    state.completedSuspects.length * 5 + state.questionIndex;

  $("questionProgress").textContent =
    `Question ${completedCount + 1} of ${totalQuestions()}`;

  const percentage = Math.round(
    completedCount / totalQuestions() * 100
  );

  $("caseProgressText").textContent = `${percentage}% complete`;
  $("caseProgressBar").style.width = percentage + "%";

  $("attemptText").textContent = `Mistakes allowed: ${state.lives}`;

  $("caseNotes").textContent =
    `${state.totalAnswered} statements reviewed. ${state.correct} correctly identified.`;

  startTimer();
}

// Start a fresh timer for every question.
function startTimer() {
  stopTimer();

  state.secondsLeft = currentCase().seconds;
  updateTimerDisplay();

  state.timerId = setInterval(() => {
    state.secondsLeft--;
    updateTimerDisplay();

    if (state.secondsLeft <= 0) {
      handleTimeout();
    }
  }, 1000);
}

function stopTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
  }

  state.timerId = null;
}

// Change the timer colour as time runs out.
function updateTimerDisplay() {
  const total = currentCase().seconds;

  $("timerText").textContent =
    `00:${String(Math.max(0, state.secondsLeft)).padStart(2, "0")}`;

  $("timerBar").style.width =
    `${Math.max(0, state.secondsLeft / total * 100)}%`;

  const panel = document.querySelector(".timer-panel");

  panel.classList.toggle(
    "warning",
    state.secondsLeft <= 10 && state.secondsLeft > 5
  );

  panel.classList.toggle("danger", state.secondsLeft <= 5);
}

// A timeout costs points. Every third timeout also costs a life.
function handleTimeout() {
  stopTimer();

  state.timeoutCount++;

  const penalty = state.timeoutCount === 1 ? 10 : 20;
  state.points = Math.max(0, state.points - penalty);

  if (state.timeoutCount >= 3) {
    state.lives--;
    state.timeoutCount = 0;
  }

  state.totalAnswered++;

  saveProgress();

  $("lives").textContent = state.lives;

  if (state.lives <= 0) {
    showScreen("failed");
    return;
  }

  $("questionFeedback").textContent =
    `⏰ Time is up! ${penalty} points deducted.`;

  $("questionFeedback").className = "question-feedback bad";

  document.querySelectorAll(".decision-btn").forEach(button => {
    button.disabled = true;
  });

  setTimeout(advanceQuestion, 1100);
}

// Check whether the player correctly spotted a lie.
function submitDecision(decision) {
  if (!state.timerId) return;

  stopTimer();

  const question = currentSuspect().questions[state.questionIndex];
  const correctDecision = question.lie ? "lie" : "truth";
  const isCorrect = decision === correctDecision;

  state.totalAnswered++;

  if (isCorrect) {
    state.correct++;
    state.points += 15;

    $("questionFeedback").textContent =
      "✓ Good observation! Your judgement matches the evidence.";

    $("questionFeedback").className = "question-feedback good";
  } else {
    state.points = Math.max(0, state.points - 5);
    state.lives--;

    $("questionFeedback").textContent =
      `✗ Not quite. ${question.why}`;

    $("questionFeedback").className = "question-feedback bad";
  }

  saveProgress();

  $("gamePoints").textContent = state.points;
  $("lives").textContent = state.lives;
  $("attemptText").textContent = `Mistakes allowed: ${state.lives}`;

  document.querySelectorAll(".decision-btn").forEach(button => {
    button.disabled = true;
  });

  if (state.lives <= 0) {
    setTimeout(() => showScreen("failed"), 1700);
  } else {
    setTimeout(advanceQuestion, 1700);
  }
}

// Move through the five questions and then to the next suspect.
function advanceQuestion() {
  if (state.lives <= 0) {
    showScreen("failed");
    return;
  }

  state.questionIndex++;

  if (state.questionIndex >= 5) {
    const finishedId = currentSuspect().id;

    if (!state.completedSuspects.includes(finishedId)) {
      state.completedSuspects.push(finishedId);
    }

    if (state.completedSuspects.length === 3) {
      stopTimer();

      $("caseProgressBar").style.width = "100%";
      $("caseProgressText").textContent = "100% complete";

      showAccusation();
      return;
    }

    const nextIndex = currentCase().suspects.findIndex(suspect =>
      !state.completedSuspects.includes(suspect.id)
    );

    state.suspectIndex = nextIndex;
    state.questionIndex = 0;

    renderSuspectList();
  }

  renderQuestion();
}

// Present all three suspects for the final accusation.
function showAccusation() {
  stopTimer();

  const wrap = $("accusationSuspects");
  wrap.innerHTML = "";

  state.selectedAccusation = null;
  $("submitAccusation").disabled = true;

  currentCase().suspects.forEach(suspect => {
    const card = document.createElement("article");
    card.className = "accuse-card";

    card.innerHTML = `
      <div class="accuse-avatar">${suspect.avatar}</div>
      <h3>${escapeHTML(suspect.name)}</h3>
      <p>${escapeHTML(suspect.role)}</p>
      <button class="btn btn-quiet">Accuse this person</button>
    `;

    card.querySelector("button").addEventListener("click", () => {
      state.selectedAccusation = suspect.id;

      document.querySelectorAll(".accuse-card").forEach(item => {
        item.classList.remove("selected");
      });

      card.classList.add("selected");
      $("submitAccusation").disabled = false;
    });

    wrap.appendChild(card);
  });

  showScreen("accusation");
}

// Check the accusation and unlock the next case if correct.
function submitAccusation() {
  if (!state.selectedAccusation) return;

  const c = currentCase();
  const solved = state.selectedAccusation === c.culprit;

  if (solved) {
    state.points += 100;

    if (!state.completed.includes(c.id)) {
      state.completed.push(c.id);
    }

    state.unlocked = Math.max(
      state.unlocked,
      Math.min(10, c.id + 1)
    );
  } else {
    state.points = Math.max(0, state.points - 25);
  }

  saveProgress();

  $("reportIcon").textContent = solved ? "🏆" : "🕵️";
  $("reportTitle").textContent =
    solved ? "Case solved!" : "The mystery remains unsolved";

  $("reportMessage").textContent = solved
    ? "Excellent detective work. You identified the culprit and connected the evidence."
    : "Your accusation was not correct. Review the explanation and try the case again.";

  $("finalScore").textContent = state.points;
  $("finalCorrect").textContent =
    `${state.correct}/${state.totalAnswered}`;
  $("finalLives").textContent = state.lives;

  const culprit = c.suspects.find(suspect => suspect.id === c.culprit);

  $("culpritReveal").textContent = culprit.name;
  $("culpritExplanation").textContent = c.explanation;

  $("nextCaseButton").style.display =
    solved && c.id < 10 ? "inline-block" : "none";

  showScreen("report");
}

function retryCase() {
  startInvestigation();
}

function nextCase() {
  const nextId = Math.min(10, state.selectedCase + 1);

  if (nextId <= state.unlocked) {
    openBriefing(nextId);
  } else {
    renderCases();
    showScreen("cases");
  }
}

// Connect all buttons.
$("startButton").addEventListener("click", () => {
  renderCases();
  showScreen("cases");
});

$("homeLink").addEventListener("click", event => {
  event.preventDefault();
  showScreen("home");
});

document.querySelectorAll(".back-home").forEach(button => {
  button.addEventListener("click", () => showScreen("home"));
});

$("briefingBack").addEventListener("click", () => {
  renderCases();
  showScreen("cases");
});

$("enterRoomButton").addEventListener("click", startInvestigation);

document.querySelectorAll(".decision-btn").forEach(button => {
  button.addEventListener("click", () => {
    submitDecision(button.dataset.answer);
  });
});

$("submitAccusation").addEventListener("click", submitAccusation);

$("reportCasesButton").addEventListener("click", () => {
  renderCases();
  showScreen("cases");
});

$("nextCaseButton").addEventListener("click", nextCase);

$("retryButton").addEventListener("click", retryCase);

$("failedCasesButton").addEventListener("click", () => {
  renderCases();
  showScreen("cases");
});

// Start the game.
loadProgress();
renderCases();
showScreen("home");
