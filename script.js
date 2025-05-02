let board = null;
let game = new Chess();

function onDrop(source, target) {
  const move = game.move({
    from: source,
    to: target,
    promotion: 'q'
  });

  if (move === null) return 'snapback';
  updateHistory();
}

function updateHistory() {
  const historyList = document.getElementById('history');
  historyList.innerHTML = '';
  game.history().forEach((move, index) => {
    const li = document.createElement('li');
    li.textContent = move;
    historyList.appendChild(li);
  });
}

function resetGame() {
  game.reset();
  board.position(game.fen());
  updateHistory();
}

const config = {
  draggable: true,
  position: 'start',
  onDrop: onDrop
};

board = Chessboard('board', config);
