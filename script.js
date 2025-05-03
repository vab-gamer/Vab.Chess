// Initialize game and board
const game = new Chess();
const board = Chessboard('board', {
  position: 'start',
  draggable: true,
  pieceTheme: 'https://cdnjs.cloudflare.com/ajax/libs/chessboard-js/1.0.0/img/chesspieces/wikipedia/{piece}.png',
  onDrop: (src, dest) => {
    const move = game.move({ from: src, to: dest, promotion: 'q' });
    if (move === null) return 'snapback'; // Illegal move
  }
});
