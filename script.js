// == Vab.Chess by Vab-Gamer ==

// SVG PIECES (simple, scalable, can be replaced with more detailed SVGs)
const PIECE_SVGS = {
    wK: `<svg width="40" height="40"><g><circle cx="20" cy="20" r="15" fill="#fff"/><text x="20" y="27" font-size="22" text-anchor="middle" fill="#222" font-family="Arial">♔</text></g></svg>`,
    wQ: `<svg width="40" height="40"><g><circle cx="20" cy="20" r="15" fill="#fff"/><text x="20" y="27" font-size="22" text-anchor="middle" fill="#222" font-family="Arial">♕</text></g></svg>`,
    wR: `<svg width="40" height="40"><g><circle cx="20" cy="20" r="15" fill="#fff"/><text x="20" y="27" font-size="22" text-anchor="middle" fill="#222" font-family="Arial">♖</text></g></svg>`,
    wB: `<svg width="40" height="40"><g><circle cx="20" cy="20" r="15" fill="#fff"/><text x="20" y="27" font-size="22" text-anchor="middle" fill="#222" font-family="Arial">♗</text></g></svg>`,
    wN: `<svg width="40" height="40"><g><circle cx="20" cy="20" r="15" fill="#fff"/><text x="20" y="27" font-size="22" text-anchor="middle" fill="#222" font-family="Arial">♘</text></g></svg>`,
    wP: `<svg width="40" height="40"><g><circle cx="20" cy="20" r="15" fill="#fff"/><text x="20" y="27" font-size="22" text-anchor="middle" fill="#222" font-family="Arial">♙</text></g></svg>`,
    bK: `<svg width="40" height="40"><g><circle cx="20" cy="20" r="15" fill="#222"/><text x="20" y="27" font-size="22" text-anchor="middle" fill="#ffe082" font-family="Arial">♚</text></g></svg>`,
    bQ: `<svg width="40" height="40"><g><circle cx="20" cy="20" r="15" fill="#222"/><text x="20" y="27" font-size="22" text-anchor="middle" fill="#ffe082" font-family="Arial">♛</text></g></svg>`,
    bR: `<svg width="40" height="40"><g><circle cx="20" cy="20" r="15" fill="#222"/><text x="20" y="27" font-size="22" text-anchor="middle" fill="#ffe082" font-family="Arial">♜</text></g></svg>`,
    bB: `<svg width="40" height="40"><g><circle cx="20" cy="20" r="15" fill="#222"/><text x="20" y="27" font-size="22" text-anchor="middle" fill="#ffe082" font-family="Arial">♝</text></g></svg>`,
    bN: `<svg width="40" height="40"><g><circle cx="20" cy="20" r="15" fill="#222"/><text x="20" y="27" font-size="22" text-anchor="middle" fill="#ffe082" font-family="Arial">♞</text></g></svg>`,
    bP: `<svg width="40" height="40"><g><circle cx="20" cy="20" r="15" fill="#222"/><text x="20" y="27" font-size="22" text-anchor="middle" fill="#ffe082" font-family="Arial">♟</text></g></svg>`
};

// Chessboard logic and state
class ChessGame {
    constructor() {
        this.reset();
    }

    reset() {
        // FEN for starting position
        this.board = [
            ['bR','bN','bB','bQ','bK','bB','bN','bR'],
            ['bP','bP','bP','bP','bP','bP','bP','bP'],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            [null,null,null,null,null,null,null,null],
            ['wP','wP','wP','wP','wP','wP','wP','wP'],
            ['wR','wN','wB','wQ','wK','wB','wN','wR']
        ];
        this.turn = 'w';
        this.castling = {wK: true, wQ: true, bK: true, bQ: true};
        this.enPassant = null;
        this.halfmove = 0;
        this.fullmove = 1;
        this.history = [];
        this.moveHistory = [];
        this.result = null;
        this.promotion = null;
    }

    clone() {
        let c = new ChessGame();
        c.board = this.board.map(row => row.slice());
        c.turn = this.turn;
        c.castling = {...this.castling};
        c.enPassant = this.enPassant;
        c.halfmove = this.halfmove;
        c.fullmove = this.fullmove;
        c.history = this.history.slice();
        c.moveHistory = this.moveHistory.slice();
        c.result = this.result;
        c.promotion = this.promotion;
        return c;
    }

    // --- Chess logic ---
    static inBounds(x, y) { return x >= 0 && x < 8 && y >= 0 && y < 8; }
    static algebraic(x, y) { return 'abcdefgh'[x] + (8-y); }
    static posFromAlg(alg) {
        return [ 'abcdefgh'.indexOf(alg[0]), 8 - parseInt(alg[1]) ];
    }
    static pieceColor(piece) { return piece ? piece[0] : null; }

    getPiece(x, y) {
        if (!ChessGame.inBounds(x, y)) return null;
        return this.board[y][x];
    }

    setPiece(x, y, piece) {
        if (ChessGame.inBounds(x, y)) this.board[y][x] = piece;
    }

    isCheck(color) {
        let kingPos = null;
        for (let y=0; y<8; y++) for (let x=0; x<8; x++) {
            let p = this.getPiece(x, y);
            if (p === color+'K') kingPos = [x, y];
        }
        if (!kingPos) return false;
        return this.isAttacked(kingPos[0], kingPos[1], color === 'w' ? 'b' : 'w');
    }

    isAttacked(x, y, byColor) {
        // For all enemy pieces, see if they attack (x, y)
        for (let yy=0; yy<8; yy++) for (let xx=0; xx<8; xx++) {
            let p = this.getPiece(xx, yy);
            if (p && ChessGame.pieceColor(p) === byColor) {
                let moves = this.pseudoMoves(xx, yy, true);
                if (moves.some(m => m[0] === x && m[1] === y)) return true;
            }
        }
        return false;
    }

    pseudoMoves(x, y, forAttack=false) {
        // Returns array of [toX, toY, options]
        let piece = this.getPiece(x, y);
        if (!piece) return [];
        let color = piece[0], type = piece[1];
        let moves = [];
        let dirs, nx, ny;
        if (type === 'P') {
            let dir = color === 'w' ? -1 : 1;
            // Forward
            if (!forAttack) {
                if (!this.getPiece(x, y+dir)) {
                    moves.push([x, y+dir]);
                    if ((color==='w' && y===6) || (color==='b' && y===1)) {
                        if (!this.getPiece(x, y+2*dir)) moves.push([x, y+2*dir]);
                    }
                }
            }
            // Captures
            for (let dx of [-1,1]) {
                nx = x+dx; ny = y+dir;
                if (ChessGame.inBounds(nx, ny)) {
                    let target = this.getPiece(nx, ny);
                    if (target && ChessGame.pieceColor(target) !== color) moves.push([nx, ny]);
                    // En passant
                    if (this.enPassant && this.enPassant[0] === nx && this.enPassant[1] === ny) {
                        moves.push([nx, ny, {enPassant: true}]);
                    }
                }
            }
        } else if (type === 'N') {
            for (let [dx,dy] of [[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]]) {
                nx = x+dx; ny = y+dy;
                if (ChessGame.inBounds(nx, ny)) {
                    let target = this.getPiece(nx, ny);
                    if (!target || ChessGame.pieceColor(target) !== color) moves.push([nx, ny]);
                }
            }
        } else if (type === 'B' || type === 'R' || type === 'Q') {
            dirs = [];
            if (type === 'B' || type === 'Q') dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);
            if (type === 'R' || type === 'Q') dirs.push([1,0],[-1,0],[0,1],[0,-1]);
            for (let [dx,dy] of dirs) {
                nx = x+dx; ny = y+dy;
                while (ChessGame.inBounds(nx, ny)) {
                    let target = this.getPiece(nx, ny);
                    if (!target) moves.push([nx, ny]);
                    else {
                        if (ChessGame.pieceColor(target) !== color) moves.push([nx, ny]);
                        break;
                    }
                    nx += dx; ny += dy;
                }
            }
        } else if (type === 'K') {
            for (let dx of [-1,0,1]) for (let dy of [-1,0,1]) {
                if (dx===0 && dy===0) continue;
                nx = x+dx; ny = y+dy;
                if (ChessGame.inBounds(nx, ny)) {
                    let target = this.getPiece(nx, ny);
                    if (!target || ChessGame.pieceColor(target) !== color) moves.push([nx, ny]);
                }
            }
            // Castling
            if (!forAttack && !this.isCheck(color)) {
                if (this.castling[color+'K'] && this.canCastle(x, y, 'K')) moves.push([x+2, y, {castle: 'K'}]);
                if (this.castling[color+'Q'] && this.canCastle(x, y, 'Q')) moves.push([x-2, y, {castle: 'Q'}]);
            }
        }
        return moves.filter(m => ChessGame.inBounds(m[0], m[1]));
    }

    canCastle(x, y, side) {
        let color = this.getPiece(x, y)[0];
        if (side === 'K') {
            if (this.getPiece(x+1, y) || this.getPiece(x+2, y)) return false;
            if (this.isAttacked(x+1, y, color==='w'?'b':'w') || this.isAttacked(x+2, y, color==='w'?'b':'w')) return false;
            let rook = this.getPiece(x+3, y);
            if (rook !== color+'R') return false;
            return true;
        } else {
            if (this.getPiece(x-1, y) || this.getPiece(x-2, y) || this.getPiece(x-3, y)) return false;
            if (this.isAttacked(x-1, y, color==='w'?'b':'w') || this.isAttacked(x-2, y, color==='w'?'b':'w')) return false;
            let rook = this.getPiece(x-4, y);
            if (rook !== color+'R') return false;
            return true;
        }
    }

    legalMoves(x, y) {
        let moves = this.pseudoMoves(x, y);
        let color = this.getPiece(x, y)[0];
        let legal = [];
        for (let m of moves) {
            let test = this.clone();
            test.makeMove(x, y, m[0], m[1], m[2]);
            if (!test.isCheck(color)) legal.push(m);
        }
        return legal;
    }

    makeMove(fromX, fromY, toX, toY, opts={}) {
        let piece = this.getPiece(fromX, fromY);
        let color = piece[0], type = piece[1];
        let target = this.getPiece(toX, toY);
        let move = {
            from: [fromX, fromY],
            to: [toX, toY],
            piece, target,
            opts: opts || {},
            castling: {...this.castling},
            enPassant: this.enPassant,
            halfmove: this.halfmove,
            fullmove: this.fullmove
        };

        // En passant
        if (opts && opts.enPassant) {
            let dir = color === 'w' ? 1 : -1;
            this.setPiece(toX, toY+dir, null);
        }
        // Castling
        if (opts && opts.castle) {
            if (opts.castle === 'K') {
                this.setPiece(fromX+1, fromY, this.getPiece(fromX+3, fromY));
                this.setPiece(fromX+3, fromY, null);
            } else {
                this.setPiece(fromX-1, fromY, this.getPiece(fromX-4, fromY));
                this.setPiece(fromX-4, fromY, null);
            }
        }
        // Move piece
        this.setPiece(toX, toY, piece);
        this.setPiece(fromX, fromY, null);

        // Pawn promotion
        if (type === 'P' && (toY === 0 || toY === 7)) {
            this.promotion = {x: toX, y: toY, color};
        } else {
            this.promotion = null;
        }

        // Castling rights
        if (type === 'K') {
            this.castling[color+'K'] = false;
            this.castling[color+'Q'] = false;
        }
        if (type === 'R') {
            if (fromX === 0 && fromY === (color==='w'?7:0)) this.castling[color+'Q'] = false;
            if (fromX === 7 && fromY === (color==='w'?7:0)) this.castling[color+'K'] = false;
        }

        // En passant
        if (type === 'P' && Math.abs(toY-fromY) === 2) {
            this.enPassant = [fromX, (fromY+toY)/2];
        } else {
            this.enPassant = null;
        }

        // Halfmove clock
        if (type === 'P' || target) this.halfmove = 0;
        else this.halfmove++;

        // Fullmove clock
        if (color === 'b') this.fullmove++;

        // Turn
        this.turn = color === 'w' ? 'b' : 'w';

        this.history.push(move);

        // Move notation
        let notation = this.moveToNotation(move);
        this.moveHistory.push(notation);

        // Check for game end
        if (this.isCheckmate(this.turn)) {
            this.result = (this.turn === 'w' ? 'Black' : 'White') + ' wins by checkmate';
        } else if (this.isStalemate(this.turn)) {
            this.result = 'Draw by stalemate';
        } else if (this.halfmove >= 100) {
            this.result = 'Draw by 50-move rule';
        } else if (this.isInsufficientMaterial()) {
            this.result = 'Draw by insufficient material';
        } else {
            this.result = null;
        }
    }

    promote(toPiece) {
        if (!this.promotion) return;
        let {x, y, color} = this.promotion;
        this.setPiece(x, y, color + toPiece);
        this.promotion = null;
    }

    isCheckmate(color) {
        if (!this.isCheck(color)) return false;
        for (let y=0; y<8; y++) for (let x=0; x<8; x++) {
            let p = this.getPiece(x, y);
            if (p && ChessGame.pieceColor(p) === color) {
                if (this.legalMoves(x, y).length > 0) return false;
            }
        }
        return true;
    }

    isStalemate(color) {
        if (this.isCheck(color)) return false;
        for (let y=0; y<8; y++) for (let x=0; x<8; x++) {
            let p = this.getPiece(x, y);
            if (p && ChessGame.pieceColor(p) === color) {
                if (this.legalMoves(x, y).length > 0) return false;
            }
        }
        return true;
    }

    isInsufficientMaterial() {
        // Only kings, or king + bishop/knight vs king, or king+bishop vs king+bishop (same color)
        let pieces = [];
        for (let y=0; y<8; y++) for (let x=0; x<8; x++) {
            let p = this.getPiece(x, y);
            if (p) pieces.push(p[1]);
        }
        if (pieces.every(t => t === 'K')) return true;
        if (pieces.length === 3 && pieces.includes('B')) return true;
        if (pieces.length === 3 && pieces.includes('N')) return true;
        if (pieces.length === 4 && pieces.filter(t=>t==='B').length===2) return true;
        return false;
    }

    moveToNotation(move) {
        // Simple algebraic notation
        let piece = move.piece[1] === 'P' ? '' : move.piece[1];
        let from = ChessGame.algebraic(move.from[0], move.from[1]);
        let to = ChessGame.algebraic(move.to[0], move.to[1]);
        let capture = move.target ? 'x' : '';
        let special = '';
        if (move.opts && move.opts.castle === 'K') special = 'O-O';
        else if (move.opts && move.opts.castle === 'Q') special = 'O-O-O';
        else if (move.piece[1] === 'P' && move.target) piece = from[0];
        if (special) return special;
        let promo = '';
        if (move.opts && move.opts.promotion) promo = '=' + move.opts.promotion;
        return piece + capture + to + promo;
    }

    getPGN() {
        let pgn = '';
        for (let i=0; i<this.moveHistory.length; i++) {
            if (i%2===0) pgn += Math.floor(i/2)+1 + '. ';
            pgn += this.moveHistory[i] + ' ';
        }
        return pgn.trim();
    }
}

// --- UI/UX ---

const SQUARE_SIZE = 50; // px (board is 8x8)
let game = new ChessGame();
let selected = null, legalSquares = [], dragging = null, dragOffset = [0,0];
let timers = {w: 0, b: 0}, timerInterval = null, timerActive = false, timerOptions = {};
let botThinking = false;

// DOM Elements
const boardSVG = document.getElementById('chessboard');
const moveList = document.getElementById('moveList');
const copyHistoryBtn = document.getElementById('copyHistoryBtn');
const startBtn = document.getElementById('startBtn');
const gameModeSel = document.getElementById('gameMode');
const botDifficultySel = document.getElementById('botDifficulty');
const botDifficultySection = document.getElementById('botDifficultySection');
const timerSelect = document.getElementById('timerSelect');
const customMinutes = document.getElementById('customMinutes');
const whiteTimer = document.getElementById('white-timer');
const blackTimer = document.getElementById('black-timer');
const moveSound = document.getElementById('moveSound');
const captureSound = document.getElementById('captureSound');
const checkSound = document.getElementById('checkSound');

// Responsive board
function boardSize() {
    return Math.min(boardSVG.clientWidth, boardSVG.clientHeight);
}
function squareAt(x, y) {
    let size = boardSize()/8;
    return [x*size, y*size, size, size];
}

function renderBoard() {
    let svg = '';
    let size = boardSize();
    let sqSize = size/8;
    // Draw squares
    for (let y=0; y<8; y++) for (let x=0; x<8; x++) {
        let light = (x+y)%2===0;
        let highlight = '';
        if (selected && selected[0]===x && selected[1]===y) highlight = 'stroke="#ffd600" stroke-width="3"';
        else if (legalSquares.some(sq=>sq[0]===x&&sq[1]===y)) highlight = 'stroke="#ffd600" stroke-width="2"';
        svg += `<rect x="${x*sqSize}" y="${y*sqSize}" width="${sqSize}" height="${sqSize}" fill="${light?'#fff9c4':'#222'}" ${highlight}/>`;
    }
    // Draw pieces
    for (let y=0; y<8; y++) for (let x=0; x<8; x++) {
        let p = game.getPiece(x, y);
        if (p) {
            if (dragging && dragging.from[0]===x && dragging.from[1]===y) continue;
            svg += `<g data-x="${x}" data-y="${y}" class="piece" style="cursor:pointer;" transform="translate(${x*sqSize},${y*sqSize})">${PIECE_SVGS[p]}</g>`;
        }
    }
    // Dragging piece
    if (dragging) {
        let [dx, dy] = dragOffset;
        let p = game.getPiece(dragging.from[0], dragging.from[1]);
        svg += `<g class="piece dragging" style="pointer-events:none;" transform="translate(${dx-sqSize/2},${dy-sqSize/2})">${PIECE_SVGS[p]}</g>`;
    }
    boardSVG.innerHTML = svg;
}
function renderMoveHistory() {
    moveList.innerHTML = '';
    for (let i=0; i<game.moveHistory.length; i+=2) {
        let li = document.createElement('li');
        li.textContent = (game.moveHistory[i] || '') + (game.moveHistory[i+1] ? ' ' + game.moveHistory[i+1] : '');
        moveList.appendChild(li);
    }
}
function renderTimers() {
    whiteTimer.textContent = timers.w > 0 ? formatTime(timers.w) : '--:--';
    blackTimer.textContent = timers.b > 0 ? formatTime(timers.b) : '--:--';
    whiteTimer.style.background = game.turn === 'w' ? '#ffd600' : '';
    blackTimer.style.background = game.turn === 'b' ? '#ffd600' : '';
}
function formatTime(sec) {
    let m = Math.floor(sec/60), s = sec%60;
    return `${m}:${s<10?'0':''}${s}`;
}
function showPromotionDialog(color, cb) {
    let overlay = document.createElement('div');
    overlay.className = 'promotion-overlay';
    overlay.style.position = 'fixed';
    overlay.style.left = 0;
    overlay.style.top = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.4)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = 1000;
    let box = document.createElement('div');
    box.style.background = '#fffbe6';
    box.style.padding = '2rem';
    box.style.borderRadius = '1rem';
    box.style.display = 'flex';
    box.style.gap = '1rem';
    ['Q','R','B','N'].forEach(t => {
        let btn = document.createElement('button');
        btn.innerHTML = PIECE_SVGS[color+t];
        btn.style.width = '60px';
        btn.style.height = '60px';
        btn.style.background = 'none';
        btn.style.border = '2px solid #222';
        btn.style.borderRadius = '0.7rem';
        btn.onclick = () => {
            document.body.removeChild(overlay);
            cb(t);
        };
        box.appendChild(btn);
    });
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

// --- Game Control ---

function startNewGame() {
    game.reset();
    selected = null;
    legalSquares = [];
    dragging = null;
    timers = {w: 0, b: 0};
    timerActive = false;
    clearInterval(timerInterval);
    // Timer setup
    let timerVal = timerSelect.value;
    let t = 0;
    if (timerVal === 'ultra-bullet') t = 15;
    else if (timerVal === 'bullet') t = 60;
    else if (timerVal === 'rapid') t = 600;
    else if (timerVal === 'classical') t = 1800;
    else if (timerVal === 'custom') t = Math.max(1, parseInt(customMinutes.value))*60;
    if (timerVal !== 'none') {
        timers = {w: t, b: t};
        timerActive = true;
        renderTimers();
    } else {
        timers = {w: 0, b: 0};
        renderTimers();
    }
    renderBoard();
    renderMoveHistory();
    updateBotSection();
    if (timerActive) startTimer();
    if (isBotTurn()) setTimeout(botMove, 500);
}
function updateBotSection() {
    if (gameModeSel.value === 'human-vs-bot') {
        botDifficultySection.style.display = '';
    } else {
        botDifficultySection.style.display = 'none';
    }
}
function isBotTurn() {
    return gameModeSel.value === 'human-vs-bot' && ((game.turn === 'b' && true) || (game.turn === 'w' && false));
}
function isHumanTurn() {
    return !isBotTurn();
}
function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!timerActive || game.result) return;
        timers[game.turn]--;
        renderTimers();
        if (timers[game.turn] <= 0) {
            timerActive = false;
            game.result = (game.turn === 'w' ? 'Black' : 'White') + ' wins on time';
            showGameEnd();
            clearInterval(timerInterval);
        }
    }, 1000);
}
function stopTimer() {
    clearInterval(timerInterval);
}
function showGameEnd() {
    setTimeout(() => {
        alert('Game Over: ' + game.result);
    }, 300);
}

// --- Board Interaction ---

function getSquareFromEvent(evt) {
    let rect = boardSVG.getBoundingClientRect();
    let x = ((evt.touches ? evt.touches[0].clientX : evt.clientX) - rect.left) / rect.width * 8;
    let y = ((evt.touches ? evt.touches[0].clientY : evt.clientY) - rect.top) / rect.height * 8;
    return [Math.floor(x), Math.floor(y)];
}

boardSVG.addEventListener('mousedown', (evt) => {
    if (game.result || botThinking) return;
    let [x, y] = getSquareFromEvent(evt);
    let p = game.getPiece(x, y);
    if (p && ChessGame.pieceColor(p) === game.turn && isHumanTurn()) {
        selected = [x, y];
        legalSquares = game.legalMoves(x, y).map(m => [m[0], m[1]]);
        dragging = {from: [x, y]};
        dragOffset = [evt.clientX - boardSVG.getBoundingClientRect().left, evt.clientY - boardSVG.getBoundingClientRect().top];
        renderBoard();
    }
});
boardSVG.addEventListener('mousemove', (evt) => {
    if (dragging) {
        dragOffset = [evt.clientX - boardSVG.getBoundingClientRect().left, evt.clientY - boardSVG.getBoundingClientRect().top];
        renderBoard();
    }
});
boardSVG.addEventListener('mouseup', (evt) => {
    if (dragging) {
        let [x, y] = getSquareFromEvent(evt);
        let moves = game.legalMoves(dragging.from[0], dragging.from[1]);
        let move = moves.find(m => m[0]===x && m[1]===y);
        if (move) {
            handleMove(dragging.from[0], dragging.from[1], x, y, move[2]);
        }
        selected = null;
        legalSquares = [];
        dragging = null;
        renderBoard();
    }
});
boardSVG.addEventListener('mouseleave', () => {
    dragging = null;
    renderBoard();
});

// Touch events for mobile
boardSVG.addEventListener('touchstart', (evt) => {
    if (game.result || botThinking) return;
    let [x, y] = getSquareFromEvent(evt);
    let p = game.getPiece(x, y);
    if (p && ChessGame.pieceColor(p) === game.turn && isHumanTurn()) {
        selected = [x, y];
        legalSquares = game.legalMoves(x, y).map(m => [m[0], m[1]]);
        dragging = {from: [x, y]};
        dragOffset = [evt.touches[0].clientX - boardSVG.getBoundingClientRect().left, evt.touches[0].clientY - boardSVG.getBoundingClientRect().top];
        renderBoard();
    }
});
boardSVG.addEventListener('touchmove', (evt) => {
    if (dragging) {
        dragOffset = [evt.touches[0].clientX - boardSVG.getBoundingClientRect().left, evt.touches[0].clientY - boardSVG.getBoundingClientRect().top];
        renderBoard();
        evt.preventDefault();
    }
});
boardSVG.addEventListener('touchend', (evt) => {
    if (dragging) {
        let [x, y] = getSquareFromEvent(evt.changedTouches[0]);
        let moves = game.legalMoves(dragging.from[0], dragging.from[1]);
        let move = moves.find(m => m[0]===x && m[1]===y);
        if (move) {
            handleMove(dragging.from[0], dragging.from[1], x, y, move[2]);
        }
        selected = null;
        legalSquares = [];
        dragging = null;
        renderBoard();
    }
});

// Click-to-move
boardSVG.addEventListener('click', (evt) => {
    if (game.result || botThinking) return;
    let [x, y] = getSquareFromEvent(evt);
    if (selected) {
        let moves = game.legalMoves(selected[0], selected[1]);
        let move = moves.find(m => m[0]===x && m[1]===y);
        if (move) {
            handleMove(selected[0], selected[1], x, y, move[2]);
            selected = null;
            legalSquares = [];
            renderBoard();
            return;
        }
    }
    let p = game.getPiece(x, y);
    if (p && ChessGame.pieceColor(p) === game.turn && isHumanTurn()) {
        selected = [x, y];
        legalSquares = game.legalMoves(x, y).map(m => [m[0], m[1]]);
        renderBoard();
    } else {
        selected = null;
        legalSquares = [];
        renderBoard();
    }
});

function handleMove(fromX, fromY, toX, toY, opts) {
    let piece = game.getPiece(fromX, fromY);
    let target = game.getPiece(toX, toY);
    let isCapture = !!target || (opts && opts.enPassant);
    let willPromote = piece[1] === 'P' && (toY === 0 || toY === 7);
    if (willPromote) {
        showPromotionDialog(piece[0], (prom) => {
            opts = {...(opts||{}), promotion: prom};
            game.makeMove(fromX, fromY, toX, toY, opts);
            game.promote(prom);
            playMoveSound(isCapture, game.isCheck(game.turn));
            renderBoard();
            renderMoveHistory();
            renderTimers();
            if (game.result) showGameEnd();
            else if (isBotTurn()) setTimeout(botMove, 500);
        });
    } else {
        game.makeMove(fromX, fromY, toX, toY, opts);
        if (opts && opts.promotion) game.promote(opts.promotion);
        playMoveSound(isCapture, game.isCheck(game.turn));
        renderBoard();
        renderMoveHistory();
        renderTimers();
        if (game.result) showGameEnd();
        else if (isBotTurn()) setTimeout(botMove, 500);
    }
}

function playMoveSound(isCapture, isCheck) {
    if (isCheck) checkSound.play();
    else if (isCapture) captureSound.play();
    else moveSound.play();
}

// --- Move History Export ---

copyHistoryBtn.addEventListener('click', () => {
    let pgn = game.getPGN();
    navigator.clipboard.writeText(pgn);
    copyHistoryBtn.textContent = 'Copied!';
    setTimeout(() => copyHistoryBtn.textContent = 'Copy-Move History', 1200);
});

// --- Controls ---

startBtn.addEventListener('click', startNewGame);
gameModeSel.addEventListener('change', () => {
    updateBotSection();
    startNewGame();
});
timerSelect.addEventListener('change', () => {
    if (timerSelect.value === 'custom') {
        customMinutes.style.display = '';
    } else {
        customMinutes.style.display = 'none';
    }
});
customMinutes.addEventListener('input', () => {
    if (timerSelect.value === 'custom') {
        startNewGame();
    }
});

// --- Bot AI ---

function botMove() {
    if (game.result) return;
    botThinking = true;
    let difficulty = botDifficultySel.value;
    let depth = 1;
    if (difficulty === 'easy') depth = 1;
    else if (difficulty === 'hard') depth = 2;
    else if (difficulty === 'very-hard') depth = 3;
    setTimeout(() => {
        let move = getBestMove(game, depth);
        if (move) handleMove(move.from[0], move.from[1], move.to[0], move.to[1], move.opts);
        botThinking = false;
    }, 400 + Math.random()*400);
}

// Basic minimax evaluation for bot
function getBestMove(gameState, depth) {
    let moves = [];
    for (let y=0; y<8; y++) for (let x=0; x<8; x++) {
        let p = gameState.getPiece(x, y);
        if (p && ChessGame.pieceColor(p) === gameState.turn) {
            for (let m of gameState.legalMoves(x, y)) {
                moves.push({from:[x,y], to:[m[0],m[1]], opts:m[2]});
            }
        }
    }
    if (moves.length === 0) return null;
    // For Easy: random
    if (depth === 1) return moves[Math.floor(Math.random()*moves.length)];
    // For Hard/Very Hard: minimax
    let best = null, bestScore = -Infinity;
    for (let move of moves) {
        let test = gameState.clone();
        test.makeMove(move.from[0], move.from[1], move.to[0], move.to[1], move.opts);
        let score = -minimax(test, depth-1, -Infinity, Infinity, false);
        if (score > bestScore) {
            bestScore = score;
            best = move;
        }
    }
    return best;
}
function minimax(gameState, depth, alpha, beta, maximizing) {
    if (depth === 0 || gameState.result) return evaluate(gameState);
    let moves = [];
    for (let y=0; y<8; y++) for (let x=0; x<8; x++) {
        let p = gameState.getPiece(x, y);
        if (p && ChessGame.pieceColor(p) === gameState.turn) {
            for (let m of gameState.legalMoves(x, y)) {
                moves.push({from:[x,y], to:[m[0],m[1]], opts:m[2]});
            }
        }
    }
    if (moves.length === 0) return evaluate(gameState);
    let best = maximizing ? -Infinity : Infinity;
    for (let move of moves) {
        let test = gameState.clone();
        test.makeMove(move.from[0], move.from[1], move.to[0], move.to[1], move.opts);
        let score = -minimax(test, depth-1, -beta, -alpha, !maximizing);
        if (maximizing) {
            best = Math.max(best, score);
            alpha = Math.max(alpha, score);
        } else {
            best = Math.min(best, score);
            beta = Math.min(beta, score);
        }
        if (beta <= alpha) break;
    }
    return best;
}
function evaluate(gameState) {
    // Material + simple position
    const pieceVals = {K:0, Q:9, R:5, B:3, N:3, P:1};
    let score = 0;
    for (let y=0; y<8; y++) for (let x=0; x<8; x++) {
        let p = gameState.getPiece(x, y);
        if (!p) continue;
        let val = pieceVals[p[1]];
        if (p[0]==='w') score += val;
        else score -= val;
    }
    if (gameState.result) {
        if (gameState.result.includes('White')) score = 9999;
        else if (gameState.result.includes('Black')) score = -9999;
        else score = 0;
    }
    return (gameState.turn==='w'?score:-score);
}

// --- Initial Render ---
window.addEventListener('resize', renderBoard);
startNewGame();
                               
