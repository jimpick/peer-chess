import './chess-element'
import './index.css'
import { html, render } from 'lit-html'
import PeerBase from 'peer-base'
import { wormholeSend, wormholeReceive } from './wormhole'

let sendStatuses = {}
let receiveStatus

function top () {
  const { hash } = location
  const match = hash.match(/^#game=([1-9a-zA-Z]{47,})$/)
  if (match) {
    const readKey = match[1]
    const writeKey = localStorage.getItem(`key:${readKey}`)
    let board
    if (writeKey) {
      board = html`
        <div class="mode">
        Playable mode
        </div>
        <div class="invite">
          <button @click=${sendInvite}>Invite another player</button>
          <span>
            <div>${sendStatuses.code}</div>
            <div>${sendStatuses.status}</div>
          </span>
        </div>
        <chess-element game=${readKey} writeKey=${writeKey}>
        </chess-element>
      `

      function sendInvite () {
        wormholeSend(readKey + '-' + writeKey, updateStatuses)

        function updateStatuses (newStatuses) {
          Object.assign(sendStatuses, newStatuses)
          r()
        }
      }
    } else {
      board = html`
        <div class="mode">
          Spectator mode
        </div>
        <div class="invite">
          Have an invite?
          <input type="text" id="code"></input>
          <button @click=${acceptInvite}>Accept Invite</button>
        </div>
        <div>
          ${receiveStatus}
        </div>
        <chess-element game=${readKey} writeKey=${writeKey}>
        </chess-element>
      `

      async function acceptInvite () {
        const code = document.getElementById('code').value
        const secret = await wormholeReceive(code, updateStatus)
        if (secret) {
          const keys = secret.split('-')
          if (keys[0] !== readKey) {
            receiveStatus = 'Received key is for different game'
            r()
            return
          }
          localStorage.setItem(`key:${readKey}`, keys[1])
          r()
        }

        function updateStatus (newStatus) {
          receiveStatus = newStatus
          r()
        }
      }
    }
    return html`
      ${board}
      <div class="nav">
        <a href="#">Back to Top</a>
      </div>
    `
  }
  return html`
    <h1>PeerChess</h1>

    <div>
      <button @click=${startNewGame}>Start New Game</button>
    </div>

    <div class="invite">
      Have an invite?
      <input type="text" id="code"></input>
      <button @click=${acceptInviteTop}>Accept Invite</button>
    </div>
    <div>
      ${receiveStatus}
    </div>

    <ul>
      <li><a href="#game=4XTTMHah9LTpgQMvdQMWT56BE3pMbvCaeT2d7t2SVoXeT7eVS">Game 1</a></li>
    </ul>
  `

  async function startNewGame () {
    const keys = await PeerBase.keys.generate()
    const readKey = PeerBase.keys.uriEncodeReadOnly(keys)
    const writeKey = PeerBase.keys.uriEncode(keys).replace(/^.*-/, '')
    localStorage.setItem(`key:${readKey}`, writeKey)
    location.hash = `game=${readKey}`
  }

  async function acceptInviteTop () {
    const code = document.getElementById('code').value
    const secret = await wormholeReceive(code, updateStatus)
    if (secret) {
      const [readKey, writeKey] = secret.split('-')
      localStorage.setItem(`key:${readKey}`, writeKey)
      location.hash = `game=${readKey}`
    }

    function updateStatus (newStatus) {
      receiveStatus = newStatus
      r()
    }
  }
}

function r () {
  render(top(), document.body)
}

r()

window.addEventListener('hashchange', () => {
  sendStatuses = {}
  receiveStatus = null
  r()
})