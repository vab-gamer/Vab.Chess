const boardElement = document.getElementById("chessboard");
const resetButton = document.getElementById("resetBtn");
const historyElement = document.getElementById("history");
const themeButton = document.getElementById("themeBtn");
const themeModal = document.getElementById("themeModal");
const closeModalButton = document.getElementById("closeModal");

const boardState = Array(8).fill().map(() => Array(8).fill(null));
let selectedPiece = null;
let currentPlayer = "white";
let moveHistory = [];
let gameOver = false;

const pieceImages = {
  whitePawn: "images/wp.png",
  blackPawn: "images/bp.png",
  whiteRook: "images/wr.png",
  blackRook: "images/br.png",
  whiteKnight: "images/wn.png",
  blackKnight: "images/bn.png",
  whiteBishop: "images/wb.png",
  blackBishop: "images/bb.png",
  whiteQueen: "images/wq.png",
  blackQueen: "images/bq.png",
  whiteKing: "images/wk.png",
  blackKing: "images/bk.png"
};

// Initialize the board
function initBoard() {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.dataset.row = row;
      square.dataset.col = col;

      // Alternate colors for the squares
      if ((row + col) % 2 === 0) {
        square.classList.add("white");
      } else {
        square.classList.add("black");
      }

      // Add click event to each square
      square.addEventListener("click", handleSquareClick);

      boardElement.appendChild(square);
    }
  }
  resetBoard();
}

// Reset the board to the initial configuration
function resetBoard() {
  const pieces = [
    { type: "Rook", color: "white", row: 0, col: 0 },
    { type: "Knight", color: "white", row: 0, col: 1 },
    { type: "Bishop", color: "white", row: 0, col: 2 },
    { type: "Queen", color: "white", row: 0, col: 3 },
    { type: "King", color: "white", row: 0, col: 4 },
    { type: "Bishop", color: "white", row: 0, col: 5 },
    { type: "Knight", color: "white", row: 0, col: 6 },
    { type: "Rook", color: "white", row: 0, col: 7 },
    { type: "Pawn", color: "white", row: 1, col: 0 },
    { type: "Pawn", color: "white", row: 1, col: 1 },
    { type: "Pawn", color: "white", row: 1, col: 2 },
    { type: "Pawn", color: "white", row: 1, col: 3 },
    { type: "Pawn", color: "white", row: 1, col: 4 },
    { type: "Pawn", color: "white", row: 1, col: 5 },
    { type: "Pawn", color: "white", row: 1, col: 6 },
    { type: "Pawn", color: "white", row: 1, col: 7 },

    { type: "Rook", color: "black", row: 7, col: 0 },
    { type: "Knight", color: "black", row: 7, col: 1 },
    { type: "Bishop", color: "black", row: 7, col: 2 },
    { type: "Queen", color: "black", row: 7, col: 3 },
    { type: "King", color: "black", row: 7, col: 4 },
    { type: "Bishop", color: "black", row: 7, col: 5 },
    { type: "Knight", color: "black", row: 7, col: 6 },
    { type: "Rook", color: "black", row: 7, col: 7 },
    { type: "Pawn", color: "black", row: 6, col: 0 },
    { type: "Pawn", color: "black", row: 6, col: 1 },
    { type: "Pawn", color: "black", row: 6, col: 2 },
    { type: "Pawn", color: "black", row: 6, col: 3 },
    { type: "Pawn", color: "black", row: 6, col: 4 },
    { type: "Pawn", color: "black", row: 6, col: 5 },
    { type: "Pawn", color: "black", row: 6, col: 6 },
    { type: "Pawn", color: "black", row: 6, col: 7 }
  ];

  pieces.forEach(piece => {
    const { type, color, row, col } = piece;
    boardState[row][col] = { type, color };
    const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    const pieceElement = document.createElement("img");
    pieceElement.classList.add("piece");
    pieceElement.src = pieceImages[`${color}${type}`];
    square.appendChild(pieceElement);
  });
}

// Handle square click
function handleSquareClick(event) {
  if (gameOver) return;

  const square = event.target;
  const row = parseInt(square.dataset.row);
  const col = parseInt(square.dataset.col);
  const piece = boardState[row][col];

  if (selectedPiece) {
    // Try to move the selected piece
    const validMove = isValidMove(selectedPiece, row, col);
    if (validMove) {
      makeMove(selectedPiece, row, col);
      selectedPiece = null;
      updateHistory();
    } else {
      // Invalid move, deselect piece
      selectedPiece = null;
      removeSelectedClass();
    }
  } else if (piece && piece.color === currentPlayer) {
    // Select the piece
    selectedPiece = { piece, row, col };
    square.classList.add("selected");
  }
}

// Check if move is valid
function isValidMove(piece, row, col) {
  // Implement basic movement rules here (can be expanded)
  return true;
}

// Make the move on the board
function makeMove(piece, row, col) {
  const { type, color } = piece;
  boardState[piece.row][piece.col] = null;
  boardState[row][col] = { type, color };

  const fromSquare = document.querySelector(`[data-row="${piece.row}"][data-col="${piece.col}"]`);
  const toSquare = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

  // Remove piece from the board
  fromSquare.innerHTML = "";
  // Place the piece on the new square
  const pieceElement = document.createElement("img");
  pieceElement.classList.add("piece");
  pieceElement.src = pieceImages[`${color}${type}`];
  toSquare.appendChild(pieceElement);
}

// Update the move history
function updateHistory() {
  moveHistory.push(`Move: ${currentPlayer}`);
  const moveDiv = document.createElement("div");
  moveDiv.textContent = moveHistory[moveHistory.length - 1];
  historyElement.appendChild(moveDiv);
}

// Reset the game
resetButton.addEventListener("click", () => {
  selectedPiece = null;
  currentPlayer = "white";
  moveHistory = [];
  gameOver = false;
  boardState.forEach(row => row.fill(null));
  boardElement.innerHTML = "";
  historyElement.innerHTML = "";
  initBoard();
});

initBoard();
