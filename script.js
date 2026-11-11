
"use strict";

/* =========================================================
   TINY DETECTIVE
   Cyberpunk Detective Noir Edition
   Complete investigation engine

   Gameplay:
   - 10 sequential cases
   - Easy / Medium / Hard
   - 3 suspects per case
   - 5 interrogation questions per suspect
   - Story-based evidence investigation
   - Truth / lie detection
   - Final accusations
   - Investigation reports
   - Saved completed cases and points
   - Safe activity navigation
========================================================= */

/* ===================== CONFIGURATION ===================== */

const CONFIG = {
    TOTAL_CASES: 10,
    QUESTIONS_PER_SUSPECT: 5,
    SUSPECTS_PER_CASE: 3,
    STORAGE_KEY: "tinyDetectiveProgress_v2",
    TIMER_BY_DIFFICULTY: {
        Easy: 45,
        Medium: 30,
        Hard: 20
    },
    POINTS: {
        correct: 100,
        incorrect: -20,
        hint: -10,
        accusation: 200,
        completed: 150
    }
};

/* ===================== GAME STATE ===================== */

let gameState = {
    currentScreen: "homeScreen",
    currentCase: 0,
    difficulty: "Medium",

    currentSuspect: 0,
    currentQuestion: 0,

    selectedSuspect: null,
    selectedEvidence: [],

    score: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    hintsUsed: 0,

    timeRemaining: 30,
    timerInterval: null,

    answers: {},
    suspectResults: {},

    caseStarted: false,
    caseCompleted: false
};

/* ===================== SAVED PROGRESS ===================== */

function createDefaultProgress() {
    return {
        points: 0,
        reputation: 0,
        completedCases: [],
        unlockedCases: [0],
        bestScores: {},
        completedInvestigations: 0
    };
}

function loadProgress() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);

        if (!saved) {
            return createDefaultProgress();
        }

        const parsed = JSON.parse(saved);

        return {
            ...createDefaultProgress(),
            ...parsed
        };
    } catch (error) {
        console.error("Could not load saved progress:", error);
        return createDefaultProgress();
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
        console.error("Could not save progress:", error);
    }
}

/* ===================== CASE DATABASE =====================

   Each case has:
   - A story
   - Evidence
   - Three suspects
   - Exactly five questions per suspect
   - One correct culprit

   Question truth values are used by the lie detector.
========================================================= */

const caseData = [

{
    id: 1,
    title: "The Missing Necklace",
    classification: "CONFIDENTIAL",
    icon: "💎",
    location: "The Blackwood Mansion",

    story: `A valuable diamond necklace disappeared during a private
    dinner at Blackwood Mansion.

    Three guests had access to the upstairs bedroom where the necklace
    was kept.

    The owner insists the necklace was locked away before dinner.

    However, a security camera stopped recording for exactly four
    minutes. Someone knew when that would happen.

    Your task is to discover who took the necklace and how they did it.`,

    evidence: [
        {
            name: "Broken Window",
            description: "The bedroom window was broken from the inside.",
            clue: "The breakage may have been staged."
        },
        {
            name: "Security Log",
            description: "The camera was manually disabled at 20:14.",
            clue: "Someone had access to the security controls."
        },
        {
            name: "Blue Fabric",
            description: "A piece of blue fabric was found near the safe.",
            clue: "It matches an item of clothing worn by one guest."
        },
        {
            name: "Dinner Receipt",
            description: "The kitchen recorded a delivery at 20:12.",
            clue: "The delivery provides an opportunity to move unnoticed."
        }
    ],

    culprit: 1,

    suspects: [
        {
            name: "Maya",
            role: "The Personal Assistant",
            icon: "👩🏻",
            description: "She had access to the mansion's daily schedule.",

            questions: [
                {
                    question: "Where were you when the camera stopped recording?",
                    statement: "I was in the dining room.",
                    truth: true,
                    explanation: "The dining room guest list confirms her presence."
                },
                {
                    question: "Did you have access to the bedroom?",
                    statement: "I never had access to that bedroom.",
                    truth: false,
                    explanation: "The household access register lists her key."
                },
                {
                    question: "Did you notice anything unusual?",
                    statement: "I heard a loud noise upstairs.",
                    truth: true,
                    explanation: "Another guest also reported hearing the noise."
                },
                {
                    question: "Did you touch the security system?",
                    statement: "I do not know how the security system works.",
                    truth: false,
                    explanation: "Training records show she helped manage it."
                },
                {
                    question: "Did you see the necklace that evening?",
                    statement: "I saw it before dinner.",
                    truth: true,
                    explanation: "Her statement matches the owner's account."
                }
            ]
        },

        {
            name: "Daniel",
            role: "The Family Accountant",
            icon: "🕵🏻",
            description: "He had financial problems and access to the safe.",

            questions: [
                {
                    question: "Where were you at 20:14?",
                    statement: "I was outside making a phone call.",
                    truth: true,
                    explanation: "A phone record confirms a call outside."
                },
                {
                    question: "Did you know about the camera system?",
                    statement: "I had never seen the security room.",
                    truth: false,
                    explanation: "His access card was recorded there."
                },
                {
                    question: "Did you enter the bedroom?",
                    statement: "I entered earlier to deliver documents.",
                    truth: true,
                    explanation: "The household staff confirm this."
                },
                {
                    question: "Were you having financial difficulties?",
                    statement: "My finances were completely fine.",
                    truth: false,
                    explanation: "Recent bank records show significant debt."
                },
                {
                    question: "Did you take the necklace?",
                    statement: "I did not take it.",
                    truth: true,
                    explanation: "The available evidence does not connect him to the theft."
                }
            ]
        },

        {
            name: "Victor",
            role: "The Private Security Guard",
            icon: "👨🏻",
            description: "He was responsible for the security cameras.",

            questions: [
                {
                    question: "Were you responsible for the cameras?",
                    statement: "I managed the security equipment.",
                    truth: true,
                    explanation: "His employment records confirm this."
                },
                {
                    question: "Did anyone ask you to disable a camera?",
                    statement: "Nobody asked me to do that.",
                    truth: false,
                    explanation: "A message requesting the shutdown was found."
                },
                {
                    question: "Did you enter the bedroom?",
                    statement: "I never went near the bedroom.",
                    truth: false,
                    explanation: "A fingerprint was recovered near the safe."
                },
                {
                    question: "Were you wearing a blue jacket?",
                    statement: "I wore my usual blue security jacket.",
                    truth: true,
                    explanation: "The fabric matches his uniform."
                },
                {
                    question: "Did you know the necklace was valuable?",
                    statement: "I knew it was worth a lot of money.",
                    truth: true,
                    explanation: "He had been briefed about the valuable items."
                }
            ]
        }
    ]
},

{
    id: 2,
    title: "The Midnight Museum Theft",
    classification: "RESTRICTED",
    icon: "🏛️",
    location: "Neon City Museum",
    story: `An ancient golden artefact disappeared from a museum display
    shortly before midnight.

    The building was locked, but three people remained inside.

    A motion sensor was triggered near the east gallery.

    The display case was not broken. Whoever removed the artefact
    used a legitimate access method.`,
    evidence: [
        { name: "Motion Sensor", description: "Movement detected in the east gallery.", clue: "Someone visited the display." },
        { name: "Access Card", description: "A staff card opened the gallery.", clue: "The theft required authorised access." },
        { name: "Dust Pattern", description: "A clean outline remained in the display.", clue: "The artefact was removed carefully." },
        { name: "Taxi Record", description: "A taxi arrived at 23:48.", clue: "Someone may have planned a quick escape." }
    ],
    culprit: 0,
    suspects: [
        {
            name: "Elena", role: "Museum Curator", icon: "👩🏽",
            description: "She supervised the museum collection.",
            questions: [
                { question: "Did you close the east gallery?", statement: "I checked it before closing.", truth: true, explanation: "The closing checklist confirms this." },
                { question: "Did you use your access card after closing?", statement: "I did not use it again.", truth: false, explanation: "The access log records another entry." },
                { question: "Did you know the artefact's value?", statement: "I knew its estimated value.", truth: true, explanation: "She prepared its insurance paperwork." },
                { question: "Did you leave through the front entrance?", statement: "I left through the staff exit.", truth: true, explanation: "The exit log confirms this." },
                { question: "Did you remove the artefact?", statement: "I never touched the display.", truth: false, explanation: "Her fingerprints were found on the inner case." }
            ]
        },
        {
            name: "Marcus", role: "Night Guard", icon: "👨🏾",
            description: "He patrolled the museum after hours.",
            questions: [
                { question: "Were you on duty?", statement: "I worked the entire night.", truth: true, explanation: "His shift record confirms this." },
                { question: "Did you notice the sensor?", statement: "I saw the warning light.", truth: true, explanation: "The control room log supports this." },
                { question: "Did you open the display?", statement: "I never opened it.", truth: true, explanation: "No guard access was recorded." },
                { question: "Did you see Elena?", statement: "I saw her near the east gallery.", truth: true, explanation: "His patrol log confirms the encounter." },
                { question: "Did you disable the alarm?", statement: "I had no reason to disable it.", truth: true, explanation: "The alarm was never disabled." }
            ]
        },
        {
            name: "Theo", role: "Visiting Researcher", icon: "🧑🏻",
            description: "He was studying the museum's ancient collection.",
            questions: [
                { question: "Were you studying the artefact?", statement: "I examined it earlier.", truth: true, explanation: "His research appointment confirms this." },
                { question: "Did you have a staff access card?", statement: "I borrowed one for research.", truth: true, explanation: "A temporary card was issued." },
                { question: "Did you leave at midnight?", statement: "I left before midnight.", truth: false, explanation: "The exit camera shows him leaving later." },
                { question: "Did you order a taxi?", statement: "I did not order a taxi.", truth: false, explanation: "A booking was made under his number." },
                { question: "Did you steal the artefact?", statement: "I did not steal it.", truth: true, explanation: "No evidence connects him to its removal." }
            ]
        }
    ]
},

{
    id: 3,
    title: "The Vanishing Scientist",
    classification: "TOP SECRET",
    icon: "🧪",
    location: "Nova Research Laboratory",
    story: `Dr. Adrian Vale disappeared from a locked laboratory.

    His research notebook was missing, but his personal belongings
    remained untouched.

    Three colleagues had been working late.

    The laboratory door recorded no forced entry, and the final
    computer login happened shortly before the disappearance.`,
    evidence: [
        { name: "Computer Login", description: "A late login was recorded.", clue: "Someone used the laboratory computer." },
        { name: "Coffee Cup", description: "Two different fingerprints were found.", clue: "Another person visited the laboratory." },
        { name: "Research Notes", description: "A page about experimental energy was missing.", clue: "The notebook was deliberately targeted." },
        { name: "Door Record", description: "The laboratory was opened with a staff code.", clue: "An authorised person entered." }
    ],
    culprit: 2,
    suspects: [
        {
            name: "Nina", role: "Laboratory Assistant", icon: "👩🏼",
            description: "She prepared equipment for Dr. Vale.",
            questions: [
                { question: "Did you work late?", statement: "I left before the evening shift ended.", truth: true, explanation: "Her exit record supports this." },
                { question: "Did you prepare coffee?", statement: "I prepared coffee earlier.", truth: true, explanation: "The kitchen log confirms this." },
                { question: "Did you use Dr. Vale's computer?", statement: "I never used his computer.", truth: true, explanation: "No login matches her account." },
                { question: "Did you know about the missing notes?", statement: "I noticed a page was missing.", truth: true, explanation: "She reported it to management." },
                { question: "Did you help him disappear?", statement: "I had nothing to do with it.", truth: true, explanation: "No evidence links her to the disappearance." }
            ]
        },
        {
            name: "Oliver", role: "Security Technician", icon: "👨🏼",
            description: "He maintained the laboratory access system.",
            questions: [
                { question: "Did you repair the door system?", statement: "I worked on it that afternoon.", truth: true, explanation: "A maintenance report exists." },
                { question: "Did you share your access code?", statement: "I never shared my code.", truth: true, explanation: "No unusual code usage was detected." },
                { question: "Did you see Dr. Vale?", statement: "I spoke to him in the morning.", truth: true, explanation: "Their meeting was documented." },
                { question: "Did you enter the laboratory late?", statement: "I did not enter after my shift.", truth: true, explanation: "The access log supports this." },
                { question: "Did you take the notebook?", statement: "I did not take it.", truth: true, explanation: "No physical evidence links him to it." }
            ]
        },
        {
            name: "Dr. Cross", role: "Senior Researcher", icon: "🧑🏽",
            description: "He competed with Dr. Vale for a major research grant.",
            questions: [
                { question: "Were you working on the same project?", statement: "We worked on related experiments.", truth: true, explanation: "The project records confirm this." },
                { question: "Did you enter the laboratory?", statement: "I never entered that night.", truth: false, explanation: "His access code was used at 22:16." },
                { question: "Did you want the research notebook?", statement: "I had no interest in those notes.", truth: false, explanation: "Messages show he requested the research." },
                { question: "Did you speak to Dr. Vale?", statement: "We argued earlier that evening.", truth: true, explanation: "A colleague heard the disagreement." },
                { question: "Do you know where he went?", statement: "I have no idea where he is.", truth: false, explanation: "A message on his device contains the destination." }
            ]
        }
    ]
},

{
    id: 4,
    title: "The Poisoned Invitation",
    classification: "CONFIDENTIAL",
    icon: "🍷",
    location: "The Royal Hotel",
    story: `A guest collapsed during an exclusive dinner at the Royal Hotel.

    Investigators discovered that the guest's drink had been tampered
    with before it reached the table.

    Three people had access to the serving area.

    A handwritten invitation was found beside the victim.`,
    evidence: [
        { name: "Glass Sample", description: "The drink contained an unidentified substance.", clue: "The drink was deliberately altered." },
        { name: "Kitchen Pass", description: "Three staff members entered the serving area.", clue: "The opportunity was shared." },
        { name: "Invitation", description: "The victim received a private invitation.", clue: "The dinner may have been arranged." },
        { name: "Napkin", description: "A fingerprint was found on the napkin.", clue: "Someone handled the table setting." }
    ],
    culprit: 1,
    suspects: [
        {
            name: "Sophie", role: "Event Planner", icon: "👩🏻",
            description: "She organised the private dinner.",
            questions: [
                { question: "Did you arrange the invitation?", statement: "I organised the guest list.", truth: true, explanation: "The event records confirm this." },
                { question: "Did you enter the kitchen?", statement: "I checked the decorations there.", truth: true, explanation: "A staff member saw her." },
                { question: "Did you know the victim?", statement: "We had met before.", truth: true, explanation: "They attended previous events." },
                { question: "Did you touch the drink?", statement: "I never handled any drinks.", truth: true, explanation: "No evidence connects her to the glass." },
                { question: "Did you plan the incident?", statement: "I planned a normal dinner.", truth: true, explanation: "The evidence supports her account." }
            ]
        },
        {
            name: "Rafael", role: "Head Chef", icon: "👨🏽",
            description: "He controlled the food preparation area.",
            questions: [
                { question: "Did you prepare the dinner?", statement: "I supervised the kitchen.", truth: true, explanation: "The kitchen roster confirms this." },
                { question: "Did you prepare the victim's drink?", statement: "I did not touch that drink.", truth: false, explanation: "His fingerprints were on the glass." },
                { question: "Did you know the victim?", statement: "We had a disagreement about a contract.", truth: true, explanation: "The hotel manager confirms it." },
                { question: "Were you near the serving area?", statement: "I stayed in the kitchen.", truth: false, explanation: "Footage places him at the serving station." },
                { question: "Did you tamper with the drink?", statement: "I did nothing to the drink.", truth: false, explanation: "The substance was traced to his workstation." }
            ]
        },
        {
            name: "Lena", role: "Hotel Manager", icon: "👩🏽",
            description: "She managed the hotel and its guests.",
            questions: [
                { question: "Did you know the victim?", statement: "The victim was a regular guest.", truth: true, explanation: "Hotel records confirm this." },
                { question: "Did you approve the dinner?", statement: "I approved the event.", truth: true, explanation: "The booking is in her name." },
                { question: "Did you enter the kitchen?", statement: "I did not enter the kitchen.", truth: true, explanation: "No record shows her entry." },
                { question: "Did you see Rafael?", statement: "I saw him near the serving station.", truth: true, explanation: "The timeline supports this." },
                { question: "Did you know about the substance?", statement: "I knew nothing about it.", truth: true, explanation: "No evidence connects her to the substance." }
            ]
        }
    ]
},

{
    id: 5,
    title: "The Stolen Identity",
    classification: "RESTRICTED",
    icon: "🪪",
    location: "Neon City Financial Tower",
    story: `Someone accessed a private financial account using a stolen identity.

    The transaction happened during a system maintenance window.

    Three employees had access to the account management floor.

    A suspicious login originated from inside the building.`,
    evidence: [
        { name: "Login Record", description: "The account was accessed internally.", clue: "The intruder was likely inside the building." },
        { name: "Maintenance Schedule", description: "A system update created a short access window.", clue: "The timing was deliberate." },
        { name: "Printer History", description: "A duplicate identity document was printed.", clue: "Someone prepared a fake identity." },
        { name: "Badge Record", description: "A staff badge entered the server floor.", clue: "An employee had access." }
    ],
    culprit: 0,
    suspects: [
        {
            name: "Jade", role: "Systems Administrator", icon: "👩🏾",
            description: "She controlled account permissions.",
            questions: [
                { question: "Did you schedule maintenance?", statement: "I approved the maintenance window.", truth: true, explanation: "The schedule carries her approval." },
                { question: "Did you access the account?", statement: "I never opened that account.", truth: false, explanation: "Her administrator credentials accessed it." },
                { question: "Did you print a duplicate identity?", statement: "I did not use the printer.", truth: false, explanation: "The print queue records her login." },
                { question: "Did you enter the server floor?", statement: "I entered to check the update.", truth: true, explanation: "The badge log confirms this." },
                { question: "Did you steal the identity?", statement: "I had no involvement.", truth: false, explanation: "A draft identity file was found in her folder." }
            ]
        },
        {
            name: "Ben", role: "Financial Analyst", icon: "👨🏻",
            description: "He reviewed suspicious financial transactions.",
            questions: [
                { question: "Did you review the transaction?", statement: "I flagged it the following morning.", truth: true, explanation: "His report confirms this." },
                { question: "Did you have server access?", statement: "I only had standard account access.", truth: true, explanation: "His permissions were limited." },
                { question: "Did you print a document?", statement: "I printed my monthly report.", truth: true, explanation: "The print history matches." },
                { question: "Did you know Jade?", statement: "We worked on the same floor.", truth: true, explanation: "Their employment records confirm this." },
                { question: "Did you steal the identity?", statement: "I did not steal it.", truth: true, explanation: "No evidence links him to the crime." }
            ]
        },
        {
            name: "Chris", role: "Building Technician", icon: "👨🏽",
            description: "He maintained the building's network equipment.",
            questions: [
                { question: "Were you working during maintenance?", statement: "I checked the network room.", truth: true, explanation: "His work order confirms this." },
                { question: "Did you use a staff badge?", statement: "I used my own badge.", truth: true, explanation: "The access record matches." },
                { question: "Did you enter the financial floor?", statement: "I did not enter the account office.", truth: true, explanation: "No entry is recorded." },
                { question: "Did you help create a fake identity?", statement: "I never created documents.", truth: true, explanation: "His workstation contains no such files." },
                { question: "Did you know about the transaction?", statement: "I only heard about it later.", truth: true, explanation: "His account activity supports this." }
            ]
        }
    ]
},

{
    id: 6,
    title: "The Ghost Train",
    classification: "TOP SECRET",
    icon: "🚆",
    location: "Underground Metro",
    story: `A sealed cargo container disappeared from a moving underground train.

    The train never stopped at an unauthorised station.

    Three workers had access to the cargo manifest.

    A signal interruption occurred between two stations.`,
    evidence: [
        { name: "Cargo Manifest", description: "One container was listed twice.", clue: "The paperwork was altered." },
        { name: "Signal Report", description: "A short interruption occurred.", clue: "Someone exploited the signal." },
        { name: "Station Camera", description: "A worker carried an empty trolley.", clue: "The trolley may have been used." },
        { name: "Control Key", description: "A control key was missing.", clue: "Someone accessed the train controls." }
    ],
    culprit: 2,
    suspects: [
        {
            name: "Ari", role: "Train Operator", icon: "👨🏻",
            description: "He operated the train during the incident.",
            questions: [
                { question: "Did you operate the train?", statement: "I drove the train that night.", truth: true, explanation: "The duty roster confirms this." },
                { question: "Did you stop at an extra station?", statement: "The train followed its route.", truth: true, explanation: "The route log confirms this." },
                { question: "Did you report the signal issue?", statement: "I reported it immediately.", truth: true, explanation: "The control centre received his report." },
                { question: "Did you handle the missing key?", statement: "I returned my key after the shift.", truth: true, explanation: "His key was accounted for." },
                { question: "Did you remove the container?", statement: "I did not touch the cargo.", truth: true, explanation: "No evidence connects him to the removal." }
            ]
        },
        {
            name: "Milo", role: "Cargo Supervisor", icon: "🧑🏽",
            description: "He checked the containers before departure.",
            questions: [
                { question: "Did you prepare the manifest?", statement: "I checked the cargo list.", truth: true, explanation: "The manifest carries his initials." },
                { question: "Was the container sealed?", statement: "It was sealed before departure.", truth: true, explanation: "The loading photograph confirms this." },
                { question: "Did you notice duplicate entries?", statement: "I noticed a duplicate the next day.", truth: true, explanation: "He filed a report." },
                { question: "Did you access the train controls?", statement: "I have no control-room access.", truth: true, explanation: "His permissions are restricted." },
                { question: "Did you steal the container?", statement: "I did not take it.", truth: true, explanation: "No evidence links him to the theft." }
            ]
        },
        {
            name: "Rex", role: "Signal Technician", icon: "👨🏾",
            description: "He maintained the underground signal network.",
            questions: [
                { question: "Did you work on the signal system?", statement: "I performed a routine check.", truth: true, explanation: "A maintenance order exists." },
                { question: "Did you cause the interruption?", statement: "The interruption was accidental.", truth: false, explanation: "A manual override was recorded." },
                { question: "Did you have the control key?", statement: "I never handled the key.", truth: false, explanation: "His fingerprints were found on it." },
                { question: "Did you know about the container?", statement: "I knew which container was valuable.", truth: true, explanation: "He viewed the cargo manifest." },
                { question: "Did you arrange the theft?", statement: "I had no part in it.", truth: false, explanation: "Messages reveal a planned transfer." }
            ]
        }
    ]
},

{
    id: 7,
    title: "The Disappearing Diamond",
    classification: "CONFIDENTIAL",
    icon: "💠",
    location: "Aurora Hotel",
    story: `A rare blue diamond disappeared during a charity auction.

    The auction continued while guests were distracted by a staged
    interruption.

    Three people were close to the display table.

    The display sensor was reset before the auction ended.`,
    evidence: [
        { name: "Display Sensor", description: "The sensor was reset.", clue: "Someone knew the display system." },
        { name: "Auction List", description: "One bidder was added manually.", clue: "A guest's identity may be false." },
        { name: "Broken Clasp", description: "A jewellery clasp was found nearby.", clue: "The diamond may have been removed quickly." },
        { name: "Stage Schedule", description: "The interruption was moved forward.", clue: "The distraction may have been planned." }
    ],
    culprit: 1,
    suspects: [
        {
            name: "Ivy", role: "Auction Host", icon: "👩🏼",
            description: "She controlled the auction schedule.",
            questions: [
                { question: "Did you change the schedule?", statement: "The performance was moved forward.", truth: true, explanation: "The updated schedule confirms this." },
                { question: "Did you know about the diamond?", statement: "I knew its estimated value.", truth: true, explanation: "She introduced the item." },
                { question: "Did you reset the sensor?", statement: "I never touched the display.", truth: true, explanation: "No host access was recorded." },
                { question: "Did you add a bidder?", statement: "I approved a late registration.", truth: true, explanation: "The registration was authorised." },
                { question: "Did you steal the diamond?", statement: "I did not steal it.", truth: true, explanation: "There is no evidence connecting her to the theft." }
            ]
        },
        {
            name: "Zane", role: "Jewellery Appraiser", icon: "🕴🏻",
            description: "He inspected the diamond before the auction.",
            questions: [
                { question: "Did you inspect the diamond?", statement: "I examined it before the auction.", truth: true, explanation: "His inspection report confirms this." },
                { question: "Did you know how to open the display?", statement: "I never learned the display code.", truth: false, explanation: "He previously serviced the lock." },
                { question: "Did you approach the table?", statement: "I stayed beside the display.", truth: true, explanation: "Several guests saw him there." },
                { question: "Did you reset the sensor?", statement: "I did not reset anything.", truth: false, explanation: "His credentials were used for the reset." },
                { question: "Did you remove the diamond?", statement: "I never removed it.", truth: false, explanation: "A matching diamond case was found in his bag." }
            ]
        },
        {
            name: "Tara", role: "Charity Coordinator", icon: "👩🏽",
            description: "She managed the guests and auction registrations.",
            questions: [
                { question: "Did you register the bidders?", statement: "I handled the registration desk.", truth: true, explanation: "Her roster confirms this." },
                { question: "Did you know Zane?", statement: "He was a registered appraiser.", truth: true, explanation: "The event records confirm this." },
                { question: "Did you move the performance?", statement: "I followed the host's instructions.", truth: true, explanation: "The host approved the change." },
                { question: "Did you touch the display?", statement: "I never approached it.", truth: true, explanation: "The footage supports this." },
                { question: "Did you take the diamond?", statement: "I did not take it.", truth: true, explanation: "No evidence links her to the theft." }
            ]
        }
    ]
},

{
    id: 8,
    title: "The Hacker's Alibi",
    classification: "TOP SECRET",
    icon: "💻",
    location: "Cyber Division Headquarters",
    story: `A classified database was breached without triggering its normal alarms.

    The attack used an internal computer terminal.

    Three employees had access to the restricted floor.

    A suspicious message was sent shortly before the breach.`,
    evidence: [
        { name: "Terminal Log", description: "An internal terminal initiated the breach.", clue: "The hacker was likely an employee." },
        { name: "Deleted Message", description: "A message was deleted at 01:03.", clue: "Someone tried to hide communication." },
        { name: "Firewall Record", description: "A security rule was changed.", clue: "The attack required technical knowledge." },
        { name: "Coffee Receipt", description: "A late-night purchase was recorded.", clue: "Someone was still in the building." }
    ],
    culprit: 2,
    suspects: [
        {
            name: "Mira", role: "Network Analyst", icon: "👩🏽",
            description: "She monitored incoming network activity.",
            questions: [
                { question: "Were you monitoring the network?", statement: "I was on the monitoring shift.", truth: true, explanation: "The roster confirms this." },
                { question: "Did you see the breach?", statement: "I noticed it after the alert.", truth: true, explanation: "Her report was submitted." },
                { question: "Did you change the firewall?", statement: "I did not change any rules.", truth: true, explanation: "No changes came from her account." },
                { question: "Did you send a message?", statement: "I sent a routine shift update.", truth: true, explanation: "The message was recovered." },
                { question: "Did you steal the data?", statement: "I did not steal anything.", truth: true, explanation: "No evidence links her to the breach." }
            ]
        },
        {
            name: "Ethan", role: "Database Manager", icon: "👨🏻",
            description: "He managed the classified records.",
            questions: [
                { question: "Did you have database access?", statement: "I managed the database.", truth: true, explanation: "His role required access." },
                { question: "Did you work late?", statement: "I left at midnight.", truth: true, explanation: "The exit camera confirms this." },
                { question: "Did you change the firewall?", statement: "I did not modify the firewall.", truth: true, explanation: "The change was made after his departure." },
                { question: "Did you know about the breach?", statement: "I learned about it the next morning.", truth: true, explanation: "His activity supports this." },
                { question: "Did you send the deleted message?", statement: "I did not send that message.", truth: true, explanation: "The message came from another account." }
            ]
        },
        {
            name: "Kai", role: "Cybersecurity Engineer", icon: "🧑🏻",
            description: "He designed the building's internal security tools.",
            questions: [
                { question: "Did you design the firewall?", statement: "I helped design its rules.", truth: true, explanation: "Technical records confirm this." },
                { question: "Were you at headquarters?", statement: "I left before midnight.", truth: false, explanation: "A late-night purchase was linked to his badge." },
                { question: "Did you modify a security rule?", statement: "I never changed the firewall.", truth: false, explanation: "His account made the change." },
                { question: "Did you send a message?", statement: "I sent no messages that night.", truth: false, explanation: "A deleted message was recovered." },
                { question: "Did you access the database?", statement: "I had no reason to access it.", truth: false, explanation: "The breach originated from his terminal." }
            ]
        }
    ]
},

{
    id: 9,
    title: "The Last Photograph",
    classification: "RESTRICTED",
    icon: "📸",
    location: "Silverlight Studio",
    story: `A famous photographer's final photograph disappeared from a locked studio.

    The original negative was missing, but a copy remained.

    Three people had visited the studio on the day of the incident.

    A photograph of the room revealed an unusual reflection.`,
    evidence: [
        { name: "Camera Roll", description: "The final image was captured at 18:42.", clue: "The timeline can be reconstructed." },
        { name: "Studio Key", description: "The key was returned late.", clue: "Someone had access after closing." },
        { name: "Glass Reflection", description: "A figure appears in the reflection.", clue: "Someone else was in the room." },
        { name: "Film Case", description: "An empty film case was recovered.", clue: "The negative may have been hidden inside." }
    ],
    culprit: 0,
    suspects: [
        {
            name: "Noah", role: "Photography Assistant", icon: "👨🏻",
            description: "He helped organise the photographer's work.",
            questions: [
                { question: "Did you handle the camera?", statement: "I prepared the equipment.", truth: true, explanation: "The equipment checklist confirms this." },
                { question: "Did you return the key?", statement: "I returned it before closing.", truth: false, explanation: "The key was returned much later." },
                { question: "Did you enter the studio again?", statement: "I never went back inside.", truth: false, explanation: "The reflection shows his jacket." },
                { question: "Did you take the negative?", statement: "I did not remove the film.", truth: false, explanation: "The empty film case was found in his locker." },
                { question: "Did you sell the photograph?", statement: "I have never sold an original.", truth: false, explanation: "A private sale agreement was recovered." }
            ]
        },
        {
            name: "Luca", role: "Gallery Owner", icon: "🧑🏽",
            description: "He planned to exhibit the photographer's work.",
            questions: [
                { question: "Did you visit the studio?", statement: "I visited in the afternoon.", truth: true, explanation: "The visitor log confirms this." },
                { question: "Did you want the photograph?", statement: "I wanted to exhibit it.", truth: true, explanation: "He requested permission." },
                { question: "Did you have a studio key?", statement: "I never had a key.", truth: true, explanation: "His access was supervised." },
                { question: "Did you enter after closing?", statement: "I left before closing.", truth: true, explanation: "The exit camera supports this." },
                { question: "Did you remove the negative?", statement: "I did not take it.", truth: true, explanation: "No evidence connects him to the theft." }
            ]
        },
        {
            name: "Amara", role: "Art Collector", icon: "👩🏽",
            description: "She had offered to purchase the photograph.",
            questions: [
                { question: "Did you offer to buy the photograph?", statement: "I made an offer.", truth: true, explanation: "The offer is documented." },
                { question: "Did you visit the studio?", statement: "I visited with permission.", truth: true, explanation: "The visitor log confirms this." },
                { question: "Did you see Noah?", statement: "I saw him preparing equipment.", truth: true, explanation: "Their accounts match." },
                { question: "Did you return after closing?", statement: "I went home after the visit.", truth: true, explanation: "Transport records support this." },
                { question: "Did you take the negative?", statement: "I did not take it.", truth: true, explanation: "There is no evidence linking her to the missing film." }
            ]
        }
    ]
},

{
    id: 10,
    title: "The Final Protocol",
    classification: "OMEGA CLASSIFIED",
    icon: "🔐",
    location: "The Central Intelligence Tower",
    story: `A secret protocol capable of controlling the city's entire
    security network has disappeared.

    The system was accessed from inside the tower.

    Three senior officers were present during the final security check.

    The city is at risk until the protocol is recovered.

    This is your final investigation.`,
    evidence: [
        { name: "Protocol Terminal", description: "The protocol was accessed at 03:17.", clue: "Someone used the central terminal." },
        { name: "Override Code", description: "A restricted override was entered.", clue: "The culprit had senior-level access." },
        { name: "Encrypted Message", description: "A message mentioned an external buyer.", clue: "The protocol may have been sold." },
        { name: "Power Record", description: "A backup power circuit was interrupted.", clue: "The culprit planned around the security system." }
    ],
    culprit: 1,
    suspects: [
        {
            name: "Director Vale", role: "Tower Director", icon: "🕴🏽",
            description: "He supervised all security operations.",
            questions: [
                { question: "Did you authorise the security check?", statement: "I approved the check.", truth: true, explanation: "The authorisation record confirms this." },
                { question: "Did you use the override?", statement: "I did not enter the override code.", truth: true, explanation: "The code came from another officer." },
                { question: "Did you know about the protocol?", statement: "I knew its importance.", truth: true, explanation: "He supervised the project." },
                { question: "Did you interrupt the backup power?", statement: "I never touched the power controls.", truth: true, explanation: "The maintenance log supports this." },
                { question: "Did you sell the protocol?", statement: "I never contacted a buyer.", truth: true, explanation: "No communication links him to a buyer." }
            ]
        },
        {
            name: "Commander Rex", role: "Operations Commander", icon: "👨🏽",
            description: "He controlled the tower's restricted operations.",
            questions: [
                { question: "Did you attend the security check?", statement: "I was present throughout.", truth: true, explanation: "The attendance record confirms this." },
                { question: "Did you enter the override code?", statement: "I never used the code.", truth: false, explanation: "The terminal log identifies his credentials." },
                { question: "Did you access the protocol?", statement: "I did not open the protocol.", truth: false, explanation: "The access record shows his account." },
                { question: "Did you contact an external buyer?", statement: "I never contacted anyone.", truth: false, explanation: "The encrypted message was linked to his device." },
                { question: "Did you interrupt the backup power?", statement: "I had no reason to touch it.", truth: false, explanation: "The power override was made using his access code." }
            ]
        },
        {
            name: "Agent Mira", role: "Intelligence Officer", icon: "👩🏽",
            description: "She monitored external threats to the tower.",
            questions: [
                { question: "Did you monitor the tower?", statement: "I watched the external security feeds.", truth: true, explanation: "Her duty roster confirms this." },
                { question: "Did you see the protocol access?", statement: "I noticed an unusual login.", truth: true, explanation: "She reported it." },
                { question: "Did you know Commander Rex?", statement: "We worked together.", truth: true, explanation: "They were assigned to the same operation." },
                { question: "Did you use the override code?", statement: "I did not use it.", truth: true, explanation: "Her credentials were not used." },
                { question: "Did you contact an external buyer?", statement: "I did not contact anyone.", truth: true, explanation: "No communication links her to the buyer." }
            ]
        }
    ]
}

];

/* ===================== DOM HELPERS ===================== */

function $(id) {
    return document.getElementById(id);
}

function setText(id, value) {
    const element = $(id);
    if (element) element.textContent = value;
}

function setHTML(id, value) {
    const element = $(id);
    if (element) element.innerHTML = value;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
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

    const target = $(screenId);

    if (target) {
        target.classList.add("active");
        gameState.currentScreen = screenId;
        window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
        console.error("Screen not found:", screenId);
    }

    updateHUD();
}

function updateHUD() {
    setText("playerPoints", playerProgress.points);
    setText("totalPoints", playerProgress.points);
    setText("playerReputation", playerProgress.reputation);
    setText("completedCases", playerProgress.completedCases.length);
}

/* ===================== CASE ARCHIVE ===================== */

function renderCases() {
    const container =
        $("caseGrid") ||
        $("casesGrid") ||
        $("caseList");

    if (!container) {
        console.error("Case archive container not found.");
        return;
    }

    container.innerHTML = "";

    caseData.forEach((investigation, index) => {
        const unlocked = playerProgress.unlockedCases.includes(index);
        const completed = playerProgress.completedCases.includes(index);

        const card = document.createElement("article");

        card.className = `case-card ${unlocked ? "" : "locked"}`;

        card.innerHTML = `
            <div class="case-icon">${investigation.icon}</div>
            <p class="eyebrow">CASE FILE ${String(index + 1).padStart(3, "0")}</p>
            <h3>${escapeHTML(investigation.title)}</h3>
            <p>${escapeHTML(investigation.location)}</p>
            <p>${completed ? "✓ CASE SOLVED" : unlocked ? "INVESTIGATION AVAILABLE" : "🔒 LOCKED"}</p>
            <button class="btn ${unlocked ? "primary" : "secondary"}"
                ${unlocked ? "" : "disabled"}>
                ${completed ? "REVISIT CASE" : unlocked ? "OPEN CASE" : "LOCKED"}
            </button>
        `;

        const button = card.querySelector("button");

        if (unlocked) {
            button.addEventListener("click", () => {
                startCase(index);
            });
        }

        container.appendChild(card);
    });
}

/* ===================== START CASE ===================== */

function startCase(index) {
    if (!playerProgress.unlockedCases.includes(index)) {
        return;
    }

    stopTimer();

    const investigation = caseData[index];

    gameState.currentCase = index;
    gameState.currentSuspect = 0;
    gameState.currentQuestion = 0;

    gameState.selectedSuspect = null;
    gameState.selectedEvidence = [];

    gameState.score = 0;
    gameState.correctAnswers = 0;
    gameState.incorrectAnswers = 0;
    gameState.hintsUsed = 0;

    gameState.answers = {};
    gameState.suspectResults = {};

    gameState.caseStarted = true;
    gameState.caseCompleted = false;

    gameState.difficulty =
        $("difficultySelect")?.value ||
        gameState.difficulty ||
        "Medium";

    gameState.timeRemaining =
        CONFIG.TIMER_BY_DIFFICULTY[gameState.difficulty];

    setText("briefingTitle", investigation.title);
    setText("briefingStory", investigation.story);
    setText("briefingClassification", investigation.classification);
    setText("briefingLocation", investigation.location);

    setText("briefingCaseNumber", `CASE FILE ${String(index + 1).padStart(3, "0")}`);

    renderEvidence();
    updateHUD();

    showScreen("briefingScreen");
}

/* ===================== EVIDENCE ===================== */

function renderEvidence() {
    const investigation = caseData[gameState.currentCase];

    const container =
        $("evidenceList") ||
        $("factsList") ||
        $("evidenceGrid");

    if (!container) return;

    container.innerHTML = "";

    investigation.evidence.forEach((item, index) => {
        const card = document.createElement("button");

        card.className = "suspect-choice evidence-choice";

        card.innerHTML = `
            <strong>📁 ${escapeHTML(item.name)}</strong>
            <p>${escapeHTML(item.description)}</p>
            <small>${escapeHTML(item.clue)}</small>
        `;

        card.addEventListener("click", () => {
            card.classList.toggle("selected");

            if (gameState.selectedEvidence.includes(index)) {
                gameState.selectedEvidence =
                    gameState.selectedEvidence.filter(value => value !== index);
            } else {
                gameState.selectedEvidence.push(index);
            }
        });

        container.appendChild(card);
    });
}

/* ===================== BEGIN INTERROGATION ===================== */

function beginInvestigation() {
    gameState.currentSuspect = 0;
    gameState.currentQuestion = 0;

    renderSuspectList();
    openSuspect(0);
}

function renderSuspectList() {
    const investigation = caseData[gameState.currentCase];

    const container =
        $("suspectList") ||
        $("suspectsContainer");

    if (!container) return;

    container.innerHTML = "";

    investigation.suspects.forEach((suspect, index) => {
        const button = document.createElement("button");

        button.className = "suspect-choice";

        button.innerHTML = `
            <strong>${suspect.icon} ${escapeHTML(suspect.name)}</strong>
            <p>${escapeHTML(suspect.role)}</p>
            <small>${escapeHTML(suspect.description)}</small>
        `;

        button.addEventListener("click", () => {
            openSuspect(index);
        });

        container.appendChild(button);
    });
}

/* ===================== OPEN SUSPECT ===================== */

function openSuspect(index) {
    stopTimer();

    gameState.currentSuspect = index;
    gameState.currentQuestion = 0;

    const suspect =
        caseData[gameState.currentCase].suspects[index];

    setText("suspectName", suspect.name);
    setText("suspectRole", suspect.role);
    setText("suspectDescription", suspect.description);
    setText("suspectAvatar", suspect.icon);

    gameState.suspectResults[index] = {
        correct: 0,
        incorrect: 0,
        completed: false
    };

    showScreen("interviewScreen");

    renderQuestion();
}

/* ===================== QUESTION RENDERING ===================== */

function renderQuestion() {
    const suspect =
        caseData[gameState.currentCase]
            .suspects[gameState.currentSuspect];

    const question =
        suspect.questions[gameState.currentQuestion];

    if (!question) {
        finishSuspectInterview();
        return;
    }

    setText(
        "questionNumber",
        `QUESTION ${gameState.currentQuestion + 1} / 5`
    );

    setText("interviewQuestion", question.question);
    setText("questionStatement", question.statement);

    setText("questionFeedback", "");

    const feedback = $("questionFeedback");

    if (feedback) {
        feedback.className = "feedback";
    }

    const truthButton = $("truthButton");
    const lieButton = $("lieButton");

    if (truthButton) truthButton.disabled = false;
    if (lieButton) lieButton.disabled = false;

    gameState.timeRemaining =
        CONFIG.TIMER_BY_DIFFICULTY[gameState.difficulty];

    updateTimerDisplay();
    startTimer();
}

/* ===================== TIMER ===================== */

function startTimer() {
    stopTimer();

    gameState.timerInterval = setInterval(() => {
        if (!gameState.caseStarted || gameState.caseCompleted) {
            stopTimer();
            return;
        }

        gameState.timeRemaining--;

        updateTimerDisplay();

        if (gameState.timeRemaining <= 0) {
            stopTimer();
            handleTimeout();
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval !== null) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateTimerDisplay() {
    const time = Math.max(0, gameState.timeRemaining);

    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    const formatted =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

    setText("timerDisplay", formatted);
    setText("timeRemaining", formatted);

    const timerFill = $("timerFill");

    if (timerFill) {
        const maximum =
            CONFIG.TIMER_BY_DIFFICULTY[gameState.difficulty];

        timerFill.style.width =
            `${Math.max(0, (time / maximum) * 100)}%`;
    }
}

function handleTimeout() {
    const question =
        caseData[gameState.currentCase]
            .suspects[gameState.currentSuspect]
            .questions[gameState.currentQuestion];

    gameState.incorrectAnswers++;

    gameState.suspectResults[gameState.currentSuspect].incorrect++;

    gameState.score += CONFIG.POINTS.incorrect;

    showFeedback(
        `⏰ Time's up! The correct answer was ${question.truth ? "TRUE" : "LIE"}.`,
        false
    );

    recordAnswer("timeout", question.truth);

    window.setTimeout(() => {
        nextQuestion();
    }, 1400);
}

/* ===================== ANSWER QUESTIONS ===================== */

function answerQuestion(playerAnswer) {
    if (!gameState.caseStarted || gameState.caseCompleted) return;
    if (gameState.timeRemaining <= 0) return;

    const suspect =
        caseData[gameState.currentCase]
            .suspects[gameState.currentSuspect];

    const question = suspect.questions[gameState.currentQuestion];

    if (!question) return;

    stopTimer();

    const correct = playerAnswer === question.truth;

    const truthButton = $("truthButton");
    const lieButton = $("lieButton");

    if (truthButton) truthButton.disabled = true;
    if (lieButton) lieButton.disabled = true;

    if (correct) {
        gameState.correctAnswers++;
        gameState.suspectResults[gameState.currentSuspect].correct++;
        gameState.score += CONFIG.POINTS.correct;

        showFeedback(
            `✓ Correct! ${question.explanation}`,
            true
        );
    } else {
        gameState.incorrectAnswers++;
        gameState.suspectResults[gameState.currentSuspect].incorrect++;
        gameState.score += CONFIG.POINTS.incorrect;

        showFeedback(
            `✗ Not quite! ${question.explanation}`,
            false
        );
    }

    recordAnswer(playerAnswer, question.truth);

    window.setTimeout(() => {
        nextQuestion();
    }, 1800);
}

function recordAnswer(playerAnswer, actualAnswer) {
    const suspectIndex = gameState.currentSuspect;
    const questionIndex = gameState.currentQuestion;

    if (!gameState.answers[suspectIndex]) {
        gameState.answers[suspectIndex] = {};
    }

    gameState.answers[suspectIndex][questionIndex] = {
        playerAnswer,
        actualAnswer,
        correct: playerAnswer === actualAnswer
    };
}

function showFeedback(message, good) {
    const feedback = $("questionFeedback");

    if (!feedback) return;

    feedback.textContent = message;
    feedback.className = good ? "feedback good" : "feedback bad";
}

function nextQuestion() {
    gameState.currentQuestion++;

    if (gameState.currentQuestion >= CONFIG.QUESTIONS_PER_SUSPECT) {
        finishSuspectInterview();
    } else {
        renderQuestion();
    }
}

/* ===================== HINT SYSTEM ===================== */

function useHint() {
    const suspect =
        caseData[gameState.currentCase]
            .suspects[gameState.currentSuspect];

    const question = suspect.questions[gameState.currentQuestion];

    if (!question) return;

    if (gameState.timeRemaining <= 0) return;

    gameState.hintsUsed++;
    gameState.score += CONFIG.POINTS.hint;

    stopTimer();

    showFeedback(
        `🔎 Detective hint: ${question.explanation}`,
        true
    );

    const truthButton = $("truthButton");
    const lieButton = $("lieButton");

    if (truthButton) truthButton.disabled = true;
    if (lieButton) lieButton.disabled = true;

    window.setTimeout(() => {
        if (truthButton) truthButton.disabled = false;
        if (lieButton) lieButton.disabled = false;

        renderQuestion();
    }, 2500);
}

/* ===================== SUSPECT INTERVIEW COMPLETED ===================== */

function finishSuspectInterview() {
    stopTimer();

    const suspectIndex = gameState.currentSuspect;

    gameState.suspectResults[suspectIndex].completed = true;

    const container =
        $("interviewCompleteMessage");

    if (container) {
        container.textContent =
            "Interrogation complete. Select another suspect or continue to your final accusation.";
    }

    showScreen("interviewScreen");

    const nextButton = $("continueAccusationButton");

    if (nextButton) {
        nextButton.hidden = false;
    }
}

/* ===================== ACCUSATION ===================== */

function openAccusation() {
    stopTimer();

    const investigation = caseData[gameState.currentCase];

    const container =
        $("accusationSuspects") ||
        $("accusationOptions") ||
        $("suspectChoices");

    if (!container) {
        console.error("Accusation options container not found.");
        return;
    }

    container.innerHTML = "";

    gameState.selectedSuspect = null;

    investigation.suspects.forEach((suspect, index) => {
        const button = document.createElement("button");

        button.className = "suspect-choice";

        button.innerHTML = `
            <strong>${suspect.icon} ${escapeHTML(suspect.name)}</strong>
            <p>${escapeHTML(suspect.role)}</p>
        `;

        button.addEventListener("click", () => {
            gameState.selectedSuspect = index;

            container.querySelectorAll(".suspect-choice")
                .forEach(item => item.classList.remove("selected"));

            button.classList.add("selected");
        });

        container.appendChild(button);
    });

    showScreen("accusationScreen");
}

function submitAccusation() {
    if (gameState.selectedSuspect === null) {
        alert("Detective, select a suspect before submitting your accusation.");
        return;
    }

    const investigation = caseData[gameState.currentCase];

    const correct =
        gameState.selectedSuspect === investigation.culprit;

    if (correct) {
        gameState.score += CONFIG.POINTS.accusation;

        showFinalReport(true);
    } else {
        gameState.score += CONFIG.POINTS.incorrect;

        showFinalReport(false);
    }
}

/* ===================== INVESTIGATION REPORT ===================== */

function showFinalReport(correct) {
    stopTimer();

    if (gameState.caseCompleted) return;

    gameState.caseCompleted = true;
    gameState.caseStarted = false;

    const investigation = caseData[gameState.currentCase];

    const culprit =
        investigation.suspects[investigation.culprit];

    const accused =
        investigation.suspects[gameState.selectedSuspect];

    let rating = "ROOKIE DETECTIVE";

    const accuracy =
        gameState.correctAnswers + gameState.incorrectAnswers > 0
            ? Math.round(
                gameState.correctAnswers /
                (gameState.correctAnswers + gameState.incorrectAnswers) * 100
            )
            : 0;

    if (accuracy >= 90 && correct) {
        rating = "MASTER DETECTIVE";
    } else if (accuracy >= 70 && correct) {
        rating = "ELITE INVESTIGATOR";
    } else if (correct) {
        rating = "SKILLED INVESTIGATOR";
    }

    if (correct) {
        gameState.score += CONFIG.POINTS.completed;

        if (!playerProgress.completedCases.includes(gameState.currentCase)) {
            playerProgress.completedCases.push(gameState.currentCase);
            playerProgress.completedInvestigations++;
        }

        if (gameState.currentCase + 1 < CONFIG.TOTAL_CASES) {
            if (!playerProgress.unlockedCases.includes(gameState.currentCase + 1)) {
                playerProgress.unlockedCases.push(gameState.currentCase + 1);
            }
        }

        playerProgress.reputation += 10;
    }

    const previousBest =
        playerProgress.bestScores[gameState.currentCase] || 0;

    playerProgress.bestScores[gameState.currentCase] =
        Math.max(previousBest, gameState.score);

    playerProgress.points += Math.max(0, gameState.score);

    saveProgress();

    const reportTitle = correct
        ? "CASE SOLVED"
        : "INVESTIGATION INCOMPLETE";

    setText("reportTitle", reportTitle);
    setText("reportRating", rating);

    setText("reportCaseName", investigation.title);
    setText("reportAccused", accused.name);
    setText("reportCulprit", culprit.name);

    setText("reportScore", gameState.score);
    setText("reportAccuracy", `${accuracy}%`);
    setText("reportCorrect", gameState.correctAnswers);
    setText("reportIncorrect", gameState.incorrectAnswers);
    setText("reportHints", gameState.hintsUsed);

    setText(
        "reportResult",
        correct
            ? `Excellent work! ${culprit.name} was responsible.`
            : `The actual culprit was ${culprit.name}. Review the evidence and try again.`
    );

    setText(
        "reportExplanation",
        correct
            ? "You connected the evidence, questioned the suspects and identified the correct culprit."
            : "Your accusation did not match the investigation evidence."
    );

    const nextCaseButton = $("nextCaseButton");

    if (nextCaseButton) {
        nextCaseButton.hidden =
            !correct ||
            gameState.currentCase + 1 >= CONFIG.TOTAL_CASES;
    }

    updateHUD();
    renderCases();

    showScreen("reportScreen");
}

/* ===================== RESTART CASE ===================== */

function retryCase() {
    const current = gameState.currentCase;
    const difficulty = gameState.difficulty;

    startCase(current);

    gameState.difficulty = difficulty;

    gameState.timeRemaining =
        CONFIG.TIMER_BY_DIFFICULTY[difficulty];
}

function nextCase() {
    const next = gameState.currentCase + 1;

    if (next >= CONFIG.TOTAL_CASES) {
        showScreen("homeScreen");
        return;
    }

    if (!playerProgress.unlockedCases.includes(next)) {
        return;
    }

    startCase(next);
}

/* ===================== NAVIGATION ===================== */

function leaveActivity(destination) {
    if (!gameState.caseStarted || gameState.caseCompleted) {
        stopTimer();

        if (destination === "home") {
            showScreen("homeScreen");
        } else {
            renderCases();
            showScreen("casesScreen");
        }

        return;
    }

    const confirmed = window.confirm(
        "Leave this investigation? Your current unfinished attempt will not be counted as a completed case. Your previously completed cases will remain saved."
    );

    if (!confirmed) return;

    stopTimer();

    gameState.caseStarted = false;

    gameState.currentQuestion = 0;
    gameState.currentSuspect = 0;

    gameState.selectedSuspect = null;

    gameState.answers = {};
    gameState.suspectResults = {};

    if (destination === "home") {
        showScreen("homeScreen");
    } else {
        renderCases();
        showScreen("casesScreen");
    }
}

function goHome() {
    leaveActivity("home");
}

function goToArchive() {
    leaveActivity("cases");
}

/* ===================== BUTTON EVENTS ===================== */

function bindClick(id, callback) {
    const element = $(id);

    if (element) {
        element.addEventListener("click", callback);
    } else {
        console.warn(`Optional button not found: ${id}`);
    }
}

function bindEvents() {

    // Main menu
    bindClick("startButton", () => {
        renderCases();
        showScreen("casesScreen");
    });

    bindClick("startInvestigatingButton", () => {
        renderCases();
        showScreen("casesScreen");
    });

    bindClick("caseArchiveButton", () => {
        renderCases();
        showScreen("casesScreen");
    });

    bindClick("homeButton", goHome);
    bindClick("backHomeButton", goHome);

    // Case archive
    bindClick("casesHomeButton", goHome);

    // Briefing
    bindClick("beginInvestigationButton", beginInvestigation);
    bindClick("briefingStartButton", beginInvestigation);
    bindClick("briefingBackButton", goToArchive);
    bindClick("briefingHomeButton", goHome);

    // Interrogation
    bindClick("truthButton", () => answerQuestion(true));
    bindClick("lieButton", () => answerQuestion(false));

    bindClick("hintButton", useHint);

    bindClick("interviewExitButton", goToArchive);
    bindClick("interviewHomeButton", goHome);

    bindClick("continueAccusationButton", openAccusation);

    bindClick("nextQuestionButton", nextQuestion);

    bindClick("nextSuspectButton", () => {
        const next =
            (gameState.currentSuspect + 1) %
            CONFIG.SUSPECTS_PER_CASE;

        openSuspect(next);
    });

    // Accusation
    bindClick("accuseButton", submitAccusation);
    bindClick("submitAccusationButton", submitAccusation);

    bindClick("accusationExitButton", goToArchive);
    bindClick("accusationHomeButton", goHome);

    // Report
    bindClick("retryButton", retryCase);
    bindClick("retryCaseButton", retryCase);
    bindClick("nextCaseButton", nextCase);

    bindClick("reportHomeButton", goHome);

    bindClick("reportArchiveButton", () => {
        renderCases();
        showScreen("casesScreen");
    });

    // Puzzle navigation compatibility
    bindClick("puzzleExitButton", goToArchive);
    bindClick("puzzleHomeButton", goHome);

    // Difficulty
    const difficultySelect = $("difficultySelect");

    if (difficultySelect) {
        difficultySelect.addEventListener("change", () => {
            gameState.difficulty = difficultySelect.value;
        });
    }
}

/* ===================== VALIDATION ===================== */

function validateCases() {
    caseData.forEach((investigation, caseIndex) => {
        if (investigation.suspects.length !== CONFIG.SUSPECTS_PER_CASE) {
            console.error(`Case ${caseIndex + 1}: incorrect suspect count.`);
        }

        investigation.suspects.forEach((suspect, suspectIndex) => {
            if (suspect.questions.length !== CONFIG.QUESTIONS_PER_SUSPECT) {
                console.error(
                    `Case ${caseIndex + 1}, suspect ${suspectIndex + 1}: expected five questions.`
                );
            }
        });

        if (
            investigation.culprit < 0 ||
            investigation.culprit >= investigation.suspects.length
        ) {
            console.error(`Case ${caseIndex + 1}: invalid culprit index.`);
        }
    });

    console.log("Tiny Detective case validation complete.");
    console.log("Total cases:", caseData.length);
}

/* ===================== INITIALISE GAME ===================== */

function initialiseGame() {
    console.log("====================================");
    console.log(" TINY DETECTIVE - SYSTEM ONLINE");
    console.log(" Cyberpunk Investigation Engine");
    console.log("====================================");

    validateCases();

    bindEvents();

    updateHUD();

    renderCases();

    showScreen("homeScreen");

    console.log("Saved progress loaded.");
    console.log("Unlocked cases:", playerProgress.unlockedCases);
    console.log("Completed cases:", playerProgress.completedCases);
}

/* ===================== STARTUP ===================== */

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseGame);
} else {
    initialiseGame();
}
