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

const maxTargets = 3; // max simultaneous targets
let activeTargets = [];
let comboCount = 0; // combo multiplier count

// --- Sounds ---
const hitSound = new Audio("hit.mp3");
const bonusSound = new Audio("bonus.mp3"); // add a sound for bonus targets
const missSound = new Audio("miss.mp3");

// --- Game Variables ---
let username = "";
let score = 0;
let timeLeft = 60;
let timerInterval;
let disappearTime = 1000; // start disappearance speed in ms

// --- Start Game ---
startBtn.addEventListener("click", () => {
  username = usernameInput.value.trim();
  if (!username) return alert("Please enter your name!");

  loginScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  score = 0;
  comboCount = 0;
  timeLeft = 60;
  disappearTime = 1000;
  scoreDisplay.textContent = `Score: ${score}`;
  timerDisplay.textContent = `Time: ${timeLeft}s`;
  document.body.style.backgroundColor = "#000"; // reset background color

  activeTargets.forEach(t => removeTarget(t));
  activeTargets = [];

  // Spawn initial targets
  for (let i = 0; i < maxTargets; i++) {
    createAndMoveTarget();
  }

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}s`;

    // Change background color gradually as time runs out
    const greenValue = Math.max(50, (timeLeft / 60) * 255);
    document.body.style.backgroundColor = `rgb(0, ${greenValue}, 0)`;

    // Gradually increase difficulty with disappear speed
    if (timeLeft % 5 === 0 && disappearTime > 600) {
      disappearTime -= 30;
    }

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
});

// --- Restart / Play Again ---
restartBtn.addEventListener("click", () => location.reload());
playAgainBtn.addEventListener("click", () => location.reload());

// --- Create a Target ---
function createTarget(type = "normal") {
  const target = document.createElement("div");
  target.className = "target";
  target.style.position = "absolute";
  target.style.backgroundSize = "cover";
  target.style.borderRadius = "50%";
  target.style.cursor = "pointer";
  target.dataset.type = type;

  if (type === "normal") {
    target.style.backgroundImage = "url('assets/preep-logo.png')";
  } else if (type === "bonus") {
    target.style.backgroundImage = "url('assets/bonus-logo.png')";
    target.style.boxShadow = "0 0 15px gold";
  }

  gameArea.appendChild(target);
  return target;
}

// --- Move Target Randomly with size and animations ---
function moveTarget(target) {
  const buffer = 10; // edge padding in px
  const areaWidth = gameArea.clientWidth;
  const areaHeight = gameArea.clientHeight;

  // Random size between 40 and 80 px to vary difficulty
  const size = Math.floor(Math.random() * 40) + 40;
  target.style.width = `${size}px`;
  target.style.height = `${size}px`;

  const maxX = areaWidth - size - buffer;
  const maxY = areaHeight - size - buffer;
  const minX = buffer;
  const minY = buffer;

  // Random position for the target
  const x = Math.random() * (maxX - minX) + minX;
  const y = Math.random() * (maxY - minY) + minY;

  target.style.left = `${x}px`;
  target.style.top = `${y}px`;
  target.style.display = "block";

  // Animation: scale from 0 to 1 smoothly
  target.style.transform = "scale(0)";
  setTimeout(() => {
    target.style.transition = "transform 0.3s ease";
    target.style.transform = "scale(1)";
  }, 20);

  // Clear previous disappear timeout if any
  if (target.disappearTimeout) clearTimeout(target.disappearTimeout);

  // Disappear after disappearTime ms
  target.disappearTimeout = setTimeout(() => {
    removeTarget(target);
    if (timeLeft > 0) createAndMoveTarget();
    comboCount = 0; // reset combo if miss target disappears
  }, disappearTime);
}

// --- Remove Target from DOM and active list ---
function removeTarget(target) {
  if (!target) return;
  if (target.disappearTimeout) clearTimeout(target.disappearTimeout);
  target.remove();
  activeTargets = activeTargets.filter(t => t !== target);
}

// --- Create and Move Target, with random bonus chance ---
function createAndMoveTarget() {
  if (activeTargets.length >= maxTargets) return;

  const isBonus = Math.random() < 0.15; // 15% chance for bonus target
  const target = createTarget(isBonus ? "bonus" : "normal");
  activeTargets.push(target);
  moveTarget(target);
}

// --- On Target Click ---
gameArea.addEventListener("click", (event) => {
  if (!event.target.classList.contains("target") || timeLeft <= 0) {
    // Penalty for clicking outside targets
    if (timeLeft > 0) {
      score = Math.max(0, score - 1);
      comboCount = 0;
      scoreDisplay.textContent = `Score: ${score}`;
      scoreDisplay.style.color = "#f00";
      missSound.play();

      // Penalty feedback
      showFeedback("-1", event.clientX, event.clientY, "penalty");
    }
    return;
  }

  // Valid target clicked
  const target = event.target;
  const type = target.dataset.type;

  removeTarget(target);
  createAndMoveTarget();

  if (type === "bonus") {
    score += 5;
    timeLeft = Math.min(60, timeLeft + 5); // 5 second bonus time
    bonusSound.play();
    showFeedback("+5 Bonus!", event.clientX, event.clientY, "bonus");
  } else {
    comboCount++;
    const comboMultiplier = Math.min(5, comboCount);
    score += comboMultiplier;
    hitSound.play();
    showFeedback(`+${comboMultiplier}`, event.clientX, event.clientY, "normal");
  }

  scoreDisplay.textContent = `Score: ${score}`;
  scoreDisplay.style.color = "#0f0";
  setTimeout(() => scoreDisplay.style.color = "#fff", 300);
});

// --- Show floating feedback ---
function showFeedback(text, x, y, type) {
  const feedback = document.createElement("div");
  feedback.textContent = text;
  feedback.className = "score-feedback";
  if (type === "penalty") feedback.classList.add("penalty");
  else if (type === "bonus") feedback.classList.add("bonus");
  feedback.style.position = "fixed";
  feedback.style.left = `${x}px`;
  feedback.style.top = `${y}px`;
  feedback.style.pointerEvents = "none";
  feedback.style.opacity = "1";
  feedback.style.transition = "all 0.8s ease-out";
  document.body.appendChild(feedback);

  setTimeout(() => {
    feedback.style.top = `${y - 50}px`;
    feedback.style.opacity = "0";
  }, 50);

  setTimeout(() => feedback.remove(), 850);
}

// --- End the game ---
function endGame() {
  clearInterval(timerInterval);
  activeTargets.forEach(t => removeTarget(t));
  activeTargets = [];
  gameScreen.classList.add("hidden");
  leaderboardScreen.classList.remove("hidden");
  saveScoreFirebase(username, score);
  firebase.analytics().logEvent('game_finished', { username, score });
}

// --- Save Score to Firebase ---
function saveScoreFirebase(name, score) {
  const userRef = firebase.firestore().collection("leaderboard").doc(name);
  userRef.get().then((doc) => {
    if (doc.exists) {
      if (score > doc.data().score) userRef.set({ score });
    } else {
      userRef.set({ score });
    }
  }).finally(() => showLeaderboardFirebase());
}

// --- Show Leaderboard ---
function showLeaderboardFirebase() {
  firebase.firestore()
    .collection("leaderboard")
    .orderBy("score", "desc")
    .limit(5)
    .get()
    .then((snapshot) => {
      leaderboardList.innerHTML = "";
      let rank = 1;
      snapshot.forEach(doc => {
        leaderboardList.innerHTML += `<li>${rank}. ${doc.id} - ${doc.data().score}</li>`;
        rank++;
      });
    });
}
