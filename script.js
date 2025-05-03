const game = new Chess();
const board = Chessboard('board', {
  position: 'start',
  draggable: true,
  onDrop: handleMove,
});

function handleMove(source, target) {
  const move = game.move({
    from: source,
    to: target,
    promotion: 'q', // Auto-promote to queen for simplicity
  });

  if (move === null) return 'snapback'; // Illegal move

  updateStatus();
}

function updateStatus() {
  let status = '';

  if (game.isCheckmate()) status = 'Checkmate! ';
  else if (game.isDraw()) status = 'Draw! ';
  else if (game.isCheck()) status = 'Check! ';

  status += `Turn: ${game.turn() === 'w' ? 'White' : 'Black'}`;
  document.getElementById('status').textContent = status;
}

document.getElementById('resetBtn').addEventListener('click', () => {
  game.reset();
  board.start();
  updateStatus();
});

// Initialize
updateStatus();
