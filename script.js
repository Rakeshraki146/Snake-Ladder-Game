(function () {
  'use strict';

  const CELL = 56;
  const MARGIN = 0;
  const SIZE = 560;

  // Snakes: head -> tail (sliding down)
  const snakes = {
    16: 6,
    47: 26,
    49: 11,
    56: 53,
    62: 19,
    64: 60,
    87: 24,
    93: 73,
    95: 75,
    98: 78
  };

  // Ladders: bottom -> top (climbing up)
  const ladders = {
    1: 38,
    4: 14,
    9: 31,
    21: 42,
    28: 84,
    36: 44,
    51: 67,
    71: 91,
    80: 100
  };

  const jump = Object.assign({}, snakes, ladders);

  // Calculate center coordinate (x, y) for a square (1-100) in 560x560 space
  function cellCenter(pos) {
    if (pos < 1) pos = 1;
    const idx = pos - 1;
    const row = Math.floor(idx / 10);
    let col = idx % 10;
    // Boustrophedon (serpentine / alternating) layout: odd rows go right-to-left
    if (row % 2 === 1) col = 9 - col;
    const x = MARGIN + col * CELL + CELL / 2;
    const y = MARGIN + (9 - row) * CELL + CELL / 2;
    return { x, y };
  }

  function toPct(v) {
    return (v / SIZE * 100) + '%';
  }

  // Generate 10x10 board cells (1 to 100)
  const board = document.getElementById('board');
  for (let pos = 1; pos <= 100; pos++) {
    const idx = pos - 1;
    const row = Math.floor(idx / 10);
    let col = idx % 10;
    if (row % 2 === 1) col = 9 - col;
    const x = col * CELL;
    const y = (9 - row) * CELL;

    const div = document.createElement('div');
    div.className = 'cell' + (pos === 100 ? ' win' : '');
    div.style.left = toPct(x);
    div.style.top = toPct(y);

    const shade = (row + col) % 2 === 0
      ? (row % 2 === 0 ? '#D8F3DC' : '#FDEBD3')
      : (row % 2 === 0 ? '#B7E4C7' : '#FBDAA8');

    div.style.background = pos === 100 ? '#FFD166' : shade;
    div.textContent = pos;
    board.appendChild(div);
  }

  // SVG Overlay for Snakes and Ladders
  const svg = document.querySelector('svg.overlay');
  function svgEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const k in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, k)) {
        el.setAttribute(k, attrs[k]);
      }
    }
    return el;
  }

  // Draw ladders (rails and rungs)
  Object.entries(ladders).forEach(([bottom, top]) => {
    const b = cellCenter(+bottom);
    const t = cellCenter(+top);
    const dx = t.x - b.x;
    const dy = t.y - b.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len * 6;
    const ny = dx / len * 6;

    // Left and right rails
    svg.appendChild(svgEl('line', {
      x1: b.x + nx,
      y1: b.y + ny,
      x2: t.x + nx,
      y2: t.y + ny,
      stroke: '#8D6E63',
      'stroke-width': 4,
      'stroke-linecap': 'round'
    }));
    svg.appendChild(svgEl('line', {
      x1: b.x - nx,
      y1: b.y - ny,
      x2: t.x - nx,
      y2: t.y - ny,
      stroke: '#8D6E63',
      'stroke-width': 4,
      'stroke-linecap': 'round'
    }));

    // Ladder rungs
    for (let r = 1; r < 6; r++) {
      const ratio = r / 6;
      const rx = b.x + dx * ratio;
      const ry = b.y + dy * ratio;
      svg.appendChild(svgEl('line', {
        x1: rx + nx,
        y1: ry + ny,
        x2: rx - nx,
        y2: ry - ny,
        stroke: '#FFB703',
        'stroke-width': 3,
        'stroke-linecap': 'round'
      }));
    }
  });

  // Draw snakes (curved body, head and eyes)
  Object.entries(snakes).forEach(([head, tail], i) => {
    const h = cellCenter(+head);
    const t = cellCenter(+tail);
    const ctrlX = (h.x + t.x) / 2 + (i % 2 === 0 ? 42 : -42);
    const ctrlY = (h.y + t.y) / 2;
    const color = i % 2 === 0 ? '#4CAF50' : '#7CB342';

    // Snake body curve (Properly formatted SVG path string)
    svg.appendChild(svgEl('path', {
      d: `M ${h.x} ${h.y} Q ${ctrlX} ${ctrlY} ${t.x} ${t.y}`,
      stroke: color,
      'stroke-width': 5,
      fill: 'none',
      'stroke-linecap': 'round'
    }));

    // Snake head circle
    svg.appendChild(svgEl('circle', {
      cx: h.x,
      cy: h.y,
      r: 8,
      fill: '#388E3C'
    }));

    // Snake eyes
    svg.appendChild(svgEl('circle', {
      cx: h.x - 3,
      cy: h.y - 3,
      r: 1.6,
      fill: '#fff'
    }));
    svg.appendChild(svgEl('circle', {
      cx: h.x + 3,
      cy: h.y - 3,
      r: 1.6,
      fill: '#fff'
    }));
  });

  // Player state objects
  const p1 = { name: 'Player 1', color: 'var(--coral-500)', cls: 'p1', pos: 0, el: null };
  const p2 = { name: 'Player 2', color: 'var(--sky-500)', cls: 'p2', pos: 0, el: null };

  // Create token DOM elements
  [p1, p2].forEach(p => {
    const el = document.createElement('div');
    el.className = 'token ' + p.cls;
    el.textContent = p.cls.toUpperCase();
    el.style.display = 'none';
    board.appendChild(el);
    p.el = el;
  });

  let queue = [p1, p2];
  let gameOver = false;
  let rolling = false;

  // Dice pip positions (3x3 grid indices 0-8)
  const diceEl = document.getElementById('dice');
  const pipPositions = [
    [],
    [4],
    [0, 8],
    [0, 4, 8],
    [0, 2, 6, 8],
    [0, 2, 4, 6, 8],
    [0, 2, 3, 5, 6, 8]
  ];

  function renderDice(value) {
    diceEl.innerHTML = '';
    const activePips = pipPositions[value] || [];
    for (let i = 0; i < 9; i++) {
      const pip = document.createElement('div');
      pip.className = 'pip' + (activePips.includes(i) ? ' on' : '');
      diceEl.appendChild(pip);
    }
  }
  renderDice(1);

  // DOM element selections
  const rollBtn = document.getElementById('rollBtn');
  const restartBtn = document.getElementById('restartBtn');
  const exitBtn = document.getElementById('exitBtn');
  const turnLabel = document.getElementById('turnLabel');
  const turnSub = document.getElementById('turnSub');
  const diceValue = document.getElementById('diceValue');
  const status = document.getElementById('status');
  const p1pos = document.getElementById('p1pos');
  const p2pos = document.getElementById('p2pos');
  const p1nameLabel = document.getElementById('p1nameLabel');
  const p2nameLabel = document.getElementById('p2nameLabel');
  const winOverlay = document.getElementById('winOverlay');
  const winTitle = document.getElementById('winTitle');
  const winRestart = document.getElementById('winRestart');
  const setupScreen = document.getElementById('setupScreen');
  const layoutEl = document.getElementById('layout');
  const p1NameInput = document.getElementById('p1NameInput');
  const p2NameInput = document.getElementById('p2NameInput');
  const startBtn = document.getElementById('startBtn');
  const nameError = document.getElementById('nameError');
  const exitScreen = document.getElementById('exitScreen');
  const exitPlayAgainBtn = document.getElementById('exitPlayAgainBtn');
  const appContainer = document.querySelector('.app');

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function refreshLabels() {
    p1pos.textContent = p1.pos === 0 ? 'Not started' : 'Square ' + p1.pos;
    p2pos.textContent = p2.pos === 0 ? 'Not started' : 'Square ' + p2.pos;
    p1nameLabel.textContent = p1.name;
    p2nameLabel.textContent = p2.name;

    const current = queue[0];
    turnLabel.textContent = current.name + "'s turn";
    turnLabel.style.color = current.color;
  }
  refreshLabels();

  // Validate player names and start game
  function beginGame() {
    const n1 = p1NameInput.value.trim();
    const n2 = p2NameInput.value.trim();

    // Reset validation state
    p1NameInput.classList.remove('error');
    p2NameInput.classList.remove('error');
    nameError.style.display = 'none';
    nameError.textContent = '';

    // Requirement: Require both names before starting
    if (!n1 || !n2) {
      if (!n1 && !n2) {
        nameError.textContent = 'Please enter names for both Player 1 and Player 2.';
        p1NameInput.classList.add('error');
        p2NameInput.classList.add('error');
        p1NameInput.focus();
      } else if (!n1) {
        nameError.textContent = 'Please enter a name for Player 1.';
        p1NameInput.classList.add('error');
        p1NameInput.focus();
      } else {
        nameError.textContent = 'Please enter a name for Player 2.';
        p2NameInput.classList.add('error');
        p2NameInput.focus();
      }
      nameError.style.display = 'block';
      return;
    }

    p1.name = n1;
    p2.name = n2;
    setupScreen.style.display = 'none';
    layoutEl.classList.remove('hidden');
    status.textContent = p1.name + ', click roll dice to start.';
    refreshLabels();
  }

  // Clear validation error on typing
  p1NameInput.addEventListener('input', () => {
    p1NameInput.classList.remove('error');
    if (p1NameInput.value.trim() && p2NameInput.value.trim()) {
      nameError.style.display = 'none';
    }
  });

  p2NameInput.addEventListener('input', () => {
    p2NameInput.classList.remove('error');
    if (p1NameInput.value.trim() && p2NameInput.value.trim()) {
      nameError.style.display = 'none';
    }
  });

  startBtn.addEventListener('click', beginGame);
  p1NameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      p2NameInput.focus();
    }
  });
  p2NameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      beginGame();
    }
  });

  // Position player token on board
  function placeToken(p, animated) {
    if (p.pos < 1) {
      p.el.style.display = 'none';
      return;
    }
    p.el.style.display = 'flex';
    const c = cellCenter(p.pos);
    const offsetPct = p.cls === 'p1' ? -1.3 : 1.3;
    p.el.classList.toggle('sliding', !!animated);
    p.el.style.left = ((c.x / SIZE * 100) + offsetPct) + '%';
    p.el.style.top = ((c.y / SIZE * 100) + offsetPct) + '%';
  }

  // Step-by-step movement animation
  async function stepMove(p, steps) {
    for (let i = 0; i < steps; i++) {
      p.pos += 1;
      placeToken(p, false);
      await sleep(160);
    }
  }

  // Sliding animation for snakes and ladders
  async function slideMove(p, destination) {
    await sleep(120);
    placeToken({ ...p, pos: destination, el: p.el }, true);
    p.pos = destination;
    await sleep(560);
  }

  // Dice roll handler
  async function handleRoll() {
    if (gameOver || rolling) return;
    rolling = true;
    rollBtn.disabled = true;
    status.textContent = 'Rolling the dice...';
    diceEl.classList.add('rolling');

    // Dice rolling animation
    let ticks = 0;
    const totalTicks = 10;
    await new Promise(resolve => {
      const timer = setInterval(() => {
        ticks++;
        const v = 1 + Math.floor(Math.random() * 6);
        renderDice(v);
        if (ticks >= totalTicks) {
          clearInterval(timer);
          resolve();
        }
      }, 70);
    });
    diceEl.classList.remove('rolling');

    const value = 1 + Math.floor(Math.random() * 6);
    renderDice(value);
    diceValue.textContent = 'Dice: ' + value;

    const current = queue[0];
    const intended = current.pos + value;

    // Requirement: Exact roll required to reach 100
    if (intended > 100) {
      status.textContent = current.name + ' needs an exact roll to reach 100 (rolled ' + value + '). Move skipped.';
      rolling = false;
      endTurn();
      return;
    }

    // Step player forward
    await stepMove(current, value);
    const landedOn = current.pos;
    const destination = jump[landedOn];

    // Check for Snake or Ladder jump
    if (destination) {
      const isSnake = destination < landedOn;
      status.textContent = isSnake
        ? current.name + ' was bitten by a snake on ' + landedOn + '! Sliding down to ' + destination + '.'
        : current.name + ' found a ladder on ' + landedOn + '! Climbing up to ' + destination + '.';
      await slideMove(current, destination);
    }

    refreshLabels();

    // Check win condition
    if (current.pos === 100) {
      gameOver = true;
      status.textContent = current.name + ' reached square 100!';
      winTitle.textContent = current.name + ' wins!';
      winOverlay.classList.add('show');
      rolling = false;
      return;
    }

    status.textContent = current.name + ' is now on square ' + current.pos + '.';
    rolling = false;
    endTurn();
  }

  // End current turn and switch player
  function endTurn() {
    if (gameOver) return;
    queue.push(queue.shift());
    refreshLabels();
    turnSub.textContent = 'Roll the dice for your turn';
    rollBtn.disabled = false;
  }

  // Restart the current game
  function restartGame() {
    p1.pos = 0;
    p2.pos = 0;
    placeToken(p1, false);
    placeToken(p2, false);
    queue = [p1, p2];
    gameOver = false;
    rolling = false;
    diceEl.classList.remove('rolling');
    renderDice(1);
    diceValue.textContent = 'Dice: \u2014';
    status.textContent = 'New game started. ' + p1.name + ', click roll dice!';
    turnSub.textContent = 'Roll the dice to begin';
    rollBtn.disabled = false;
    winOverlay.classList.remove('show');
    refreshLabels();
  }

  // Reset entirely back to setup screen
  function resetToSetup() {
    p1.pos = 0;
    p2.pos = 0;
    placeToken(p1, false);
    placeToken(p2, false);
    queue = [p1, p2];
    gameOver = false;
    rolling = false;
    diceEl.classList.remove('rolling');
    renderDice(1);
    diceValue.textContent = 'Dice: \u2014';
    winOverlay.classList.remove('show');
    exitScreen.classList.add('hidden');
    layoutEl.classList.add('hidden');
    appContainer.style.display = 'block';
    setupScreen.style.display = 'block';
    nameError.style.display = 'none';
    p1NameInput.classList.remove('error');
    p2NameInput.classList.remove('error');
    p1NameInput.focus();
  }

  // Event Listeners
  rollBtn.addEventListener('click', handleRoll);
  restartBtn.addEventListener('click', restartGame);
  winRestart.addEventListener('click', restartGame);

  exitBtn.addEventListener('click', () => {
    if (window.confirm('Are you sure you want to exit the game?')) {
      appContainer.style.display = 'none';
      exitScreen.classList.remove('hidden');
    }
  });

  exitPlayAgainBtn.addEventListener('click', () => {
    resetToSetup();
  });

  // Expose test hooks for automated verification if needed
  window.__snakeLadderGame = {
    p1,
    p2,
    getQueue: () => queue,
    setPos: (player, pos) => {
      player.pos = pos;
      placeToken(player, false);
      refreshLabels();
    },
    handleRoll,
    restartGame,
    resetToSetup,
    beginGame,
    snakes,
    ladders
  };
})();