import PeerChessApp from './peer-chess-app'

class ChessElement extends HTMLElement {
  constructor () {
    super()

    const wrapper = document.createElement('div')
    wrapper.id = 'board'
    wrapper.textContent = 'Chessboard'

    const style = document.createElement('style')
    style.textContent = '#board { width: 400px; height: 400px; }'

    this.appendChild(style)
    this.appendChild(wrapper)
    this.wrapper = wrapper
  }

  connectedCallback () {
    const readKey = this.getAttribute('game')
    const writeKey = this.getAttribute('writeKey')
    new PeerChessApp(this.wrapper, readKey, writeKey)
  }
}

customElements.define('chess-element', ChessElement)