// Initialize game
const game = new Chess();
const board = Chessboard('board', {
  position: 'start',
  draggable: true,
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd,
  orientation: 'white',
  pieceTheme: 'https://cdnjs.cloudflare.com/ajax/libs/chessboard-js/1.0.0/img/chesspieces/wikipedia/{piece}.png'
});

// Game state
let moveHistory = [];
let whiteTime = 600; // 10 minutes in seconds
let blackTime = 600;
let timerInterval;

// Start timers
function startTimers() {
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimers, 1000);
}

function updateTimers() {
  if (game.turn() === 'w') {
    whiteTime--;
  } else {
    blackTime--;
  }

  document.getElementById('whiteTimer').textContent = formatTime(whiteTime);
  document.getElementById('blackTimer').textContent = formatTime(blackTime);

  if (whiteTime <= 0 || blackTime <= 0) {
    clearInterval(timerInterval);
    document.getElementById('gameStatus').textContent = `Time's up! ${game.turn() === 'w' ? 'Black' : 'White'} wins by timeout`;
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Drag/drop logic
function onDragStart(source, piece) {
  if (game.isGameOver()) return false;
  if (piece.search(/^b/) !== -1 && game.turn() === 'w') return false;
  if (piece.search(/^w/) !== -1 && game.turn() === 'b') return false;
}

function onDrop(source, target) {
  const move = game.move({
    from: source,
    to: target,
    promotion: 'q' // Always promote to queen for simplicity
  });

  if (move === null) return 'snapback';
  
  updateMoveHistory(move);
  updateGameStatus();
  return true;
}

function onSnapEnd() {
  board.position(game.fen());
}

// Update UI
function updateMoveHistory(move) {
  moveHistory.push(move);
  const moveElement = document.createElement('div');
  moveElement.textContent = `${moveHistory.length}. ${move.piece.toUpperCase()} ${move.from}-${move.to}`;
  document.getElementById('moveHistory').appendChild(moveElement);
}

function updateGameStatus() {
  let status = '';
  
  if (game.isCheckmate()) {
    status = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins`;
  } else if (game.isDraw()) {
    status = 'Draw!';
  } else if (game.isCheck()) {
    status = `Check! ${game.turn() === 'w' ? 'White' : 'Black'}'s turn`;
  } else {
    status = `${game.turn() === 'w' ? 'White' : 'Black'}'s turn`;
  }
  
  document.getElementById('gameStatus').textContent = status;
}

// Button handlers
document.getElementById('newGameBtn').addEventListener('click', () => {
  game.reset();
  board.start();
  moveHistory = [];
  document.getElementById('moveHistory').innerHTML = '';
  whiteTime = 600;
  blackTime = 600;
  document.getElementById('whiteTimer').textContent = '10:00';
  document.getElementById('blackTimer').textContent = '10:00';
  updateGameStatus();
  startTimers();
});

document.getElementById('flipBoardBtn').addEventListener('click', () => {
  board.flip();
});

// Initialize
updateGameStatus();
startTimers();
