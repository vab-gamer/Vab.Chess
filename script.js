const board = Chessboard('board', {
  draggable: true,
  position: 'start',
  onDrop: handleMove
});

const game = new Chess();

function handleMove(source, target) {
  const move = game.move({ from: source, to: target, promotion: 'q' });

  if (!move) return 'snapback';
}
