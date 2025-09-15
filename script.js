// --- Screens ---
const loginScreen = document.getElementById("login-screen");
const gameScreen = document.getElementById("game-screen");
const leaderboardScreen = document.getElementById("leaderboard-screen");

// --- Elements ---
const usernameInput = document.getElementById("username");
const startBtn = document.getElementById("start-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const restartBtn = document.getElementById("restart-btn");

const target = document.getElementById("target");
const gameArea = document.getElementById("game-area");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const leaderboardList = document.getElementById("leaderboard-list");

// --- Sounds ---
const hitSound = new Audio("hit.mp3"); // optional

// --- Game Variables ---
let username = "";
let score = 0;
let timeLeft = 25;
let timerInterval;
let disappearTimeout;
let disappearTime = 700; // initial disappearance speed

// --- Start Game ---
startBtn.addEventListener("click", () => {
  username = usernameInput.value.trim();
  if (!username) return alert("Please enter your name!");

  loginScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  score = 0;
  timeLeft = 25;
  disappearTime = 700;
  scoreDisplay.textContent = `Score: ${score}`;
  timerDisplay.textContent = `Time: ${timeLeft}s`;

  moveTarget(); // start first target

  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `Time: ${timeLeft}s`;

    // Gradually increase difficulty
    if (timeLeft % 5 === 0 && disappearTime > 400) {
      disappearTime -= 50;
    }

    if (timeLeft <= 0) endGame();
  }, 1000);
});

// --- Restart / Play Again ---
restartBtn.addEventListener("click", () => location.reload());
playAgainBtn.addEventListener("click", () => location.reload());

// --- Move target randomly ---
function moveTarget() {
  const areaWidth = gameArea.clientWidth - target.clientWidth; // ensure full width
  const areaHeight = gameArea.clientHeight - target.clientHeight; // ensure full height

  // Generate random position with small buffer from edges
  let x, y;
  do {
    x = Math.random() * areaWidth;
    y = Math.random() * areaHeight;
  } while (target.dataset.lastX == x && target.dataset.lastY == y);

  target.dataset.lastX = x;
  target.dataset.lastY = y;

  // Apply position
  target.style.left = `${x}px`;
  target.style.top = `${y}px`;
  target.style.display = "block";

  // Positive target setup
  target.style.backgroundImage = "url('assets/preep-logo.png')";
  target.style.backgroundColor = "transparent";
  target.style.boxShadow = "0 0 10px #fff";
  target.style.transform = "scale(0)";
  setTimeout(() => target.style.transform = "scale(1)", 50);

  // Disappear after time
  clearTimeout(disappearTimeout);
  disappearTimeout = setTimeout(() => {
    target.style.display = "none";
    if (timeLeft > 0) setTimeout(moveTarget, 200);
  }, disappearTime);
}

// --- Target click ---
target.addEventListener("click", () => {
  target.style.display = "none";
  clearTimeout(disappearTimeout);

  // Floating feedback
  const feedback = document.createElement("div");
  feedback.className = "score-feedback";
  feedback.textContent = "+1";
  feedback.style.left = target.style.left;
  feedback.style.top = target.style.top;
  gameArea.appendChild(feedback);
  setTimeout(() => feedback.remove(), 800);

  score++;
  scoreDisplay.textContent = `Score: ${score}`;
  scoreDisplay.style.color = "#0f0";
  setTimeout(() => scoreDisplay.style.color = "#fff", 200);

  // Scale-up click animation
  target.style.transform = "scale(1.2)";
  setTimeout(() => target.style.transform = "scale(1)", 100);

  setTimeout(moveTarget, 100);
});

// --- End the game ---
function endGame() {
  clearInterval(timerInterval);
  clearTimeout(disappearTimeout);
  target.style.display = "none";
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
