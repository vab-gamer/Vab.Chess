let game, board, selectedSquare = null, playerColor = 'white', boardTheme = { light: '#f0d9b5', dark: '#b58863' }, timerWhite, timerBlack, interval;

const squareNames = ["a", "b", "c", "d", "e", "f", "g", "h"];

function createCoordinates() {
  const top = document.getElementById("coordinates-top");
  const left = document.getElementById("coordinates-left");
  top.innerHTML = "";
  left.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    const col = document.createElement("div");
    col.textContent = squareNames[i];
    col.style.flex = "1";
    top.appendChild(col);

    const row = document.createElement("div");
    row.textContent = 8 - i;
    row.style.flex = "1";
    left.appendChild(row);
  }
}

function createBoard() {
  board = document.getElementById("chessboard");
  board.innerHTML = "";
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = document.createElement("div");
      square.className = "square";
      square.dataset.row = r;
      square.dataset.col = c;
      const isWhite = (r + c) % 2 === 0;
      square.classList.add(isWhite ? "white-square" : "black-square");
      square.style.backgroundColor = isWhite ? boardTheme.light : boardTheme.dark;
      board.appendChild(square);
    }
  }
}

function resetGame() {
  selectedSquare = null;
  game = new Chess();
  updateBoard();
  document.getElementById("history").innerHTML = "";
}

function updateBoard() {
  document.querySelectorAll(".square").forEach(sq => {
    sq.textContent = "";
  });

  const pos = game.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const square = document.querySelector(`.square[data-row='${r}'][data-col='${c}']`);
      const piece = pos[r][c];
      if (piece) {
        const symbol = piece.type;
        const color = piece.color === 'w' ? '♙♖♘♗♕♔' : '♟♜♞♝♛♚';
        const symbols = ['p','r','n','b','q','k'];
        square.textContent = color[symbols.indexOf(symbol)] || "";
      }
    }
  }

  updateHistory();
}

function updateHistory() {
  const history = game.history({ verbose: true });
  const historyDiv = document.getElementById("history");
  historyDiv.innerHTML = "<h3>Move History</h3>";
  for (let i = 0; i < history.length; i += 2) {
    const white = history[i];
    const black = history[i + 1];
    const text = `${Math.floor(i / 2) + 1}. ${white.san}` + (black ? ` ${black.san}` : "");
    const div = document.createElement("div");
    div.textContent = text;
    historyDiv.appendChild(div);
  }
}

function handleMove(row, col) {
  const file = squareNames[col];
  const rank = 8 - row;
  const square = file + rank;

  if (!selectedSquare) {
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      selectedSquare = square;
      highlightSquare(row, col);
    }
  } else {
    const move = game.move({ from: selectedSquare, to: square, promotion: 'q' });
    if (move) {
      updateBoard();
    }
    clearHighlights();
    selectedSquare = null;
  }
}

function highlightSquare(row, col) {
  clearHighlights();
  const square = document.querySelector(`.square[data-row='${row}'][data-col='${col}']`);
  square.classList.add("selected");
}

function clearHighlights() {
  document.querySelectorAll(".square").forEach(s => s.classList.remove("selected"));
}

function changeTheme(light, dark) {
  boardTheme.light = light;
  boardTheme.dark = dark;
  createBoard();
  updateBoard();
}

document.addEventListener("DOMContentLoaded", () => {
  createCoordinates();
  createBoard();
  game = new Chess();
  updateBoard();

  document.getElementById("resetBtn").onclick = resetGame;
  document.getElementById("themeBtn").onclick = () => document.getElementById("themeModal").style.display = "flex";
  document.querySelector(".close").onclick = () => document.getElementById("themeModal").style.display = "none";

  document.querySelectorAll(".theme-option").forEach(btn => {
    btn.onclick = () => {
      const light = btn.dataset.light;
      const dark = btn.dataset.dark;
      changeTheme(light, dark);
      document.getElementById("themeModal").style.display = "none";
    };
  });

  document.querySelectorAll(".square").forEach(sq => {
    sq.onclick = () => {
      handleMove(parseInt(sq.dataset.row), parseInt(sq.dataset.col));
    };
  });
});
