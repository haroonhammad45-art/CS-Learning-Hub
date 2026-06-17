const lessons = [
  {
    id: "arrays",
    title: "Arrays and indexing",
    track: "Foundations",
    time: "12 min",
    summary: "Store ordered values, access positions, and practice zero-based indexing.",
  },
  {
    id: "functions",
    title: "Functions and parameters",
    track: "Foundations",
    time: "15 min",
    summary: "Break programs into reusable blocks with inputs, outputs, and clear names.",
  },
  {
    id: "sorting",
    title: "Sorting algorithms",
    track: "Algorithms",
    time: "18 min",
    summary: "Compare bubble, selection, and merge sort through visual step-by-step logic.",
  },
  {
    id: "recursion",
    title: "Recursion",
    track: "Algorithms",
    time: "20 min",
    summary: "Solve problems by defining a base case and a smaller version of the task.",
  },
  {
    id: "graphs",
    title: "Graphs and traversal",
    track: "Algorithms",
    time: "22 min",
    summary: "Model connections with nodes and edges, then explore breadth-first search.",
  },
  {
    id: "ai",
    title: "Intro to AI",
    track: "AI",
    time: "16 min",
    summary: "Understand training data, models, predictions, and responsible AI basics.",
  },
];

const questions = [
  {
    prompt: "Which data structure is best for storing items in order and accessing them by index?",
    answers: ["Array", "Boolean", "Compiler", "Loop"],
    correct: "Array",
  },
  {
    prompt: "What stops a recursive function from calling itself forever?",
    answers: ["A base case", "A variable name", "A CSS rule", "A larger input"],
    correct: "A base case",
  },
  {
    prompt: "Which sorting idea repeatedly compares neighboring values?",
    answers: ["Bubble sort", "Binary search", "Hashing", "Tree traversal"],
    correct: "Bubble sort",
  },
  {
    prompt: "In machine learning, what does a model learn patterns from?",
    answers: ["Training data", "HTML tags", "File names", "Screen size"],
    correct: "Training data",
  },
];

const challenges = [
  {
    id: "sum-array",
    title: "Sum an array",
    difficulty: "Starter",
    summary: "Write a function that returns the total of every number in a list.",
  },
  {
    id: "palindrome",
    title: "Palindrome checker",
    difficulty: "Core",
    summary: "Return true when a word reads the same forward and backward.",
  },
  {
    id: "factorial",
    title: "Recursive factorial",
    difficulty: "Core",
    summary: "Use recursion to multiply a positive number by each smaller number.",
  },
  {
    id: "frequency",
    title: "Word frequency",
    difficulty: "Stretch",
    summary: "Count how many times each word appears in a sentence.",
  },
];

const storageKey = "cs-learning-hub-progress";
const defaultState = {
  completedLessons: [],
  solvedChallenges: [],
  quizScore: 0,
  quizAnswered: {},
  streak: 1,
};

let state = loadState();
let activeQuestion = 0;
let bars = [];
let sortIndex = 0;
let sortPass = 0;
let autoTimer = null;

const lessonList = document.querySelector("#lessonList");
const challengeList = document.querySelector("#challengeList");
const trackFilter = document.querySelector("#trackFilter");
const quizQuestion = document.querySelector("#quizQuestion");
const quizAnswers = document.querySelector("#quizAnswers");
const quizFeedback = document.querySelector("#quizFeedback");
const questionCount = document.querySelector("#questionCount");
const canvas = document.querySelector("#sortCanvas");
const ctx = canvas.getContext("2d");

function loadState() {
  const saved = localStorage.getItem(storageKey);
  return saved ? { ...defaultState, ...JSON.parse(saved) } : { ...defaultState };
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function renderLessons() {
  const filter = trackFilter.value;
  const visibleLessons = lessons.filter((lesson) => filter === "all" || lesson.track === filter);

  lessonList.innerHTML = visibleLessons
    .map((lesson) => {
      const done = state.completedLessons.includes(lesson.id);
      return `
        <article class="lesson-card">
          <div>
            <h3>${lesson.title}</h3>
            <p>${lesson.summary}</p>
            <div class="tag-row">
              <span class="pill">${lesson.track}</span>
              <span class="pill">${lesson.time}</span>
            </div>
          </div>
          <button type="button" data-lesson="${lesson.id}">${done ? "Completed" : "Mark done"}</button>
        </article>
      `;
    })
    .join("");
}

function renderQuiz() {
  const current = questions[activeQuestion];
  const answered = state.quizAnswered[activeQuestion];

  questionCount.textContent = `Question ${activeQuestion + 1} of ${questions.length}`;
  quizQuestion.textContent = current.prompt;
  quizFeedback.textContent = answered ? (answered === current.correct ? "Correct answer saved." : `Correct answer: ${current.correct}`) : "";
  quizAnswers.innerHTML = current.answers
    .map((answer) => {
      const className = answered
        ? answer === current.correct
          ? "correct"
          : answer === answered
            ? "wrong"
            : ""
        : "";
      return `<button type="button" class="${className}" data-answer="${answer}" ${answered ? "disabled" : ""}>${answer}</button>`;
    })
    .join("");
}

function renderChallenges() {
  challengeList.innerHTML = challenges
    .map((challenge) => {
      const solved = state.solvedChallenges.includes(challenge.id);
      return `
        <article class="challenge-card">
          <div>
            <h3>${challenge.title}</h3>
            <p>${challenge.summary}</p>
            <div class="tag-row">
              <span class="pill">${challenge.difficulty}</span>
            </div>
          </div>
          <button class="${solved ? "solved" : ""}" type="button" data-challenge="${challenge.id}">
            ${solved ? "Solved" : "Mark solved"}
          </button>
        </article>
      `;
    })
    .join("");
}

function updateMetrics() {
  const lessonRatio = state.completedLessons.length / lessons.length;
  const challengeRatio = state.solvedChallenges.length / challenges.length;
  const quizRatio = state.quizScore / questions.length;
  const overall = Math.round(((lessonRatio + challengeRatio + quizRatio) / 3) * 100);

  document.querySelector("#lessonMetric").textContent = `${state.completedLessons.length}/${lessons.length}`;
  document.querySelector("#quizMetric").textContent = `${Math.round(quizRatio * 100)}%`;
  document.querySelector("#challengeMetric").textContent = `${state.solvedChallenges.length}/${challenges.length}`;
  document.querySelector("#streakMetric").textContent = `${state.streak} day${state.streak === 1 ? "" : "s"}`;
  document.querySelector("#overallProgress").style.width = `${overall}%`;
  document.querySelector("#progressSummary").textContent =
    overall >= 80
      ? `Great momentum: ${overall}% complete. Keep pushing into the stretch challenges.`
      : `You are ${overall}% through the hub. Complete lessons, quizzes, and challenges to fill the map.`;
}

function toggleItem(collection, id) {
  state[collection] = state[collection].includes(id)
    ? state[collection].filter((item) => item !== id)
    : [...state[collection], id];
  saveState();
}

function answerQuestion(answer) {
  if (state.quizAnswered[activeQuestion]) return;

  const correct = questions[activeQuestion].correct;
  state.quizAnswered[activeQuestion] = answer;
  if (answer === correct) {
    state.quizScore += 1;
    quizFeedback.textContent = "Correct. Nice work.";
  } else {
    quizFeedback.textContent = `Not quite. Correct answer: ${correct}`;
  }

  saveState();
  renderQuiz();
  updateMetrics();
}

function resetProgress() {
  state = { ...defaultState, completedLessons: [], solvedChallenges: [], quizAnswered: {} };
  activeQuestion = 0;
  saveState();
  renderAll();
}

function createBars() {
  bars = Array.from({ length: 18 }, () => Math.floor(35 + Math.random() * 300));
  sortIndex = 0;
  sortPass = 0;
  drawBars();
}

function drawBars(activeA = -1, activeB = -1) {
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#10231f";
  ctx.fillRect(0, 0, width, height);

  const barGap = 8;
  const barWidth = (width - barGap * (bars.length + 1)) / bars.length;
  bars.forEach((value, index) => {
    const x = barGap + index * (barWidth + barGap);
    const y = height - value - 34;
    const isActive = index === activeA || index === activeB;
    ctx.fillStyle = isActive ? "#f0c45b" : index % 3 === 0 ? "#4fb3a2" : index % 3 === 1 ? "#7ea7dd" : "#e17b89";
    ctx.fillRect(x, y, barWidth, value);
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.font = "16px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(value, x + barWidth / 2, height - 10);
  });
}

function stepSort() {
  if (sortPass >= bars.length - 1) {
    drawBars();
    stopAutoSort();
    return;
  }

  const left = sortIndex;
  const right = sortIndex + 1;
  if (bars[left] > bars[right]) {
    [bars[left], bars[right]] = [bars[right], bars[left]];
  }
  drawBars(left, right);

  sortIndex += 1;
  if (sortIndex >= bars.length - sortPass - 1) {
    sortIndex = 0;
    sortPass += 1;
  }
}

function stopAutoSort() {
  clearInterval(autoTimer);
  autoTimer = null;
  document.querySelector("#autoSort").textContent = "Auto sort";
}

function renderAll() {
  renderLessons();
  renderQuiz();
  renderChallenges();
  updateMetrics();
  drawBars();
}

trackFilter.addEventListener("change", renderLessons);

lessonList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-lesson]");
  if (!button) return;
  toggleItem("completedLessons", button.dataset.lesson);
  renderLessons();
  updateMetrics();
});

challengeList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-challenge]");
  if (!button) return;
  toggleItem("solvedChallenges", button.dataset.challenge);
  renderChallenges();
  updateMetrics();
});

quizAnswers.addEventListener("click", (event) => {
  const button = event.target.closest("[data-answer]");
  if (!button) return;
  answerQuestion(button.dataset.answer);
});

document.querySelector("#nextQuestion").addEventListener("click", () => {
  activeQuestion = (activeQuestion + 1) % questions.length;
  renderQuiz();
});

document.querySelector("#resetProgress").addEventListener("click", resetProgress);
document.querySelector("#shuffleBars").addEventListener("click", () => {
  stopAutoSort();
  createBars();
});
document.querySelector("#stepSort").addEventListener("click", stepSort);
document.querySelector("#autoSort").addEventListener("click", () => {
  if (autoTimer) {
    stopAutoSort();
    return;
  }
  document.querySelector("#autoSort").textContent = "Pause";
  autoTimer = setInterval(stepSort, 220);
});

createBars();
renderAll();
