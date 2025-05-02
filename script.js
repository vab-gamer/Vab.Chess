const boardElement = document.getElementById("board");
const historyElement = document.getElementById("history");
const resetBtn = document.getElementById("resetBtn");

const game = new Chess();
let selected = null;
let lightColor = "#f0d9b5";
let darkColor = "#b58863";

function renderBoard() {
  boardElement.innerHTML = "";
  const board = game.board();

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.classList.add((row + col) % 2 === 0 ? "light" : "dark");
      square.style.backgroundColor = (row + col) % 2 === 0 ? lightColor : darkColor;

      const piece = board[row][col];
      square.dataset.row = row;
      square.dataset.col = col;

      if (piece) {
        square.textContent = piece.unicode;
      }

      if (selected && selected.row === row && selected.col === col) {
        square.classList.add("selected");
      }

      square.onclick = () => handleClick(row, col);
      boardElement.appendChild(square);
    }
  }
}

function handleClick(row, col) {
  const board = game.board();
  const clicked = board[row][col];

  if (selected) {
    const from = `${"abcdefgh"[selected.col]}${8 - selected.row}`;
    const to = `${"abcdefgh"[col]}${8 - row}`;
    const move = game.move({ from, to, promotion: "q" });

    if (move) selected = null;
    else if (clicked) selected = { row, col };
    else selected = null;
  } else if (clicked) {
    selected = { row, col };
  }

  renderBoard();
  updateHistory();
}

function updateHistory() {
  historyElement.innerHTML = "<h3>Move History</h3>";
  const history = game.history();
  for (let i = 0; i < history.length; i += 2) {
    const white = history[i];
    const black = history[i + 1] || "";
    const div = document.createElement("div");
    div.textContent = `${i / 2 + 1}. ${white} ${black}`;
    historyElement.appendChild(div);
  }
}

function resetGame() {
  game.reset();
  selected = null;
  updateHistory();
  renderBoard();
}

resetBtn.onclick = resetGame;

// Theme modal
const modal = document.getElementById("themeModal");
const btn = document.getElementById("themeBtn");
const span = document.querySelector(".close");

btn.onclick = () => { modal.style.display = "block"; };
span.onclick = () => { modal.style.display = "none"; };
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

document.querySelectorAll('.theme-option').forEach(button => {
  button.onclick = () => {
    lightColor = button.dataset.light;
    darkColor = button.dataset.dark;
    renderBoard();
    modal.style.display = 'none';
  };
});

resetGame();
