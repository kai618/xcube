// function zoom in out
window.addEventListener("keydown", event => {
  if (event.key == "1" && scale > minZoomOut) scale -= 4;
  if (event.key == "2" && scale < maxZoomIn) scale += 4;
});

// hints for both modes
hints = {
  single: [
    "You need to collect all coins to win.",
    "Red is dangerous, remember that.",
    "So, you are a lone wolf right?",
    "Let's collect them all!!!"
  ],
  team: [
    "You need to collect all coins to win.",
    "Zooming out is automatic, cool right?",
    "If your friend dies, you die too.",
    "Red is dangerous, remember that.",
    "Two is better than one, it's so true.",
    "Use your friend's... head to jump even higher."
  ]
};

let singleInterval, teamInterval;

function changeHints(mode) {
  clearInterval(singleInterval);
  clearInterval(teamInterval);
  let pos = 0;

  const hintText = document.getElementById("hint-text");
  hintText.innerHTML = hints[mode][pos];

  if (mode == "team") {
    teamInterval = setInterval(() => {
      pos = (pos + 1) % hints.team.length;
      hintText.innerHTML = hints.team[pos];
    }, 5000);
  }
  if (mode == "single") {
    singleInterval = setInterval(() => {
      pos = (pos + 1) % hints.single.length;
      hintText.innerHTML = hints.single[pos];
    }, 5000);
  }
}

function floatVertical(element, distance, interval, animationTime = "2s") {
  let factor = 0;
  element.style.position = "relative";
  element.style.transition = animationTime;
  element.style.top = factor * distance + "px";
  setInterval(() => {
    factor = (factor + 1) % 2;
    element.style.top = factor * distance + "px";
  }, interval);
}

function floatHorizontal(element, distance, interval, animationTime = "2s") {
  let factor = 0;
  element.style.position = "relative";
  element.style.transition = animationTime;
  element.style.right = factor * distance + "px";
  setInterval(() => {
    factor = (factor + 1) % 2;
    element.style.right = factor * distance + "px";
  }, interval);
}

// hint div animation
const hintDiv = document.getElementById("hint");
hintDiv != null && floatVertical(hintDiv, 10, 1000);

// control div animation
const controlDiv = document.getElementById("control");
controlDiv != null && floatVertical(controlDiv, 10, 1200);

// choose mode
const teamBtn = document.getElementById("team-mode");
const singleBtn = document.getElementById("single-mode");

// mode function
const gameArea = document.getElementById("game-area");
const playerControlTable = document.getElementById("player2-control");

function onChangeMode(mode, maps) {
  gameArea.innerHTML = "";
  if (mode == "single") {
    isSingleMode = true;
    playerControlTable.style.display = "none";
  } else if (mode == "team") {
    isSingleMode = false;
    playerControlTable.style.display = "block";
  }
  runGame(maps, DOMDisplay, gameArea);
  changeHints(mode);
}
let isSingleMode = false;
``;

// won alert
function alertWon() {
  const alertBox = document.createElement("div");
  alertBox.className = "won-alert";
  alertBox.innerHTML = `
      <p class="won-text">you won!!!</p>
      <button class="sb-btn" onclick="location.reload()">again</button>
  `;
  gameArea.appendChild(alertBox);
}

document
  .getElementById("logoText")
  .addEventListener("click", () => location.reload());
