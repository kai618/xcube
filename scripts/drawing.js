// All reality is a game.

class State {
  constructor(level, actors, status) {
    this.level = level;
    this.actors = actors;
    this.status = status;
  }

  static start(level) {
    return new State(level, level.startActors, "playing");
  }

  getPlayer(id) {
    return this.actors.find(a => a.type == "player" && a.id == id);
  }
}

class Vec {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  plus(other) {
    return new Vec(this.x + other.x, this.y + other.y);
  }
  times(factor) {
    return new Vec(this.x * factor, this.y * factor);
  }
}

class Player {
  constructor(pos, speed, id) {
    this.pos = pos;
    this.speed = speed;
    this.id = id;
  }

  get type() {
    return "player";
  }

  static create(pos, ch) {
    if (ch == "@") {
      return new Player(pos.plus(new Vec(0, -0.5)), new Vec(0, 0), 0);
    } else if (ch == "&") {
      return new Player(pos.plus(new Vec(0, -0.5)), new Vec(0, 0), 1);
    }
  }
}

Player.prototype.size = new Vec(0.8, 1.5);

class Lava {
  constructor(pos, speed, reset) {
    this.pos = pos;
    this.speed = speed;
    this.reset = reset;
  }

  get type() {
    return "lava";
  }

  static create(pos, ch) {
    if (ch == "=") {
      return new Lava(pos, new Vec(2, 0));
    } else if (ch == "|") {
      return new Lava(pos, new Vec(0, 2));
    } else if (ch == "v") {
      return new Lava(pos, new Vec(0, 3), pos);
    }
  }
}
Lava.prototype.size = new Vec(1, 1);

class Coin {
  constructor(pos, basePos, wobble) {
    this.pos = pos;
    this.basePos = basePos;
    this.wobble = wobble;
  }

  get type() {
    return "coin";
  }

  static create(pos) {
    let basePos = pos.plus(new Vec(0.2, 0.1));
    return new Coin(basePos, basePos, Math.random() * Math.PI * 2);
  }
}

Coin.prototype.size = new Vec(0.6, 0.6);

const levelChars = {
  ".": "empty",
  "#": "wall",
  "+": "lava",
  "@": Player,
  "&": Player,
  o: Coin,
  "=": Lava,
  "|": Lava,
  v: Lava
};

class Level {
  constructor(plan) {
    let rows = plan
      .trim()
      .split("\n")
      .map(l => [...l]);

    this.height = rows.length;
    this.width = rows[0].length;
    this.startActors = [];

    this.rows = rows.map((row, y) => {
      return row.map((ch, x) => {
        let type = levelChars[ch];
        if (typeof type == "string") return type;
        this.startActors.push(type.create(new Vec(x, y), ch));
        return "empty";
      });
    });
  }
}

// render
function elt(name, attrs, ...children) {
  let dom = document.createElement(name);
  for (let attr of Object.keys(attrs)) {
    dom.setAttribute(attr, attrs[attr]);
  }
  for (let child of children) {
    dom.appendChild(child);
  }
  return dom;
}

class DOMDisplay {
  constructor(parent, level) {
    this.scale = scale;
    this.dom = elt("div", { class: "game" }, drawGrid(level));
    this.actorLayer = null;
    this.parent = parent;
    parent.appendChild(this.dom);
  }

  clear() {
    this.dom.remove();
  }
}

function drawGrid(level) {
  return elt(
    "table",
    {
      class: "background",
      style: `width: ${level.width * scale}px`
    },
    ...level.rows.map(row =>
      elt(
        "tr",
        { style: `height: ${scale}px` },
        ...row.map(type => elt("td", { class: type })) // type is the character itself
      )
    )
  );
}

function drawActors(actors) {
  return elt(
    "div",
    {},
    ...actors.map(actor => {
      let otherClass = "";
      if (actor.id === 1) otherClass = "player2";
      let rect = elt("div", { class: `actor ${actor.type} ${otherClass}` });
      rect.style.width = `${actor.size.x * scale}px`;
      rect.style.height = `${actor.size.y * scale}px`;
      rect.style.left = `${actor.pos.x * scale}px`;
      rect.style.top = `${actor.pos.y * scale}px`;
      return rect;
    })
  );
}

/* 
The syncState method is used to make the display show a given state. 
It first removes the old actor graphics, if any, and then redraws the actors in their new positions.
*/
DOMDisplay.prototype.syncState = function(state) {
  if (this.actorLayer) this.actorLayer.remove();

  // change grid here
  if (this.scale !== scale) {
    this.scale = scale;
    this.dom.firstChild.remove();
    this.dom.appendChild(drawGrid(state.level));
  }

  this.actorLayer = drawActors(state.actors);
  this.dom.appendChild(this.actorLayer);
  this.dom.className = `game ${state.status}`;
  this.scrollPlayerIntoView(state);
};

/*
 This ensures that if the level is protruding outside the viewport, we scroll that viewport to make sure the player is near its center
*/

DOMDisplay.prototype.scrollPlayerIntoView = function(state) {
  let width = this.dom.clientWidth;
  let height = this.dom.clientHeight;
  let factor = 3;

  let player1 = state.getPlayer(0);
  let center1 = player1.pos // get the center coordinates of the P1
    .plus(player1.size.times(0.5)) // to find the center of the P1
    .times(scale); // convert to pixels
  let center = center1;

  if (!isSingleMode) {
    let player2 = state.getPlayer(1);
    let center2 = player2.pos.plus(player2.size.times(0.5)).times(scale);
    center = center.plus(center2).times(0.5);
    factor = 2;

    let distanceX = Math.abs(center1.x - center2.x);
    let distanceY = Math.abs(center1.y - center2.y);
    if (distanceX > width * 0.85 || distanceY > height * 0.85) {
      if (scale > minZoomOut) scale -= 4;
    }
    maxZoomIn = 52 - Math.max(distanceX, distanceY) / scale;
  }

  let marginWidth = width / factor; // the distance from the horizontal borders
  let left = this.dom.scrollLeft,
    right = left + width;

  if (center.x < left + marginWidth) {
    this.dom.scrollLeft = center.x - marginWidth; // minus numbers all equals 0
  } else if (center.x > right - marginWidth) {
    this.dom.scrollLeft = center.x + marginWidth - width;
  }

  let marginHeight = height / factor; // the distance from the vertical borders
  let top = this.dom.scrollTop,
    bottom = top + height;

  if (center.y < top + marginHeight) {
    this.dom.scrollTop = center.y - marginHeight;
  } else if (center.y > bottom - marginHeight) {
    this.dom.scrollTop = center.y + marginHeight - height;
  }
};

// collision
Level.prototype.touches = function(pos, size, type) {
  var xStart = Math.floor(pos.x);
  var xEnd = Math.ceil(pos.x + size.x);
  var yStart = Math.floor(pos.y);
  var yEnd = Math.ceil(pos.y + size.y);

  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      let isOutside = x < 0 || x >= this.width || y < 0 || y >= this.height;
      let here = isOutside ? "wall" : this.rows[y][x];
      if (here == type) return true;
    }
  }
  return false;
};

State.prototype.update = function(time, arrowKeys) {
  let actors = this.actors.map(actor => {
    return actor.update(time, this, arrowKeys[actor.id]);
  });
  let newState = new State(this.level, actors, this.status);
  if (newState.status != "playing") return newState;

  // player 1
  let player1 = newState.getPlayer(0);
  if (this.level.touches(player1.pos, player1.size, "lava")) {
    return new State(this.level, actors, "lost");
  }

  for (let actor of actors) {
    if (actor.type != "player" && overlap(actor, player1)) {
      newState = actor.collide(newState);
    }
  }

  // player 2
  if (!isSingleMode) {
    let player2 = newState.getPlayer(1);

    if (this.level.touches(player2.pos, player2.size, "lava")) {
      return new State(this.level, actors, "lost");
    }

    for (let actor of actors) {
      if (actor.type != "player" && overlap(actor, player2)) {
        newState = actor.collide(newState);
      }
    }
  }

  return newState;
};

function overlap(actor1, actor2) {
  return (
    actor1.pos.x + actor1.size.x > actor2.pos.x &&
    actor1.pos.x < actor2.pos.x + actor2.size.x &&
    actor1.pos.y + actor1.size.y > actor2.pos.y &&
    actor1.pos.y < actor2.pos.y + actor2.size.y
  );
}

Lava.prototype.collide = function(state) {
  return new State(state.level, state.actors, "lost");
};

Coin.prototype.collide = function(state) {
  let filtered = state.actors.filter(a => a != this);
  let status = state.status;
  if (!filtered.some(a => a.type == "coin")) status = "won";
  return new State(state.level, filtered, status);
};

Lava.prototype.update = function(time, state) {
  // time step
  let newPos = this.pos.plus(this.speed.times(time));
  if (!state.level.touches(newPos, this.size, "wall")) {
    return new Lava(newPos, this.speed, this.reset);
  } else if (this.reset) {
    return new Lava(this.reset, this.speed, this.reset);
  } else {
    return new Lava(this.pos, this.speed.times(-1));
  }
};

const wobbleSpeed = 8,
  wobbleDist = 0.07;

Coin.prototype.update = function(time) {
  let wobble = this.wobble + time * wobbleSpeed;
  let wobblePos = Math.sin(wobble) * wobbleDist;
  return new Coin(
    this.basePos.plus(new Vec(0, wobblePos)),
    this.basePos,
    wobble
  );
};

// Player
const playerXSpeed = 7;
const gravity = 30;
const jumpSpeed = 17;

Player.prototype.update = function(time, state, keys) {
  let xSpeed = 0;
  if (keys.left) xSpeed -= playerXSpeed;
  if (keys.right) xSpeed += playerXSpeed;
  let pos = this.pos;
  let movedX = pos.plus(new Vec(xSpeed * time, 0));

  if (
    !(!isSingleMode && touchPlayer(movedX, this.id)) &&
    !state.level.touches(movedX, this.size, "wall")
  ) {
    pos = movedX;
  }

  let ySpeed = this.speed.y + time * gravity;
  let movedY = pos.plus(new Vec(0, ySpeed * time));
  if (
    !(!isSingleMode && touchPlayer(movedY, this.id)) &&
    !state.level.touches(movedY, this.size, "wall")
  ) {
    pos = movedY;
  } else if (keys.up && ySpeed > 0) {
    ySpeed = -jumpSpeed;
  } else {
    ySpeed = 0;
  }
  return new Player(pos, new Vec(xSpeed, ySpeed), this.id);

  // check two players are touching or not
  function touchPlayer(thisNewPos, thisId) {
    const futureThis = new Player(thisNewPos);
    const other = state.actors.find(a => a.type == "player" && a.id != thisId);
    return overlap(futureThis, other);
  }
};

// track keys
function trackKeys(keys) {
  let down = {};
  function track(event) {
    event.preventDefault();
    if (keys.includes(event.code)) {
      if (event.code == keys[0]) down.up = event.type == "keydown";
      if (event.code == keys[1]) down.left = event.type == "keydown";
      if (event.code == keys[2]) down.right = event.type == "keydown";
    }
  }
  window.addEventListener("keydown", track);
  window.addEventListener("keyup", track);

  return down;
}

// keydown: true, keyup: false
const arrowKeysP1 = trackKeys(["KeyW", "KeyA", "KeyD"]);
const arrowKeysP2 = trackKeys(["ArrowUp", "ArrowLeft", "ArrowRight"]);
const keys = [arrowKeysP1, arrowKeysP2];

// run the game

function runAnimation(frameFunc) {
  let lastTime = null;
  requestAnimationFrame(frame);

  function frame(time) {
    if (lastTime != null) {
      let timeStep = Math.min(time - lastTime, 100) / 1000;
      if (frameFunc(timeStep) === false) return;
    }
    lastTime = time;
    requestAnimationFrame(frame);
  }
}

function runLevel(level, Display, parent) {
  let display = new Display(parent, level);
  let state = State.start(level);
  let ending = 1;

  return new Promise(resolve => {
    runAnimation(time => {
      state = state.update(time, keys);
      display.syncState(state);
      if (state.status == "playing") {
        return true;
      } else if (ending > 0) {
        ending -= time;
        return true;
      } else {
        display.clear();
        resolve(state.status);
        return false;
      }
    });
  });
}

async function runGame(plans, Display, container) {
  for (let level = 0; level < plans.length; ) {
    let status = await runLevel(new Level(plans[level]), Display, container);
    if (status == "won") level++;
  }
  alertWon();
}

let scale = 24; // 4n
let maxZoomIn = 48;
let minZoomOut = 12;
