const boardElement = document.getElementById("chessboard");
const historyElement = document.getElementById("history");
const resetBtn = document.getElementById("resetBtn");

let board = [];
let selected = null;
let moveHistory = [];

const initialBoard = [
  ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
  ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
  ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"]
];

function renderBoard() {
  boardElement.innerHTML = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.classList.add((row + col) % 2 === 0 ? "white" : "black");
      square.textContent = board[row][col];
      square.dataset.row = row;
      square.dataset.col = col;
      if (selected && selected.row === row && selected.col === col) {
        square.classList.add("selected");
      }
      square.onclick = () => handleSquareClick(row, col);
      boardElement.appendChild(square);
    }
  }
}

function handleSquareClick(row, col) {
  if (!selected && board[row][col]) {
    selected = { row, col };
  } else if (selected) {
    const from = board[selected.row][selected.col];
    const to = board[row][col];
    if (from !== to || row !== selected.row || col !== selected.col) {
      board[row][col] = from;
      board[selected.row][selected.col] = "";
      moveHistory.push(`${from} ${String.fromCharCode(97 + selected.col)}${8 - selected.row} → ${String.fromCharCode(97 + col)}${8 - row}`);
      updateHistory();
    }
    selected = null;
  }
  renderBoard();
}

function updateHistory() {
  historyElement.innerHTML = "<h3>Move History</h3>";
  moveHistory.forEach((move, i) => {
    const div = document.createElement("div");
    div.textContent = `${i + 1}. ${move}`;
    historyElement.appendChild(div);
  });
}

function resetGame() {
  board = JSON.parse(JSON.stringify(initialBoard));
  moveHistory = [];
  selected = null;
  updateHistory();
  renderBoard();
}

resetBtn.onclick = resetGame;
resetGame();
