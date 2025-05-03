// Initialize game
const game = new Chess();
const board = Chessboard('board', {
  position: 'start',
  draggable: true,
  pieceTheme: 'https://cdnjs.cloudflare.com/ajax/libs/chessboard-js/1.0.0/img/chesspieces/wikipedia/{piece}.png',
  onDragStart: (src, piece) => {
    // Only pick up pieces for the side to move
    if (game.isGameOver() || 
        (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false;
    }
  },
  onDrop: (src, dest) => {
    // Try to make the move
    const move = game.move({
      from: src,
      to: dest,
      promotion: 'q' // NOTE: always promote to queen for simplicity
    });

    // Illegal move
    if (move === null) return 'snapback';
    
    // Update UI
    updateMoveHistory(move);
    updateStatus();
  },
  onSnapEnd: () => {
    // Sync board position with game state
    board.position(game.fen());
  }
});

// Game state
let moveHistory = [];
let whiteTime = 600; // 10 minutes in seconds
let blackTime = 600;
let timerInterval;

// Timer functions
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

  // Check for timeout
  if (whiteTime <= 0 || blackTime <= 0) {
    clearInterval(timerInterval);
    const winner = whiteTime <= 0 ? 'Black' : 'White';
    document.getElementById('gameStatus').textContent = `Time's up! ${winner} wins by timeout`;
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// UI updates
function updateMoveHistory(move) {
  moveHistory.push(move);
  const moveElement = document.createElement('div');
  const moveNumber = Math.ceil(moveHistory.length / 2);
  const isWhiteMove = moveHistory.length % 2 !== 0;
  
  if (isWhiteMove) {
    moveElement.textContent = `${moveNumber}. ${move.piece.toUpperCase()} ${move.from}-${move.to}`;
  } else {
    const lastMove = document.querySelector('#moveHistory div:last-child');
    lastMove.textContent += ` ${move.piece.toUpperCase()} ${move.from}-${move.to}`;
  }
  
  document.getElementById('moveHistory').appendChild(moveElement);
  // Auto-scroll to bottom
  document.getElementById('moveHistory').scrollTop = document.getElementById('moveHistory').scrollHeight;
}

function updateStatus() {
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
  updateStatus();
  startTimers();
});

document.getElementById('flipBoardBtn').addEventListener('click', () => {
  board.flip();
});

// Initialize
updateStatus();
startTimers();
