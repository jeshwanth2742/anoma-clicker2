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

const disappearSmallTime = 1200; // Small target disappear time ms
const disappearBonusTime = 1500; // Bonus target disappear time ms

let smallTargetTimeout;
let bonusTargetTimeout;

let smallTargetPos = null;
let bonusTargetPos = null;

// --- Start Game ---
startBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  if (!username) {
    alert("Please enter your name!");
    return;
  }
  console.clear();
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

// --- Position helper ---
function getRandomPosition(size) {
  const buffer = 10;
  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;

  const maxX = areaWidth - size - buffer;
  const maxY = areaHeight - size - buffer;

  const x = Math.random() * maxX + buffer;
  const y = Math.random() * maxY + buffer;

  return { x, y };
}

// --- Check overlap ---
function isOverlapping(pos1, size1, pos2, size2) {
  if (!pos1 || !pos2) return false;
  return !(
    pos1.x + size1 < pos2.x ||
    pos1.x > pos2.x + size2 ||
    pos1.y + size1 < pos2.y ||
    pos1.y > pos2.y + size2
  );
}

// --- Spawn Small Target ---
function spawnSmallTarget() {
  clearSmallTarget();
  const size = 70;
  let position;

  // Generate non-overlapping position with bonus target
  do {
    position = getRandomPosition(size);
  } while (isOverlapping(position, size, bonusTargetPos, 90));

  smallTargetPos = position;

  const smallImg = document.createElement("img");
  smallImg.src = "assets/anoma-logo.png.jpg";
  smallImg.className = "target small";
  setStyle(smallImg, position.x, position.y, size);

  smallImg.addEventListener("click", (e) => {
    e.stopPropagation();
    updateScore(1);
    console.log("Small target clicked, +1");
    clearSmallTarget();
    spawnSmallTarget();
  });

  gameArea.appendChild(smallImg);
  smallTargetTimeout = setTimeout(() => {
    clearSmallTarget();
    if (timeLeft > 0) spawnSmallTarget();
  }, disappearSmallTime);
}

// --- Spawn Bonus Target ---
function spawnBonusTarget() {
  clearBonusTarget();
  const size = 90;
  let position;

  // Generate non-overlapping position with small target
  do {
    position = getRandomPosition(size);
  } while (isOverlapping(position, size, smallTargetPos, 70));

  bonusTargetPos = position;

  const bonusImg = document.createElement("img");
  bonusImg.src = "assets/nanoma-logo.png.jpg";
  bonusImg.className = "target bonus";
  setStyle(bonusImg, position.x, position.y, size);

  bonusImg.addEventListener("click", (e) => {
    e.stopPropagation();
    updateScore(5);
    console.log("Bonus target clicked, +5");
    clearBonusTarget();
    spawnBonusTarget();
  });

  gameArea.appendChild(bonusImg);
  bonusTargetTimeout = setTimeout(() => {
    clearBonusTarget();
    if (timeLeft > 0) spawnBonusTarget();
  }, disappearBonusTime);
}

// --- Styling helper ---
function setStyle(img, left, top, size) {
  img.style.position = "absolute";
  img.style.left = `${left}px`;
  img.style.top = `${top}px`;
  img.style.width = `${size}px`;
  img.style.height = "auto";
  img.style.borderRadius = "50%";
  img.style.cursor = "pointer";
  img.style.transition = "transform 0.3s ease";
  img.style.boxShadow = "0 0 10px 4px white";
}

// --- Clear small target ---
function clearSmallTarget() {
  clearTimeout(smallTargetTimeout);
  const small = gameArea.querySelector(".small");
  if (small) {
    small.remove();
  }
  smallTargetPos = null;
}

// --- Clear bonus target ---
function clearBonusTarget() {
  clearTimeout(bonusTargetTimeout);
  const bonus = gameArea.querySelector(".bonus");
  if (bonus) {
    bonus.remove();
  }
  bonusTargetPos = null;
}

// --- Update score ---
function updateScore(amount) {
  score += amount;
  if (score < 0) score = 0;
  scoreDisplay.textContent = `Score: ${score}`;
  console.log(`Score updated: ${score}`);
}

// --- Penalize on clicking empty space ---
gameArea.addEventListener("click", () => {
  if (timeLeft > 0) {
    updateScore(-1);
    console.log("Penalty: -1 point for empty space click");
  }
});

// --- End game ---
function endGame() {
  clearInterval(timerInterval);
  clearSmallTarget();
  clearBonusTarget();
  gameScreen.classList.add("hidden");
  leaderboardScreen.classList.remove("hidden");
  console.log("Game ended!");
  // Integrate Firebase leaderboard or other end-game logic here
}
