const boardElement = document.getElementById("chessBoard");
const moveHistoryElement = document.getElementById("moveHistory");
const themeSelector = document.getElementById("themeSelector");
const modeSelector = document.getElementById("modeSelector");
const colorToggle = document.getElementById("colorToggle");
const timerSelector = document.getElementById("timerSelector");
const newGameBtn = document.getElementById("newGameBtn");

let game = null;
let selected = null;
let moveHistory = [];
let isWhiteTurn = true;
let timerWhite = 0;
let timerBlack = 0;
let timerInterval = null;
let aiEnabled = false;
let aiColor = "black";
let userColor = "white";

function createBoard() {
  boardElement.innerHTML = "";
  const orientation = userColor === "white" ? 1 : -1;
  const offset = userColor === "white" ? 0 : 7;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.dataset.row = r;
      tile.dataset.col = c;
      const color = (r + c) % 2 === 0 ? "light" : "dark";
      tile.classList.add(color);
      tile.addEventListener("click", () => handleClick(r, c));
      boardElement.appendChild(tile);
    }
  }
}

function initializeGame() {
  game = new Chess();
  selected = null;
  moveHistory = [];
  isWhiteTurn = true;
  updateBoard();
  updateHistory();
  resetTimers();
  updateTheme();
  aiEnabled = modeSelector.value === "ai";
  userColor = colorToggle.value;
  aiColor = userColor === "white" ? "black" : "white";
  createBoard();
  if (aiEnabled && game.turn() !== userColor[0]) {
    setTimeout(aiMove, 300);
  }
}

function updateBoard() {
  const squares = boardElement.querySelectorAll(".tile");
  squares.forEach((tile) => tile.innerHTML = "");

  const position = game.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = position[r][c];
      if (piece) {
        const tile = getTile(r, c);
        const img = document.createElement("img");
        img.src = `assets/${piece.color}${piece.type.toUpperCase()}.png`;
        img.classList.add("piece");
        tile.appendChild(img);
      }
    }
  }
}

function getTile(r, c) {
  const idx = userColor === "white" ? r * 8 + c : (7 - r) * 8 + (7 - c);
  return boardElement.children[idx];
}

function handleClick(row, col) {
  if (game.game_over()) return;
  const square = rowcolToSquare(row, col);
  const piece = game.get(square);

  if (selected) {
    if (selected === square) {
      selected = null;
      highlightMoves([]);
      return;
    }
    const moves = game.moves({ square: selected, verbose: true });
    const move = moves.find((m) => m.to === square);
    if (move) {
      game.move(move);
      moveHistory.push(move.san);
      updateBoard();
      updateHistory();
      selected = null;
      highlightMoves([]);
      if (timerInterval === null) startTimers();
      if (game.in_checkmate()) alert("Checkmate!");
      else if (game.in_draw()) alert("Draw!");
      if (aiEnabled && game.turn() === aiColor[0]) setTimeout(aiMove, 300);
    } else {
      selected = null;
      highlightMoves([]);
    }
  } else {
    if (!piece || piece.color !== game.turn()) return;
    selected = square;
    const moves = game.moves({ square, verbose: true });
    highlightMoves(moves.map((m) => m.to));
  }
}

function rowcolToSquare(r, c) {
  const files = "abcdefgh";
  const ranks = "87654321";
  const file = userColor === "white" ? files[c] : files[7 - c];
  const rank = userColor === "white" ? ranks[r] : ranks[7 - r];
  return file + rank;
}

function highlightMoves(moves) {
  const tiles = document.querySelectorAll(".tile");
  tiles.forEach(tile => tile.classList.remove("highlight"));
  moves.forEach(move => {
    const r = 8 - parseInt(move[1]);
    const c = "abcdefgh".indexOf(move[0]);
    getTile(r, c).classList.add("highlight");
  });
}

function updateHistory() {
  moveHistoryElement.innerHTML = "";
  for (let i = 0; i < moveHistory.length; i += 2) {
    const row = document.createElement("div");
    row.classList.add("history-row");
    const moveNum = document.createElement("span");
    moveNum.textContent = `${(i / 2) + 1}.`;
    const whiteMove = document.createElement("span");
    whiteMove.textContent = moveHistory[i];
    const blackMove = document.createElement("span");
    blackMove.textContent = moveHistory[i + 1] || "";
    row.append(moveNum, whiteMove, blackMove);
    moveHistoryElement.appendChild(row);
  }
}

function aiMove() {
  const moves = game.moves();
  if (moves.length === 0) return;
  const move = moves[Math.floor(Math.random() * moves.length)];
  game.move(move);
  moveHistory.push(move);
  updateBoard();
  updateHistory();
  if (game.in_checkmate()) alert("Checkmate!");
  else if (game.in_draw()) alert("Draw!");
}

function resetTimers() {
  clearInterval(timerInterval);
  timerWhite = 0;
  timerBlack = 0;
  updateTimerDisplay();
  timerInterval = null;
}

function startTimers() {
  const limit = parseInt(timerSelector.value);
  if (!limit) return;
  timerInterval = setInterval(() => {
    if (game.turn() === "w") timerWhite++;
    else timerBlack++;
    updateTimerDisplay();
    if (limit && (timerWhite >= limit * 60 || timerBlack >= limit * 60)) {
      clearInterval(timerInterval);
      alert("Time's up!");
    }
  }, 1000);
}

function updateTimerDisplay() {
  const format = (t) => String(Math.floor(t / 60)).padStart(2, '0') + ":" + String(t % 60).padStart(2, '0');
  document.getElementById("whiteTimer").textContent = "White: " + format(timerWhite);
  document.getElementById("blackTimer").textContent = "Black: " + format(timerBlack);
}

function updateTheme() {
  document.body.className = themeSelector.value;
}

themeSelector.addEventListener("change", updateTheme);
newGameBtn.addEventListener("click", initializeGame);
modeSelector.addEventListener("change", () => {
  document.getElementById("colorToggleWrapper").style.display = modeSelector.value === "ai" ? "inline-block" : "none";
});
colorToggle.addEventListener("change", () => {
  userColor = colorToggle.value;
  aiColor = userColor === "white" ? "black" : "white";
  createBoard();
  updateBoard();
});

initializeGame();
