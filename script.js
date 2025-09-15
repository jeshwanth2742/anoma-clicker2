// --- Screens ---
const loginScreen = document.getElementById("login-screen");
const gameScreen = document.getElementById("game-screen");
const leaderboardScreen = document.getElementById("leaderboard-screen");

// --- Elements ---
const usernameInput = document.getElementById("username");
const startBtn = document.getElementById("start-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const restartBtn = document.getElementById("restart-btn");
const gameArea = document.getElementById("game-area");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const leaderboardList = document.getElementById("leaderboard-list");

let score = 0;
let timeLeft = 60;
let timerInterval;

const disappearTime = 1000; // 1000 ms disappear time fixed

// --- Start Game ---
startBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (!username) {
    alert("Please enter your name!");
    return;
  }

  loginScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  score = 0;
  timeLeft = 60;
  scoreDisplay.textContent = `Score: ${score}`;
  timerDisplay.textContent = `Time: ${timeLeft}s`;

  spawnTarget();

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 0) endGame();
  }, 1000);
});

// --- Spawn target ---
function spawnTarget() {
  clearTargets();
  const targetImg = document.createElement("img");
  targetImg.classList.add("target");

  // Decide type: 20% chance for +5, else +1
  const isBonus = Math.random() < 0.2;

  if (isBonus) {
    targetImg.src = "assets/nanoma-logo.png.jpg"; // +5 points image
    targetImg.dataset.points = "5";
    targetImg.classList.add("bonus");
  } else {
    targetImg.src = "assets/anoma-logo.png.jpg"; // +1 points image
    targetImg.dataset.points = "1";
    targetImg.classList.add("small");
  }

  // Size and positioning
  const buffer = 10;
  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;
  const size = isBonus ? 90 : 70;

  const maxX = areaWidth - size - buffer;
  const maxY = areaHeight - size - buffer;

  const x = Math.random() * maxX + buffer;
  const y = Math.random() * maxY + buffer;

  targetImg.style.left = `${x}px`;
  targetImg.style.top = `${y}px`;
  targetImg.style.position = "absolute";
  targetImg.style.width = `${size}px`;
  targetImg.style.height = "auto";
  targetImg.style.cursor = "pointer";

  gameArea.appendChild(targetImg);

  // Target disappears and respawns after disappearTime
  setTimeout(() => {
    clearTargets();
    if (timeLeft > 0) spawnTarget();
  }, disappearTime);

  // Handling clicks on target image
  targetImg.addEventListener("click", (e) => {
    e.stopPropagation();
    const points = parseInt(targetImg.dataset.points);
    score += points;
    scoreDisplay.textContent = `Score: ${score}`;
    clearTargets();
    if (timeLeft > 0) spawnTarget();
  });
}

// --- Clear existing targets ---
function clearTargets() {
  while (gameArea.firstChild) {
    gameArea.removeChild(gameArea.firstChild);
  }
}

// --- Click penalty on empty area ---
gameArea.addEventListener("click", (e) => {
  if (timeLeft > 0) {
    score = Math.max(0, score - 1);
    scoreDisplay.textContent = `Score: ${score}`;
  }
});

// --- End game ---
function endGame() {
  clearInterval(timerInterval);
  clearTargets();
  gameScreen.classList.add("hidden");
  leaderboardScreen.classList.remove("hidden");
  // Add leaderboard saving code here if needed
}
