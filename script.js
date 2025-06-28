// --- Main Game Variables and UI Elements ---
const gameArea = document.getElementById("gameArea");
const scoreDisplay = document.getElementById("score");
const communityDisplay = document.getElementById("communityCount");
const levelDisplay = document.getElementById("level");
const startBtn = document.getElementById("startBtn");
const gameOverDisplay = document.getElementById("gameOver");
const speedBtn = document.getElementById("speedBtn");

let score = 0, coins = 0, level = 1;
let communities = [], pollutants = [], towers = [], bullets = [];
let gameInterval, intervalDelay = 300, speedMultiplier = 1, speedLevelIndex = 0;
let maxPollutants = 10, spawnedPollutants = 0;
let communityBaseHealth = 100, towerBaseHealth = 100;
let gameActive = false;
let speedLevels = [1, 10, 100];
let towerStats = { range: 60, power: 100, speed: 1.0, health: 100 };

// --- Coin panel UI ---
const coinPanel = document.createElement("div");
coinPanel.id = "coinPanel";
coinPanel.style.margin = "20px auto";
coinPanel.style.textAlign = "center";
coinPanel.style.width = "max-content";
coinPanel.style.minWidth = "700px"; // You can adjust this value as needed
coinPanel.style.padding = "16px 24px";
coinPanel.style.borderRadius = "12px";
coinPanel.style.boxShadow = "0 2px 12px #D7B99233";
coinPanel.style.background = "#FFF";
coinPanel.innerHTML = `
  <div style="font-size:18px;margin-bottom:8px;">
    🪙 Coins: <span id="coinCount">0</span>
  </div>
  <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px 0;">
    <div style="display:flex;gap:8px;margin-bottom:6px;">
      <button class="btn btn-warning" id="buyPower">+10 Tower Power (10 coins)</button>
      <button class="btn btn-warning" id="buyPower10">+100 Tower Power (100 coins)</button>
      <button class="btn btn-warning" id="buyPower100">+1000 Tower Power (1000 coins)</button>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:6px;">
      <button class="btn btn-info" id="buyRange">+10 Tower Range (10 coins)</button>
      <button class="btn btn-info" id="buyRange10">+100 Tower Range (100 coins)</button>
      <button class="btn btn-info" id="buyRange100">+1000 Tower Range (1000 coins)</button>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:6px;">
      <button class="btn btn-success" id="buySpeed">+0.2 Tower Speed (10 coins)</button>
      <button class="btn btn-success" id="buySpeed10">+2 Tower Speed (100 coins)</button>
      <button class="btn btn-success" id="buySpeed100">+20 Tower Speed (1000 coins)</button>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:6px;">
      <button class="btn btn-secondary" id="buyHealth">+20 Tower Health (10 coins)</button>
      <button class="btn btn-secondary" id="buyHealth10">+200 Tower Health (100 coins)</button>
      <button class="btn btn-secondary" id="buyHealth100">+2000 Tower Health (1000 coins)</button>
    </div>
  </div>
  <hr>
`;
document.body.appendChild(coinPanel);

// --- Coin logic ---
function updateCoins() {
  document.getElementById("coinCount").innerText = coins;
}

// --- Coin spend/upgrade logic ---
function showStatPopup(text, color) {
  const statLabel = document.createElement("div");
  statLabel.textContent = text;
  statLabel.style.position = "absolute";
  // Place popup near the coin panel (or center if not found)
  const panelRect = coinPanel.getBoundingClientRect();
  statLabel.style.left = (panelRect.left + panelRect.width / 2 - 30) + "px";
  statLabel.style.top = (panelRect.top - 30 + window.scrollY) + "px";
  statLabel.style.color = color;
  statLabel.style.fontWeight = "bold";
  statLabel.style.fontSize = "1.2rem";
  statLabel.style.pointerEvents = "none";
  statLabel.style.transition = "top 0.7s, opacity 0.7s";
  statLabel.style.opacity = "1";
  statLabel.style.zIndex = "9999";
  document.body.appendChild(statLabel);
  setTimeout(() => {
    statLabel.style.top = (parseInt(statLabel.style.top) - 30) + "px";
    statLabel.style.opacity = "0";
  }, 10);
  setTimeout(() => { statLabel.remove(); }, 700);
}

document.getElementById("buyPower").onclick = function () {
  if (coins >= 10) {
    coins -= 10;
    towerStats.power += 10;
    towers.forEach(tower => tower.el.dataset.power = towerStats.power);
    updateCoins();
    showStatPopup("+10 Power", "#28a745");
    playSfx(sfx.upgrade); // Play upgrade sound
  }
};
document.getElementById("buyPower10").onclick = function () {
  if (coins >= 100) {
    coins -= 100;
    towerStats.power += 100;
    towers.forEach(tower => tower.el.dataset.power = towerStats.power);
    updateCoins();
    showStatPopup("+100 Power", "#28a745");
    playSfx(sfx.upgrade);
  }
};
document.getElementById("buyPower100").onclick = function () {
  if (coins >= 1000) {
    coins -= 1000;
    towerStats.power += 1000;
    towers.forEach(tower => tower.el.dataset.power = towerStats.power);
    updateCoins();
    showStatPopup("+1000 Power", "#28a745");
    playSfx(sfx.upgrade);
  }
};

document.getElementById("buyRange").onclick = function () {
  if (coins >= 10) {
    coins -= 10;
    towerStats.range += 10;
    towers.forEach(tower => tower.el.dataset.range = towerStats.range);
    updateCoins();
    showStatPopup("+10 Range", "#007bff");
    playSfx(sfx.upgrade);
  }
};
document.getElementById("buyRange10").onclick = function () {
  if (coins >= 100) {
    coins -= 100;
    towerStats.range += 100;
    towers.forEach(tower => tower.el.dataset.range = towerStats.range);
    updateCoins();
    showStatPopup("+100 Range", "#007bff");
    playSfx(sfx.upgrade);
  }
};
document.getElementById("buyRange100").onclick = function () {
  if (coins >= 1000) {
    coins -= 1000;
    towerStats.range += 1000;
    towers.forEach(tower => tower.el.dataset.range = towerStats.range);
    updateCoins();
    showStatPopup("+1000 Range", "#007bff");
    playSfx(sfx.upgrade);
  }
};

document.getElementById("buySpeed").onclick = function () {
  if (coins >= 10) {
    coins -= 10;
    towerStats.speed += 0.2;
    towers.forEach(tower => tower.el.dataset.speed = towerStats.speed.toFixed(1));
    if (gameActive) restartGameInterval();
    updateCoins();
    showStatPopup("+0.2 Speed", "#17a2b8");
    playSfx(sfx.upgrade);
  }
};
document.getElementById("buySpeed10").onclick = function () {
  if (coins >= 100) {
    coins -= 100;
    towerStats.speed += 2;
    towers.forEach(tower => tower.el.dataset.speed = towerStats.speed.toFixed(1));
    if (gameActive) restartGameInterval();
    updateCoins();
    showStatPopup("+2 Speed", "#17a2b8");
    playSfx(sfx.upgrade);
  }
};
document.getElementById("buySpeed100").onclick = function () {
  if (coins >= 1000) {
    coins -= 1000;
    towerStats.speed += 20;
    towers.forEach(tower => tower.el.dataset.speed = towerStats.speed.toFixed(1));
    if (gameActive) restartGameInterval();
    updateCoins();
    showStatPopup("+20 Speed", "#17a2b8");
    playSfx(sfx.upgrade);
  }
};

document.getElementById("buyHealth").onclick = function () {
  if (coins >= 10) {
    coins -= 10;
    towerBaseHealth += 20;
    towers.forEach(tower => { if (tower.health > 0) tower.health += 20; setHpBar(tower.el, tower.health, towerBaseHealth); });
    updateCoins();
    showStatPopup("+20 Health", "#ffc107");
    playSfx(sfx.upgrade);
  }
};
document.getElementById("buyHealth10").onclick = function () {
  if (coins >= 100) {
    coins -= 100;
    towerBaseHealth += 200;
    towers.forEach(tower => { if (tower.health > 0) tower.health += 200; setHpBar(tower.el, tower.health, towerBaseHealth); });
    updateCoins();
    showStatPopup("+200 Health", "#ffc107");
    playSfx(sfx.upgrade);
  }
};
document.getElementById("buyHealth100").onclick = function () {
  if (coins >= 1000) {
    coins -= 1000;
    towerBaseHealth += 2000;
    towers.forEach(tower => { if (tower.health > 0) tower.health += 2000; setHpBar(tower.el, tower.health, towerBaseHealth); });
    updateCoins();
    showStatPopup("+2000 Health", "#ffc107");
    playSfx(sfx.upgrade);
  }
};

// --- Speed Button ---
speedBtn.addEventListener("click", () => {
  speedLevelIndex = (speedLevelIndex + 1) % speedLevels.length;
  speedMultiplier = speedLevels[speedLevelIndex];
  speedBtn.textContent = `Speed x${speedMultiplier}`;
  if (gameActive) restartGameInterval();
});

// --- Start Button ---
startBtn.addEventListener("click", startGame);

// --- Game Loop Interval ---
function restartGameInterval() {
  clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    if (spawnedPollutants < maxPollutants) createPollutant();
    updateGame();
  }, intervalDelay / (towerStats.speed * speedMultiplier));
}

// --- Utility Functions ---
function isOverlapping(x, y, size, arr, arrSize) {
  return arr.some(obj => {
    const dx = obj.x - x, dy = obj.y - y, dist = Math.sqrt(dx * dx + dy * dy);
    return dist < (size / 2 + arrSize / 2 + 10);
  });
}

// --- Tooltip that follows mouse ---
function attachTooltipFollow(div, getHTML) {
  let tooltip = null;
  let removeTooltip = () => {
    if (tooltip) {
      tooltip.remove();
      tooltip = null;
    }
    div.removeEventListener("mousemove", mousemoveHandler);
    div._tooltip = null;
  };
  function mousemoveHandler(e) {
    if (tooltip) {
      tooltip.style.left = (e.pageX + 20) + "px";
      tooltip.style.top = (e.pageY + 10) + "px";
    }
  }
  div.addEventListener("mouseenter", function (e) {
    if (tooltip) removeTooltip();
    tooltip = document.createElement("div");
    tooltip.className = "pollutant-tooltip";
    tooltip.innerHTML = getHTML();
    document.body.appendChild(tooltip);
    mousemoveHandler(e);
    div._tooltip = tooltip;
    div.addEventListener("mousemove", mousemoveHandler);
  });
  div.addEventListener("mousemove", mousemoveHandler);
  div.addEventListener("mouseleave", removeTooltip);

  // Extra: Remove tooltip if element is removed from DOM
  const observer = new MutationObserver(() => {
    if (!document.body.contains(div)) {
      removeTooltip();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// --- Charity: water brand palette from your image ---
const palette = {
  red: "#F94F5E",
  yellow: "#FFDA48",
  teal: "#3FBFBB",
  lightBlue: "#A5DCE0",
  darkBlue: "#28403F",
  beige: "#F3CC98"
};

// --- Apply palette and contrast to UI ---
const style = document.createElement("style");
style.innerHTML = `
  body {
    background: ${palette.beige} !important;
    color: ${palette.darkBlue} !important;
    font-family: 'Proxima Nova', Arial, sans-serif !important;
  }
  #coinPanel {
    background: ${palette.darkBlue} !important;
    color: ${palette.lightBlue} !important;
    border-radius: 14px !important;
    box-shadow: 0 2px 12px ${palette.teal}33;
    border: 3px solid ${palette.teal};
    min-width: 700px;
    width: max-content;
    margin: 20px auto;
    padding: 16px 24px;
  }
  /* Upgrade buttons: use palette.yellow, palette.teal, palette.red, palette.beige for contrast */
  .btn-warning {
    background: ${palette.yellow} !important;
    color: ${palette.darkBlue} !important;
  }
  /* Make tower range button a unique color (light blue) */
  #buyRange, #buyRange10, #buyRange100 {
    background: ${palette.lightBlue} !important;
    color: ${palette.darkBlue} !important;
    border: 2px solid ${palette.darkBlue} !important;
  }
  .btn-info {
    background: ${palette.lightBlue} !important;
    color: ${palette.darkBlue} !important;
  }
  .btn-success {
    background: ${palette.red} !important;
    color: #fff !important;
  }
  .btn-secondary {
    background: ${palette.beige} !important;
    color: ${palette.darkBlue} !important;
  }
  .btn, .btn-warning, .btn-info, .btn-success, .btn-secondary {
    border: 2px solid ${palette.darkBlue} !important;
    font-weight: bold !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 8px ${palette.beige}55;
    transition: background 0.2s, color 0.2s;
    margin: 0 2px;
  }
`;
document.head.appendChild(style);

// --- Update HP bar color dynamically for contrast ---
function setHpBar(parentDiv, hp, maxHp) {
  let bar = parentDiv.querySelector('.hp-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'hp-bar';
    bar.style.position = 'absolute';
    bar.style.left = '0';
    bar.style.bottom = '-8px';
    bar.style.width = '100%';
    bar.style.height = '6px';
    bar.style.background = palette.lightBlue;
    bar.style.borderRadius = '3px';
    bar.style.overflow = 'hidden';
    let fill = document.createElement('div');
    fill.className = 'hp-bar-fill';
    fill.style.height = '100%';
    fill.style.width = '100%';
    bar.appendChild(fill);
    parentDiv.appendChild(bar);
  }
  let fill = bar.querySelector('.hp-bar-fill');
  let percent = Math.max(0, Math.min(1, hp / maxHp));
  fill.style.width = (percent * 100) + '%';
  // Color logic: full = darkBlue, mid = yellow, low = red
  if (percent > 0.5) {
    fill.style.background = palette.darkBlue;
  } else if (percent > 0.2) {
    fill.style.background = palette.yellow;
  } else {
    fill.style.background = palette.red;
  }
}

// --- Create Community ---
function createCommunity(x, y) {
  const minX = 0, minY = 0, maxX = gameArea.clientWidth - 40, maxY = gameArea.clientHeight - 40;
  x = Math.max(minX, Math.min(x, maxX));
  y = Math.max(minY, Math.min(y, maxY));
  if (isOverlapping(x, y, 40, towers, 30) || isOverlapping(x, y, 40, communities, 40)) return;
  const div = document.createElement("div");
  div.classList.add("entity", "community");
  div.style.left = `${x}px`;
  div.style.top = `${y}px`;
  div.dataset.health = communityBaseHealth;
  div.dataset.type = "Community";
  // Use image for community
  const img = document.createElement("img");
  img.src = "img/community.png";
  img.alt = "Community";
  img.style.width = "40px";
  img.style.height = "40px";
  div.appendChild(img);
  let commObj = { el: div, x, y, alive: true, health: communityBaseHealth };
  attachTooltipFollow(div, () => {
    let html = `<strong>Community</strong><br>Health: ${commObj.health}`;
    return html;
  });
  setHpBar(div, commObj.health, communityBaseHealth);
  gameArea.appendChild(div);
  communities.push(commObj);
}

// --- Create Tower ---
function createTower(x, y) {
  const minX = 0, minY = 0, maxX = gameArea.clientWidth - 30, maxY = gameArea.clientHeight - 30;
  x = Math.max(minX, Math.min(x, maxX));
  y = Math.max(minY, Math.min(y, maxY));
  if (isOverlapping(x, y, 30, communities, 40) || isOverlapping(x, y, 30, towers, 30)) return;
  const div = document.createElement("div");
  div.classList.add("entity", "tower");
  div.style.left = `${x}px`;
  div.style.top = `${y}px`;
  div.dataset.health = towerBaseHealth;
  div.dataset.power = towerStats.power;
  div.dataset.speed = towerStats.speed.toFixed(1);
  div.dataset.range = towerStats.range;
  div.dataset.type = "Tower";
  // Use image for tower
  const img = document.createElement("img");
  img.src = "img/water-can-transparent.png";
  img.alt = "Tower";
  img.style.width = "30px";
  img.style.height = "30px";
  div.appendChild(img);
  let towerObj = { el: div, x, y, cooldown: 0, health: towerBaseHealth };
  attachTooltipFollow(div, () => `
    <strong>Tower</strong><br>
    Health: ${towerObj.health}<br>
    Power: ${div.dataset.power}<br>
    Speed: ${div.dataset.speed}<br>
    Range: ${div.dataset.range}
  `);
  setHpBar(div, towerObj.health, towerBaseHealth);
  gameArea.appendChild(div);
  towers.push(towerObj);
}

// --- Create Tower Around Community ---
function createTowerAroundCommunity(community, minDist = 50, maxDist = 90, maxTries = 20) {
  for (let i = 0; i < maxTries; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const dist = minDist + Math.random() * (maxDist - minDist);
    const x = community.x + 20 + Math.cos(angle) * dist;
    const y = community.y + 20 + Math.sin(angle) * dist;
    const minX = 0, minY = 0, maxX = gameArea.clientWidth - 30, maxY = gameArea.clientHeight - 30;
    const tx = Math.max(minX, Math.min(x, maxX));
    const ty = Math.max(minY, Math.min(y, maxY));
    if (!isOverlapping(tx, ty, 30, towers, 30) && !isOverlapping(tx, ty, 30, communities, 40)) {
      createTower(tx, ty);
      return true;
    }
  }
  return false;
}

// --- Difficulty Modes ---
const difficultyModes = {
  Easy:   { intervalDelay: 400, winScore: 3000, canInterval: 9000, mudInterval: 15000, pollutantHp: 40, pollutantPower: 40 },
  Normal: { intervalDelay: 300, winScore: 5000, canInterval: 8000, mudInterval: 12000, pollutantHp: 50, pollutantPower: 50 },
  Hard:   { intervalDelay: 200, winScore: 8000, canInterval: 6000, mudInterval: 9000,  pollutantHp: 70, pollutantPower: 70 }
};
let currentDifficulty = "Normal";

// --- Difficulty Selector UI ---
const difficultyPanel = document.createElement("span");
difficultyPanel.style.display = "inline-block";
difficultyPanel.style.marginLeft = "18px";
difficultyPanel.innerHTML = `
  <label style="font-weight:bold;" for="difficultySelect">Difficulty: </label>
  <select id="difficultySelect" style="font-size:1rem;padding:4px 8px;border-radius:6px;">
    <option value="Easy">Easy</option>
    <option value="Normal" selected>Normal</option>
    <option value="Hard">Hard</option>
  </select>
`;

// Move the difficulty selector next to the start button
if (startBtn && startBtn.parentNode) {
  startBtn.parentNode.insertBefore(difficultyPanel, startBtn.nextSibling);
}

document.getElementById("difficultySelect").addEventListener("change", function() {
  currentDifficulty = this.value;
  setDifficulty();
  resetGame();
});

function setDifficulty() {
  const d = difficultyModes[currentDifficulty];
  intervalDelay = d.intervalDelay;
  winScore = d.winScore;
  canSpawnInterval = d.canInterval;
  mudSpawnInterval = d.mudInterval;
  pollutantBaseHp = d.pollutantHp;
  pollutantBasePower = d.pollutantPower;
}

// --- Override relevant variables for difficulty ---
let winScore = difficultyModes[currentDifficulty].winScore;
let canSpawnInterval = difficultyModes[currentDifficulty].canInterval;
let mudSpawnInterval = difficultyModes[currentDifficulty].mudInterval;
let pollutantBaseHp = difficultyModes[currentDifficulty].pollutantHp;
let pollutantBasePower = difficultyModes[currentDifficulty].pollutantPower;

// --- Update spawnCan and spawnMud intervals ---
clearInterval(window.canIntervalId);
clearInterval(window.mudIntervalId);
window.canIntervalId = setInterval(() => { if (gameActive) spawnCan(); }, canSpawnInterval + Math.random() * 2000);
window.mudIntervalId = setInterval(() => { if (gameActive) spawnMud(); }, mudSpawnInterval + Math.random() * 2000);

// --- Update createPollutant to use difficulty ---
function createPollutant() {
  if (spawnedPollutants >= maxPollutants || communities.length === 0) return;
  const edge = Math.floor(Math.random() * 4);
  let startX, startY;
  if (edge === 0) { startX = Math.random() * (gameArea.clientWidth - 30); startY = 0; }
  else if (edge === 1) { startX = gameArea.clientWidth - 30; startY = Math.random() * (gameArea.clientHeight - 30); }
  else if (edge === 2) { startX = Math.random() * (gameArea.clientWidth - 30); startY = gameArea.clientHeight - 30; }
  else { startX = 0; startY = Math.random() * (gameArea.clientHeight - 30); }
  let hp = pollutantBaseHp + (level * 10), speed = 1 + level * 0.2, power = pollutantBasePower + (level * 10);
  const div = document.createElement("div");
  div.classList.add("entity", "pollutant");
  div.style.left = `${startX}px`;
  div.style.top = `${startY}px`;
  div.dataset.hp = hp;
  div.dataset.speed = speed.toFixed(1);
  div.dataset.power = power;
  div.dataset.level = level;
  // Use image for pollutant
  const img = document.createElement("img");
  img.src = "img/pollution.png";
  img.alt = "Pollutant";
  img.style.width = "30px";
  img.style.height = "30px";
  div.appendChild(img);
  let pollutantObj = { el: div, x: startX, y: startY, speed, hp, power };
  attachTooltipFollow(div, () => `
    <strong>Pollutant</strong><br>
    HP: ${pollutantObj.hp}<br>
    Speed: ${pollutantObj.speed.toFixed(1)}<br>
    Power: ${pollutantObj.power}<br>
    Level: ${level}
  `);
  setHpBar(div, pollutantObj.hp, hp);
  gameArea.appendChild(div);
  pollutants.push(pollutantObj);
  spawnedPollutants++;
}

// --- Create Bullet ---
function createBullet(x, y, target, power) {
  const bullet = document.createElement("div");
  bullet.className = "bullet";
  bullet.style.position = "absolute";
  bullet.style.width = "14px";
  bullet.style.height = "14px";
  bullet.style.borderRadius = "50%";
  bullet.style.background = palette.darkBlue;
  bullet.style.border = `2px solid ${palette.yellow}`;
  bullet.style.boxShadow = `0 0 12px 4px ${palette.yellow}`;
  bullet.style.left = `${x + 8}px`; // center bullet on tower (tower is 30x30)
  bullet.style.top = `${y + 8}px`;
  bullet.style.zIndex = "20";
  bullet.style.pointerEvents = "none";
  bullet.style.transition = "left 0.05s linear, top 0.05s linear";
  gameArea.appendChild(bullet);

  bullets.push({
    el: bullet,
    x: x + 8,
    y: y + 8,
    target: target,
    power: power
  });
}

// (Make sure your towers call createBullet as in your updateGame loop.)
// The bullet CSS is already included in your code and will make bullets visible.

// --- Main Game Loop ---
function updateGame() {
  let pollutantsToRemove = [];
  // --- Pollutant merging logic ---
  for (let i = 0; i < pollutants.length; i++) {
    for (let j = i + 1; j < pollutants.length; j++) {
      const p1 = pollutants[i], p2 = pollutants[j];
      const dx = p1.x - p2.x, dy = p1.y - p2.y, dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 30) {
        // Double the coins dropped after every merge
        p1.coinValue = ((p1.coinValue || 5) + (p2.coinValue || 5)) * 2;
        p1.hp += p2.hp; p1.power += p2.power; p1.speed = Math.max(0.5, p1.speed / 2);
        p1.el.dataset.hp = p1.hp; p1.el.dataset.power = p1.power; p1.el.dataset.speed = p1.speed.toFixed(1);
        setHpBar(p1.el, p1.hp, p1.hp);
        if (p2.el._tooltip) { p2.el._tooltip.remove(); p2.el._tooltip = null; }
        if (p2.el.parentNode) gameArea.removeChild(p2.el);
        pollutants.splice(j, 1); j--;
      }
    }
  }

  pollutants.forEach((pollutant, pIdx) => {
    let targetTower = null, minTowerDist = Infinity;
    towers.forEach(tower => {
      if (tower.health <= 0) return;
      const dx = tower.x - pollutant.x, dy = tower.y - pollutant.y, dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minTowerDist) { minTowerDist = dist; targetTower = tower; }
    });

    let target = null;
    if (targetTower) { target = targetTower; target.type = "tower"; }
    else {
      let targetCommunity = null, minCommDist = Infinity;
      communities.forEach(comm => {
        if (!comm.alive) return;
        const dx = comm.x - pollutant.x, dy = comm.y - pollutant.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minCommDist) { minCommDist = dist; targetCommunity = comm; }
      });
      if (!targetCommunity) return;
      target = targetCommunity; target.type = "community";
    }

    const dx = target.x - pollutant.x, dy = target.y - pollutant.y, dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 20) {
      if (target.type === "tower") {
        target.health -= 50;
        setHpBar(target.el, target.health, towerBaseHealth);
        if (target.health <= 0) {
          gameArea.removeChild(target.el);
          towers = towers.filter(t => t !== target);
          score = Math.max(0, score - 100);
          scoreDisplay.innerText = score;
        }
      } else if (target.type === "community") {
        target.health -= 50;
        setHpBar(target.el, target.health, communityBaseHealth);
        if (target.health <= 0) {
          target.alive = false;
          gameArea.removeChild(target.el);
          score = Math.max(0, score - 1000);
          scoreDisplay.innerText = score;
        }
      }
      pollutantsToRemove.push(pIdx);
    } else {
      pollutant.x += (dx / dist) * pollutant.speed;
      pollutant.y += (dy / dist) * pollutant.speed;
      pollutant.el.style.left = `${pollutant.x}px`;
      pollutant.el.style.top = `${pollutant.y}px`;
    }
  });

  pollutantsToRemove.reverse().forEach(idx => {
    if (pollutants[idx]) {
      let coinValue = pollutants[idx].coinValue || 5;
      gameArea.removeChild(pollutants[idx].el);
      pollutants.splice(idx, 1);
      // Death of every pollutant costs 1 coin
      coins = Math.max(0, coins - 1);
      coins += coinValue;
      scoreDisplay.innerText = score;
      updateCoins();
    }
  });

  towers.forEach(tower => {
    if (tower.health <= 0) return;
    if (tower.cooldown > 0) { tower.cooldown--; return; }
    let target = null, minDist = Infinity;
    pollutants.forEach((pollutant, idx) => {
      const dx = tower.x - pollutant.x, dy = tower.y - pollutant.y, dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < towerStats.range && dist < minDist) { minDist = dist; target = { pollutant, idx }; }
    });
    if (target) {
      createBullet(tower.x, tower.y, target.pollutant, towerStats.power); // Use towerStats.power for bullet damage
      tower.cooldown = Math.max(1, Math.floor(30 / towerStats.speed));
    }
  });

  let bulletsToRemove = [];
  bullets.forEach((bullet, bIdx) => {
    if (!bullet.target || !pollutants.includes(bullet.target)) {
      if (bullet.el.parentNode) bullet.el.parentNode.removeChild(bullet.el);
      bulletsToRemove.push(bIdx);
      return;
    }
    const dx = bullet.target.x - bullet.x, dy = bullet.target.y - bullet.y, dist = Math.sqrt(dx * dx + dy * dy), speed = 8;
    if (dist < 10) {
      // Make damage equal to the current power value of the tower that fired the bullet
      // If you store tower reference in bullet, use bullet.tower.power, otherwise use bullet.power
      bullet.target.hp -= bullet.power; // bullet.power should be set to towerStats.power when fired
      bullet.target.el.dataset.hp = bullet.target.hp;
      setHpBar(bullet.target.el, bullet.target.hp, 50 + level * 20);
      if (bullet.target.hp <= 0) {
        let idx = pollutants.indexOf(bullet.target);
        if (idx !== -1) {
          let coinValue = bullet.target.coinValue || 5;
          gameArea.removeChild(bullet.target.el);
          pollutants.splice(idx, 1);
          score += 10;
          coins += coinValue;
          scoreDisplay.innerText = score;
          updateCoins();
        }
      }
      if (bullet.el.parentNode) bullet.el.parentNode.removeChild(bullet.el);
      bulletsToRemove.push(bIdx);
    } else {
      bullet.x += (dx / dist) * speed;
      bullet.y += (dy / dist) * speed;
      bullet.el.style.left = `${bullet.x}px`;
      bullet.el.style.top = `${bullet.y}px`;
    }
  });
  bulletsToRemove.reverse().forEach(idx => {
    if (bullets[idx]) {
      if (bullets[idx].el.parentNode) bullets[idx].el.parentNode.removeChild(bullets[idx].el);
      bullets.splice(idx, 1);
    }
  });

  communities = communities.filter(c => c.alive);
  communityDisplay.innerText = communities.length;
  if (communities.length === 0) {
    endGame();
    return;
  }
  if (spawnedPollutants >= maxPollutants && pollutants.length === 0 && bullets.length === 0) {
    clearInterval(gameInterval);
    if (autoNextLevelActive) {
      setTimeout(() => { if (autoNextLevelActive) nextLevel(); }, 800);
    }
  }
  scoreDisplay.innerText = score;
  checkMilestone(score);
}

// --- Milestone Messages ---
const milestoneMessages = [
  "Great job! 10 points reached!",
  "Amazing! 100 points!",
  "Incredible! 1,000 points!",
  "Unstoppable! 10,000 points!",
  "Legendary! 100,000 points!",
  "Godlike! 1,000,000 points!"
];
let lastMilestoneScore = 0;

// --- Show milestone message popup ---
function showMilestoneMessage(msg) {
  const milestoneDiv = document.createElement("div");
  milestoneDiv.textContent = msg;
  milestoneDiv.style.position = "fixed";
  milestoneDiv.style.left = "50%";
  milestoneDiv.style.top = "20%";
  milestoneDiv.style.transform = "translate(-50%, -50%) scale(0.7)";
  milestoneDiv.style.background = "#FFDA48";
  milestoneDiv.style.color = "#28403F";
  milestoneDiv.style.fontWeight = "bold";
  milestoneDiv.style.fontSize = "2rem";
  milestoneDiv.style.padding = "18px 36px";
  milestoneDiv.style.borderRadius = "12px";
  milestoneDiv.style.boxShadow = "0 4px 24px #28403F55";
  milestoneDiv.style.zIndex = "99999";
  milestoneDiv.style.opacity = "0";
  milestoneDiv.style.transition = "opacity 0.4s, transform 0.4s";
  document.body.appendChild(milestoneDiv);

  // Animate in
  setTimeout(() => {
    milestoneDiv.style.opacity = "0.95";
    milestoneDiv.style.transform = "translate(-50%, -50%) scale(1.1)";
  }, 10);

  // Animate out
  setTimeout(() => {
    milestoneDiv.style.opacity = "0";
    milestoneDiv.style.transform = "translate(-50%, -50%) scale(0.7)";
  }, 1800);

  setTimeout(() => { milestoneDiv.remove(); }, 2200);
}

// --- Check and display milestone when score increases by 10x ---
function checkMilestone(score) {
  if (score >= 10 && score >= lastMilestoneScore * 10) {
    let idx = Math.floor(Math.log10(score)) - 1;
    if (idx >= milestoneMessages.length) idx = milestoneMessages.length - 1;
    showMilestoneMessage(milestoneMessages[idx]);
    lastMilestoneScore = score;
  }
}

// --- Sound Effects ---
const sfx = {
  upgrade: new Audio('audio/upgrade.mp3') // Place your upgrade sound in audio/upgrade.mp3
};

// Utility: Play a sound safely (rewind if needed)
function playSfx(sound) {
  if (sound && sound.paused === false) sound.currentTime = 0;
  sound && sound.play();
}

// --- Game Start/End/Next Level ---
function startGame() {
  gameActive = true;
  startBtn.style.display = "none";
  gameOverDisplay.style.display = "none";
  if (replayBtn) replayBtn.style.display = "none"; // Hide replay button on game start
  score = 0; level = 1; coins = 0;
  scoreDisplay.innerText = score;
  levelDisplay.innerText = level;
  spawnedPollutants = 0; maxPollutants = 10;
  // Remove permanent upgrades at game start
  towerStats = { range: 60, power: 100, speed: 1.0, health: 100 };
  communityBaseHealth = 100; towerBaseHealth = 100;
  communities = []; towers = []; pollutants = []; bullets = [];
  for (let i = 0; i < 3; i++) createCommunity(Math.random() * (gameArea.clientWidth - 40), Math.random() * (gameArea.clientHeight - 40));
  communities.forEach(comm => {
    createTowerAroundCommunity(comm);
  });
  updateCoins();
  restartGameInterval();
}

function endGame() {
  gameActive = false;
  clearInterval(gameInterval);
  gameOverDisplay.style.display = "block";
  if (replayBtn) replayBtn.style.display = "inline-block"; // Show replay button on game over
  showConfetti();
}

function nextLevel() {
  level++;
  levelDisplay.innerText = level;
  spawnedPollutants = 0;
  maxPollutants = level * 5;
  score += 1000;
  scoreDisplay.innerText = score;
  // Show confetti every 10 levels
  if (level % 10 === 0) showConfetti();
  // Remove permanent upgrades at each new level
  let comm = communities[Math.floor(Math.random() * communities.length)];
  if (comm) createTowerAroundCommunity(comm);
  else createTower(Math.random() * (gameArea.clientWidth - 30), Math.random() * (gameArea.clientHeight - 30));
  // Spawn 1 community every 5 levels
  if (level % 5 === 0) {
    createCommunity(Math.random() * (gameArea.clientWidth - 40), Math.random() * (gameArea.clientHeight - 40));
  }
  restartGameInterval();
}

// --- Auto Next Level always ON and hidden ---
let autoNextLevelActive = true;

// --- Reset logic (refactored for reuse) ---
function resetGame() {
  // Remove all pollutants, towers, communities, bullets, cans, and muds from the screen
  pollutants.forEach(p => p.el && p.el.parentNode && p.el.parentNode.removeChild(p.el));
  towers.forEach(t => t.el && t.el.parentNode && t.el.parentNode.removeChild(t.el));
  communities.forEach(c => c.el && c.el.parentNode && c.el.parentNode.removeChild(c.el));
  bullets.forEach(b => b.el && b.el.parentNode && b.el.parentNode.removeChild(b.el));
  document.querySelectorAll(".can, .mud").forEach(el => el.remove());
  // Now start the game fresh
  startGame();
}

// --- Reset Button ---
const resetBtn = document.createElement("button");
resetBtn.textContent = "Reset";
resetBtn.className = "btn btn-danger";
resetBtn.style.marginLeft = "10px";
resetBtn.onclick = resetGame;
coinPanel.appendChild(resetBtn);

// --- Replay Button logic ---
const replayBtn = document.getElementById("replayBtn");
if (replayBtn) {
  replayBtn.style.display = "none"; // Hide by default

  replayBtn.onclick = resetGame;
}

// --- Confetti celebration on win or every 10 levels ---
function showConfetti() {
  const confettiContainer = document.createElement("div");
  confettiContainer.style.position = "fixed";
  confettiContainer.style.left = "0";
  confettiContainer.style.top = "0";
  confettiContainer.style.width = "100vw";
  confettiContainer.style.height = "100vh";
  confettiContainer.style.pointerEvents = "none";
  confettiContainer.style.zIndex = "9999";
  document.body.appendChild(confettiContainer);
  for (let i = 0; i < 60; i++) {
    const conf = document.createElement("div");
    conf.textContent = ["💧", "🎉", "✨", "💙", "🟡"][Math.floor(Math.random() * 5)];
    conf.style.position = "absolute";
    conf.style.left = Math.random() * 100 + "vw";
    conf.style.top = "-5vh";
    conf.style.fontSize = (24 + Math.random() * 24) + "px";
    conf.style.transition = "top 2.2s cubic-bezier(.23,1.01,.32,1)";
    confettiContainer.appendChild(conf);
    setTimeout(() => { conf.style.top = (80 + Math.random() * 15) + "vh"; }, 10 + Math.random() * 400);
  }
  setTimeout(() => confettiContainer.remove(), 2500);
}

// --- Responsive font for score ---
scoreDisplay.style.fontSize = "clamp(1.2rem, 2vw, 2.2rem)";
scoreDisplay.style.fontWeight = "bold";
scoreDisplay.style.transition = "color 0.2s";

// --- Charity: water logo and message ---
// Use recommended logo size and spacing from brand guide
const logo = document.createElement("img");
logo.src = "img/cw_logo.png"; // Replace with your actual image file name in the img/ folder
logo.alt = "charity: water";
logo.style.height = "95px"; // Brand guide: 95px for web
logo.style.margin = "18px";
logo.style.display = "block";
logo.style.marginLeft = "auto";
logo.style.marginRight = "auto";
document.body.insertBefore(logo, document.body.firstChild);

// --- Mission statement with improved contrast ---
const mission = document.createElement("div");
mission.innerHTML = `<span style="color:#003366;font-weight:bold;">Every drop counts!</span> <span style="color:#222;">Help keep communities safe and clean.</span>`;
mission.style.textAlign = "center";
mission.style.fontSize = "1.1rem";
mission.style.marginBottom = "10px";
mission.style.fontFamily = "'Proxima Nova', Arial, sans-serif";
document.body.insertBefore(mission, coinPanel);

// --- Footer with charity: water links and accessible contrast ---
const footer = document.createElement("footer");
footer.style.textAlign = "center";
footer.style.marginTop = "30px";
footer.style.padding = "18px 0 10px 0";
footer.style.background = "#F8F6DF"; // Brand light yellow, but lighter for contrast
footer.style.borderTop = "2px solid #FFC907";
footer.style.fontSize = "1.05rem";
footer.style.fontFamily = "'Proxima Nova', Arial, sans-serif";
footer.innerHTML = `
  <a href="https://www.charitywater.org/home" target="_blank" style="color:#003366;font-weight:bold;text-decoration:underline;background:#FFF;padding:2px 6px;border-radius:4px;">
    Visit charity: water
  </a>
  &nbsp;|&nbsp;
  <a href="https://www.charitywater.org/donate" target="_blank" style="color:#003366;font-weight:bold;text-decoration:underline;background:#FFC907;padding:2px 6px;border-radius:4px;">
    Donate Now
  </a>
`;
document.body.appendChild(footer);

// --- Improve button and panel contrast globally ---
const style2 = document.createElement("style");
style2.innerHTML = `
  body {
    background: #F8F6DF !important;
    color: #28403F !important; /* Use dark blue-green for best contrast */
    font-family: 'Proxima Nova', Arial, sans-serif !important;
  }
  #coinPanel, .btn, #gameOver, #score, #level {
    font-family: 'Proxima Nova', Arial, sans-serif !important;
  }
  .btn {
    color: #28403F !important; /* Very dark text for best contrast */
    background: #FFDA48 !important; /* Brand yellow */
    border: 2px solid #28403F !important;
    font-weight: bold !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 8px #D7B99222;
    transition: background 0.2s, color 0.2s;
  }
  .btn-danger {
    background: #F94F5E !important; /* Brand red */
    color: #FFF !important;
    border: 2px solid #28403F !important;
  }
  .btn-success {
    background: #3FBFBB !important; /* Brand teal */
    color: #28403F !important; /* Dark text for contrast */
    border: 2px solid #28403F !important;
  }
  .btn-info {
    background: #A5DCE0 !important; /* Light blue */
    color: #28403F !important;
    border: 2px solid #28403F !important;
  }
  .btn-secondary {
    background: #D7B992 !important;
    color: #28403F !important;
    border: 2px solid #28403F !important;
  }
  .btn-warning {
    background: #FFDA48 !important;
    color: #28403F !important;
    border: 2px solid #28403F !important;
  }
  .can, .mud {
    border-radius: 50%;
    border: 2px solid #FFDA48;
    background: #FFF !important;
  }
  .can:hover { filter: brightness(1.2) drop-shadow(0 0 8px #FFDA48); }
  .mud:hover { filter: brightness(0.8) drop-shadow(0 0 8px #B49559); }
  .hp-bar {
    background: #D4D6C5 !important;
  }
  .hp-bar-fill {
    background: #28403F !important;
  }
  .pollutant-tooltip {
    background: #FFF !important;
    color: #28403F !important;
    border: 1px solid #FFDA48 !important;
    border-radius: 6px !important;
    padding: 6px 10px !important;
    font-family: 'Proxima Nova', Arial, sans-serif !important;
    font-size: 1rem !important;
    box-shadow: 0 2px 8px #D7B99244;
  }
  footer {
    background: #F8F6DF !important;
    color: #28403F !important;
    border-top: 2px solid #FFDA48 !important;
  }
  footer a {
    font-family: 'Proxima Nova', Arial, sans-serif !important;
    font-weight: bold !important;
    text-decoration: underline !important;
    border-radius: 4px !important;
    color: #28403F !important;
    background: #FFDA48 !important;
    padding: 2px 8px !important;
    transition: background 0.2s, color 0.2s;
  }
  footer a:hover {
    background: #28403F !important;
    color: #FFDA48 !important;
    text-decoration: none !important;
  }
  .title, h1, h2, h3 {
    color: #28403F !important;
    font-family: 'Proxima Nova', Arial, sans-serif !important;
    font-weight: bold !important;
  }
  .mission-highlight {
    color: #28403F !important;
    background: #FFDA48 !important;
    padding: 0 4px;
    border-radius: 3px;
    font-weight: bold;
  }
`;
document.head.appendChild(style2);

// --- Charity: water brand colors and styles ---
const palette2 = {
  yellow: "#FFDA48",
  darkBlue: "#003366",
  lightBlue: "#A5DCE0",
  teal: "#3FBFBB",
  red: "#F94F5E",
  beige: "#F8F6DF",
  brown: "#D7B992",
  green: "#4CAF50",
  orange: "#FFC107",
  purple: "#9C27B0",
  pink: "#E91E63",
  grey: "#9E9E9E",
  black: "#000000",
  white: "#FFFFFF"
};

// --- Accessibility improvements ---
// 1. Ensure sufficient color contrast (already applied above)
// 2. Add focus styles for keyboard navigation
const focusStyle = document.createElement("style");
focusStyle.innerHTML = `
  .btn:focus, #difficultySelect:focus {
    outline: 3px solid ${palette.yellow};
    outline-offset: 2px;
  }
`;
document.head.appendChild(focusStyle);

// 3. Aria labels for important elements
document.getElementById("gameArea").setAttribute("aria-label", "Game area where communities are protected from pollutants");
document.getElementById("score").setAttribute("aria-label", "Current score: " + score);
document.getElementById("communityCount").setAttribute("aria-label", "Current number of communities: " + communities.length);
document.getElementById("level").setAttribute("aria-label", "Current level: " + level);
startBtn.setAttribute("aria-label", "Start the game");
speedBtn.setAttribute("aria-label", "Change game speed");
document.querySelectorAll(".btn").forEach(btn => {
  btn.setAttribute("role", "button");
  btn.setAttribute("tabindex", "0");
});

// --- Announce.js integration for live score updates ---
if (typeof Announce !== "undefined") {
  const scoreAnnouncer = new Announce("score", { live: true });
  scoreAnnouncer.text = () => `Score: ${score}`;
  scoreAnnouncer.start();
}

// --- Service worker registration for PWA ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(registration => {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch(error => {
      console.error('Service Worker registration failed:', error);
    });
  });
}

// --- Precaching important assets ---
const CACHE_NAME = 'v1';
const PRECACHE_URLS = [
  'index.html',
  'img/community.png',
  'img/water-can-transparent.png',
  'img/pollution.png',
  'img/cw_logo.png',
  'css/styles.css',
  'js/scripts.js',
  'https://fonts.googleapis.com/css2?family=Proxima+Nova:wght@400;700&display=swap'
];

// --- Install service worker and cache assets ---
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching app shell');
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

// --- Activate service worker and remove old caches ---
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // Keep the current cache and any that start with "dynamic-"
          return cacheName !== CACHE_NAME && cacheName.startsWith('dynamic-');
        }).map(cacheName => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// --- Fetch event to serve cached assets ---
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Serve from cache if available, otherwise fetch from network
      return response || fetch(event.request);
    })
  );
});