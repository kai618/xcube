function getCustomMaps() {
  const maps = JSON.parse(localStorage.getItem("maps"));
  if (maps == null) return [];
  return maps;
}

function displayNoMap() {
  let gameArea = document.getElementById("game-area");
  let wrapper = document.createElement("div");
  wrapper.id = "wrapper";
  let noMap = document.createElement("div");
  noMap.id = "noMap";
  noMap.innerText =
    "It seems like... \nYou are being lazy, \nSo go and create something cool.";
  let sandBoxImg = document.createElement("img");
  sandBoxImg.id = "sandBoxImg";
  sandBoxImg.src = "./img/sandbox.png";
  let link = document.createElement("a");
  link.href = "sandbox.html";
  link.appendChild(sandBoxImg);
  wrapper.appendChild(noMap);
  wrapper.appendChild(link);
  gameArea.appendChild(wrapper);
}

function checkMode(map) {
  if (map.split("").some(e => e == "&")) return "team";
  return "single";
}

function displayContent(customMaps) {
  if (customMaps.length == 0) {
    displayNoMap();
    let guide = document.getElementById("guide-tab");
    guide.innerHTML = "";
  } else {
    onChangeMode(checkMode(customMaps[0]), customMaps);
  }
}

const customMaps = getCustomMaps();
console.log(customMaps);
displayContent(customMaps);
