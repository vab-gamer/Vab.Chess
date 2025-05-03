const game = new Chess();
const board = Chessboard('board', {
  position: 'start',
  draggable: true,
  pieceTheme: (piece) => {
    // Use Wikimedia's free chess pieces
    return `https://upload.wikimedia.org/wikipedia/commons/${getPieceCode(piece)}`;
  },
  onDrop: (src, dest) => {
    const move = game.move({ from: src, to: dest, promotion: 'q' });
    if (move === null) return 'snapback';
    updateStatus();
  }
});

function getPieceCode(piece) {
  const codes = {
    'wK': '4/42/Chess_klt45.svg',
    'wQ': '1/15/Chess_qlt45.svg',
    'wR': '7/72/Chess_rlt45.svg',
    'wB': 'b/b1/Chess_blt45.svg',
    'wN': '7/70/Chess_nlt45.svg',
    'wP': '4/45/Chess_plt45.svg',
    'bK': 'f/f0/Chess_kdt45.svg',
    'bQ': '4/47/Chess_qdt45.svg',
    'bR': 'f/ff/Chess_rdt45.svg',
    'bB': '9/98/Chess_bdt45.svg',
    'bN': 'e/e7/Chess_ndt45.svg',
    'bP': 'c/c7/Chess_pdt45.svg'
  };
  return codes[piece];
}

function updateStatus() {
  let status = game.turn() === 'w' ? "White's turn" : "Black's turn";
  if (game.isCheckmate()) status = "Checkmate!";
  else if (game.isCheck()) status = "Check!";
  document.getElementById('status').textContent = status;
}
