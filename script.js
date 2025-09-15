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
let disappearTime = 1000; // in ms

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

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
});

// --- Spawn target at random position ---
// Randomly decides whether to show +1 or +5 image
function spawnTarget() {
  clearTargets();
  const targetImg = document.createElement("img");
  targetImg.style.position = "absolute";
  targetImg.style.cursor = "pointer";

  // Decide type randomly: +5 target 20% chance, else +1
  const isBonus = Math.random() < 0.2;

  if (isBonus) {
    targetImg.src = "assets/nanoma-logo.png.jpg"; // +5 image
    targetImg.dataset.points = "5";
  } else {
    targetImg.src = "assets/anoma-logo.png.jpg"; // +1 image
    targetImg.dataset.points = "1";
  }

  const size = isBonus ? 60 : 50; // bigger bonus target
  targetImg.style.width = `${size}px`;
  targetImg.style.height = "auto";

  // Calculate random position within gameArea bounds
  const buffer = 10; // padding in px
  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;
  const maxX = areaWidth - size - buffer;
  const maxY = areaHeight - size - buffer;

  const x = Math.random() * maxX + buffer;
  const y = Math.random() * maxY + buffer;

  targetImg.style.left = `${x}px`;
  targetImg.style.top = `${y}px`;

  // Add to game area
  gameArea.appendChild(targetImg);

  // Target disappears after disappearTime ms
  setTimeout(() => {
    clearTargets();
    if (timeLeft > 0) spawnTarget();
  }, disappearTime);

  // Click listener for target
  targetImg.addEventListener("click", (e) => {
    e.stopPropagation(); // prevent triggering gameArea click
    const points = parseInt(targetImg.dataset.points);
    score += points;
    scoreDisplay.textContent = `Score: ${score}`;
    clearTargets();
    if (timeLeft > 0) spawnTarget();
  });
}

// --- Clear any existing targets ---
function clearTargets() {
  while (gameArea.firstChild) {
    gameArea.removeChild(gameArea.firstChild);
  }
}

// --- Click on empty space penalty ---
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
  // Save score and show leaderboard logic here
}
