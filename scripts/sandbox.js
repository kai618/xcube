let basePlan = `
...........................................
...........................................
...........................................
...........................................
...........................................
..........................o................
...........................................
..................o........................
...........................................
...........................................
...........................................
..........@.........#....###...............
........#########+++#......................
................#####......................
...........................................
...........................................
...........................................
...........................................`;

function getGrid(plan) {
  return plan
    .trim()
    .split("\n")
    .map(l => [...l]);
}

function createTable(grid) {
  return elt(
    "table",
    {
      id: "sandbox",
      style: `width: ${scale * grid[0].length}px; height: ${scale *
        grid.length}px`
    },
    ...grid.map((row, i) =>
      elt(
        "tr",
        { class: "sb-row" },
        ...row.map((cell, j) =>
          elt("td", {
            id: `${i} ${j}`,
            class: getClassType(cell),
            style: `width: ${scale}px; height: ${scale}px`,
            onclick: "changeType(this)",
            onmouseenter: "floodType(this)"
          })
        )
      )
    )
  );
}

function getClassType(ch) {
  const names = {
    ".": "sb-empty",
    "#": "sb-wall",
    "+": "sb-lava",
    "@": "sb-player1",
    "&": "sb-player2",
    o: "sb-coin",
    "=": "sb-hor-lava",
    "|": "sb-vert-lava",
    v: "sb-drip-lava"
  };
  return names[ch];
}

function changeType(element) {
  element.className = `${getClassType(gridType)}`;

  const id = element.id.split(" ").map(e => Number(e));
  grid[id[0]][id[1]] = gridType;

  setCustomMaps(grid);
}

// function zoom in out
document.addEventListener("keydown", event => {
  if (event.key == "-" && scale > minZoomOut) {
    reloadTable(-4);
  }

  if (event.key == "+" && scale < maxZoomIn) {
    reloadTable(4);
  }
});

document
  .getElementById("zoom-minus")
  .addEventListener("click", () => scale > minZoomOut && reloadTable(-4));

document
  .getElementById("zoom-plus")
  .addEventListener("click", () => scale < maxZoomIn && reloadTable(4));

function reloadTable(num = 0) {
  scale += num;
  tableArea.innerHTML = "";
  tableArea.appendChild(createTable(grid));
  setCursor(gridType);
  setCustomMaps(grid);
}

// animation right sidebar
floatVertical(document.getElementById("sb-control"), 10, 2000);
floatHorizontal(document.getElementById("zoom-change"), 5, 3000, "3s");
floatHorizontal(document.getElementById("col-change"), 4, 2800, "3s");
floatHorizontal(document.getElementById("row-change"), 7, 3000, "3s");

// key listener
const keyInfo = { old: getKey() };
const controls = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
document.addEventListener("keydown", event => {
  let key = event.key;
  if (controls.includes(key)) changeAll(key);
});

function changeTypeClick(element) {
  let key = element.id;
  changeAll(key);
}

function changeAll(key) {
  switch (key) {
    case "1":
      gridType = ".";
      break;
    case "2":
      gridType = "#";
      break;
    case "3":
      gridType = "+";
      break;
    case "4":
      gridType = "o";
      break;
    case "5":
      gridType = "=";
      break;
    case "6":
      gridType = "|";
      break;
    case "7":
      gridType = "v";
      break;
    case "8":
      gridType = "@";
      break;
    case "9":
      gridType = "&";
      break;
  }
  const elements = document.getElementById("sandbox-control-btn").children;
  elements[keyInfo.old - 1].className = "";
  elements[Number(key) - 1].className = "chosen";
  keyInfo.old = Number(key);

  setCursor(gridType);
  setKey(key);
}

function setCursor(gridType) {
  const sandbox = document.getElementById("sandbox");
  switch (gridType) {
    case ".":
      sandbox.style.cursor = "url('../img/cur/emptyCursor.cur'),auto"; // Empty
      break;
    case "#":
      sandbox.style.cursor = "url('../img/cur/wallCursor.cur'),auto"; // Wall
      break;
    case "+":
      sandbox.style.cursor = "url('../img/cur/lavaCursor.cur'),auto"; // Lava
      break;
    case "o":
      sandbox.style.cursor = "url('../img/cur/coinCursor.cur') ,auto"; // Coin
      break;
    case "=":
      sandbox.style.cursor = "url('../img/cur/horCursor.cur'),auto"; // Hor lava
      break;
    case "|":
      sandbox.style.cursor = "url('../img/cur/verCursor.cur'),auto"; // Ver lava
      break;
    case "v":
      sandbox.style.cursor = "url('../img/cur/dripCursor.cur'),auto"; // Drip lava
      break;
    case "@":
      sandbox.style.cursor = "url('../img/cur/player1.cur'),auto"; // Player 1
      break;
    case "&":
      sandbox.style.cursor = "url('../img/cur/player2.cur'),auto"; // Player 2
      break;
  }
}

// save grid
function getPlan(grid) {
  let plan = "";
  for (let row of grid) {
    for (let e of row) {
      plan += e;
    }
    plan += "\n";
  }
  return plan;
}

document.getElementById("save-btn").addEventListener("click", () => {
  const plan = getPlan(grid);

  if (plan.includes("@")) {
    localStorage.setItem("maps", JSON.stringify([plan]));
    // notify
    location.replace("/custom.html");
  } else {
    alert("Need at least one player 1");
  }
});

// clear table
document.getElementById("clear-btn").addEventListener("click", () => {
  popQueryBox("Are you sure?", () => {
    grid = grid.map(row => row.map(() => "."));
    reloadTable();
  });
});

// query box
function popQueryBox(question, yesDo = () => {}, noDo = () => {}) {
  const boxView = document.createElement("div");
  boxView.className = "query-box-view";

  const box = document.createElement("div");
  box.className = "query-box";

  const query = document.createElement("div");
  query.innerHTML = `<p>${question}</p>`;

  const answerTab = document.createElement("div");
  const yesBtn = document.createElement("button");
  yesBtn.innerHTML = "Yes";
  yesBtn.addEventListener("click", doYesOpt);

  const noBtn = document.createElement("button");
  noBtn.innerHTML = "No";
  noBtn.addEventListener("click", doNoOpt);

  answerTab.appendChild(yesBtn);
  answerTab.appendChild(noBtn);
  box.appendChild(query);
  box.appendChild(answerTab);

  fadeIn(boxView, document.body, 0.6, 20);
  fadeIn(box, document.body, 1, 20);

  function doYesOpt() {
    yesDo();
    popOut();
  }

  function doNoOpt() {
    noDo();
    popOut();
  }

  function popOut() {
    document.body.removeChild(box);
    document.body.removeChild(boxView);
  }
}

// fade in
function fadeIn(element, container, maxOpacity, slowness) {
  let opacity = 0;
  element.style.opacity = 0;
  container.appendChild(element);

  const occur = setInterval(() => {
    opacity += 0.1;
    element.style.opacity = opacity;
    if (opacity >= maxOpacity) clearInterval(occur);
  }, slowness);
}

// row changing function

document.getElementById("row-plus").addEventListener("click", () => {
  const emptyRow = [];
  for (let i = 0, len = grid[0].length; i < len; i++) {
    emptyRow.push(".");
  }
  grid.push(emptyRow);
  reloadTable();
});

document.getElementById("row-minus").addEventListener("click", () => {
  grid.pop();
  reloadTable();
});

document.getElementById("col-plus").addEventListener("click", () => {
  grid.forEach(row => row.push("."));
  reloadTable();
});

document.getElementById("col-minus").addEventListener("click", () => {
  grid.forEach(row => row.splice(row.length - 1, 1));
  reloadTable();
});

// quickly flood cells with elements
function trackKeys(keys) {
  let down = {};
  function track(event) {
    event.preventDefault();
    if (keys.includes(event.code)) {
      if (event.code == keys[0]) down.ctrlL = event.type == "keydown";
      if (event.code == keys[1]) down.q = event.type == "keydown";
      if (event.code == keys[2]) down.w = event.type == "keydown";
    }

    if (down.ctrlL) document.getElementById("ctrl-btn").className = "chosen";
    else document.getElementById("ctrl-btn").className = "";
  }
  window.addEventListener("keydown", track);
  window.addEventListener("keyup", track);

  return down;
}
const isPressed = trackKeys(["ControlLeft", "KeyQ", "KeyW"]);

function floodType(element) {
  if (isPressed.ctrlL) changeType(element);
}

function getCustomMaps() {
  const maps = JSON.parse(localStorage.getItem("custom"));
  if (maps == null) return [];
  return maps;
}

function setCustomMaps(grid) {
  localStorage.setItem("custom", JSON.stringify([getPlan(grid)]));
}

// save grid type
function setKey(key) {
  localStorage.setItem("key", key);
}

function getKey() {
  const key = localStorage.getItem("key");
  return key == null ? 1 : key;
}

let gridType = ".";
scale = 28;
maxZoomIn = 60;
let grid = getGrid(basePlan);

const maps = getCustomMaps();
if (maps.length != 0) grid = getGrid(maps[0]);

const tableArea = document.getElementById("table-area");
tableArea.appendChild(createTable(grid));
changeAll(getKey());
