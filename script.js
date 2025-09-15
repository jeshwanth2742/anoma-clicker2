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

const disappearSmallTime = 1200; // ms for small image
const disappearBonusTime = 1500; // ms for bonus image

let smallTargetTimeout;
let bonusTargetTimeout;

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

  spawnSmallTarget();
  spawnBonusTarget();

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}s`;
    if (timeLeft <= 0) endGame();
  }, 1000);
});

// --- Spawn Small (+1) Target ---
function spawnSmallTarget() {
  clearSmallTarget();

  const smallImg = document.createElement("img");
  smallImg.src = "assets/anoma-logo.png.jpg";
  smallImg.className = "target small";
  setPositionRandomly(smallImg, 70);
  gameArea.appendChild(smallImg);

  smallImg.addEventListener("click", (e) => {
    e.stopPropagation();
    updateScore(1);
    clearSmallTarget();
    spawnSmallTarget();
  });

  smallTargetTimeout = setTimeout(() => {
    clearSmallTarget();
    if (timeLeft > 0) spawnSmallTarget();
  }, disappearSmallTime);
}

// --- Spawn Bonus (+5) Target ---
function spawnBonusTarget() {
  clearBonusTarget();

  const bonusImg = document.createElement("img");
  bonusImg.src = "assets/nanoma-logo.png.jpg";
  bonusImg.className = "target bonus";
  setPositionRandomly(bonusImg, 90);
  gameArea.appendChild(bonusImg);

  bonusImg.addEventListener("click", (e) => {
    e.stopPropagation();
    updateScore(5);
    clearBonusTarget();
    spawnBonusTarget();
  });

  bonusTargetTimeout = setTimeout(() => {
    clearBonusTarget();
    if (timeLeft > 0) spawnBonusTarget();
  }, disappearBonusTime);
}

// --- Set random position inside gameArea ---
function setPositionRandomly(img, size) {
  const buffer = 10;
  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;

  const maxX = areaWidth - size - buffer;
  const maxY = areaHeight - size - buffer;

  const x = Math.random() * maxX + buffer;
  const y = Math.random() * maxY + buffer;

  img.style.position = "absolute";
  img.style.left = `${x}px`;
  img.style.top = `${y}px`;
  img.style.width = `${size}px`;
  img.style.height = "auto";
  img.style.borderRadius = "50%";
  img.style.boxShadow = "0 0 15px 6px white";
  img.style.cursor = "pointer";
  img.style.transition = "transform 0.3s ease";
}

// --- Clear small target ---
function clearSmallTarget() {
  clearTimeout(smallTargetTimeout);
  const small = gameArea.querySelector(".small");
  if (small) small.remove();
}

// --- Clear bonus target ---
function clearBonusTarget() {
  clearTimeout(bonusTargetTimeout);
  const bonus = gameArea.querySelector(".bonus");
  if (bonus) bonus.remove();
}

// --- Update score ---
function updateScore(amount) {
  score += amount;
  if (score < 0) score = 0;
  scoreDisplay.textContent = `Score: ${score}`;
}

// --- Clicking empty space penalty ---
gameArea.addEventListener("click", () => {
  if (timeLeft > 0) {
    updateScore(-1);
  }
});

// --- End Game ---
function endGame() {
  clearInterval(timerInterval);
  clearSmallTarget();
  clearBonusTarget();
  gameScreen.classList.add("hidden");
  leaderboardScreen.classList.remove("hidden");
  // Firebase or leaderboard logic
}

