// Script for Vab.Chess

// Set up the chessboard
const boardElement = document.getElementById("chessboard");
const resetBtn = document.getElementById("resetBtn");
const historyElement = document.getElementById("history");
const themeModal = document.getElementById("themeModal");
const themeBtn = document.getElementById("themeBtn");
const closeModal = document.querySelector(".close");

let board = [];
let selected = null;
let moveHistory = [];
let currentTheme = {
  light: '#f0d9b5',
  dark: '#b58863'
};

// Initial board setup
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

// Initialize board
function initBoard() {
  board = JSON.parse(JSON.stringify(initialBoard));
  moveHistory = [];
  renderBoard();
  updateHistory();
}

// Render chessboard and pieces
function renderBoard() {
  boardElement.innerHTML = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.classList.add((row + col) % 2 === 0 ? "light" : "dark");
      square.textContent = board[row][col];
      square.dataset.row = row;
      square.dataset.col = col;
      square.style.backgroundColor = (row + col) % 2 === 0 ? currentTheme.light : currentTheme.dark;

      if (selected && selected.row === row && selected.col === col) {
        square.classList.add("selected");
      }

      square.onclick = () => handleSquareClick(row, col);
      boardElement.appendChild(square);
    }
  }
}

// Handle square click for piece movement
function handleSquareClick(row, col) {
  if (!selected && board[row][col]) {
    selected = { row, col };
  } else if (selected) {
    const from = board[selected.row][selected.col];
    const to = board[row][col];
    
    if (from !== to || row !== selected.row || col !== selected.col) {
      board[row][col] = from;
      board[selected.row][selected.col] = "";
      
      const move = `${from} ${String.fromCharCode(97 + selected.col)}${8 - selected.row} → ${String.fromCharCode(97 + col)}${8 - row}`;
      moveHistory.push(move);
      updateHistory();
    }
    selected = null;
  }
  
  renderBoard();
}

// Update move history display
function updateHistory() {
  historyElement.innerHTML = "<h3>Move History</h3>";
  moveHistory.forEach((move, index) => {
    const div = document.createElement("div");
    div.textContent = `${index + 1}. ${move}`;
    historyElement.appendChild(div);
  });
}

// Reset the game
resetBtn.onclick = () => {
  initBoard();
};

// Modal functionality for theme change
themeBtn.onclick = () => { themeModal.style.display = "block"; };
closeModal.onclick = () => { themeModal.style.display = "none"; };
window.onclick = (event) => {
  if (event.target === themeModal) {
    themeModal.style.display = "none";
  }
};

// Apply selected theme to the board
document.querySelectorAll('.theme-option').forEach(button => {
  button.onclick = () => {
    const light = button.dataset.light;
    const dark = button.dataset.dark;
    currentTheme.light = light;
    currentTheme.dark = dark;
    renderBoard();
    themeModal.style.display = 'none';
  };
});

// Initialize board on load
initBoard();
