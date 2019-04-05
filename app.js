import PeerBase from 'peer-base'
import { Chess } from 'chess.js'
import 'oakmac-chessboard/src/chessboard.css'

// Old dependencies, not ES import friendly
window.jQuery = require('jquery')
require('oakmac-chessboard')

class PeerChessApp {

  constructor(elemid) {
    this.game = new Chess()
    this.moves = []
    this.board = ChessBoard(elemid, {
      draggable: true,
      position: 'start',
      onDragStart: this.onDragStart.bind(this),
      onDrop: this.onDrop.bind(this),
      onSnapEnd: this.onSnapEnd.bind(this),
      pieceTheme: 'static/{piece}.png',
    })

    this.setupPeerApp()
    this.processedMoves = []
  }

  async setupPeerApp() {
    // var appname = 'peer-chess' + window.location.hash
    var appName = 'peer-chess'
    console.log('loading', appName)
    this.peerApp = PeerBase(appName)
    this.peerApp.on('error', (err) => console.error('error in app:', err))
    await this.peerApp.start()

    const keys = await PeerBase.keys.uriDecode(
      window.peerChess.readOnlyKey + '-' + window.peerChess.keys
    )
    const collabName = 'fixme-derived-from-public-key'
    this.collab = await this.peerApp.collaborate(
      collabName,
      'rga',
      { keys }
    )
    this.collab.shared.value().forEach((move) => {
      this.makeMove(move)
    })

    this.collab.removeAllListeners('state changed')
    this.collab.on('state changed', this.onStateChanged.bind(this))
  }

  // only pick up pieces for White
  onDragStart(source, piece, position, orientation) {
    console.log('onDragStart')

    // do not pick up pieces if the game is over
    if (this.game.in_checkmate() === true ||
      (this.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (this.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false
    }
  }

  onDrop(source, target) {
    console.log('onDrop')

    var move = {
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for simplicity
    }

    var move = this.makeMove(move, true)
    // illegal move
    if (move === null) return 'snapback'
  }

  // update the board position after the piece snap
  // for castling, en passant, pawn promotion
  onSnapEnd() {
    console.log('onSnapEnd')
    this.board.position(this.game.fen())
  }

  onStateChanged() {
    console.log('state changed')
    var a = this.collab.shared.value()
    var b = this.processedMoves

    console.log(a.length, '=?=', b.length)
    console.log(a)
    console.log(b)

    var safety = 10
    while(b.length < a.length) {
      if (safety-- < 0) return // gtfo

      console.log(a.length, '=?=', b.length)
      this.makeMove(a[b.length], false)
    }
  }

  makeMove(move, isLocal) {
    console.log('trying move')
    console.log(move)
    move = this.game.move(move)
    if (move) {
      this.board.position(this.game.fen())
      this.processedMoves.push(move)
      if (isLocal) {
        // announce it
        this.collab.shared.push(move)
      }
    }
    return move
  }
}

jQuery(() => {
  new PeerChessApp('board')
})
