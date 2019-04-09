import './chess-element'
import './index.css'
import { html, render } from 'lit-html'
import { wormholeSend, wormholeReceive } from './wormhole'

/*
window.peerChess = {
  readOnlyKey: '4XTTMHah9LTpgQMvdQMWT56BE3pMbvCaeT2d7t2SVoXeT7eVS',
  // Temporary: Don't embed secret key
  keys: 'K3TgTf67cunaTnZnPM6EuK6PxJPxaJNqe6ziWr8FFihtjVmeJJYt9Z9372D877Pq277US74kCvLs3XHAwtXHTdEkpKBqxomgJrJBdt6gJjayUQLANA5acyeniAEVVbeMMDAkzvEx'
}
localStorage.setItem(
  `key:${window.peerChess.readOnlyKey}`,
  window.peerChess.keys
)
*/

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
        wormholeSend(writeKey, updateStatuses)

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
          localStorage.setItem(`key:${readKey}`, secret)
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

    <ul>
      <li><a href="#game=4XTTMHah9LTpgQMvdQMWT56BE3pMbvCaeT2d7t2SVoXeT7eVS">Game 1</a></li>
    </ul>
  `
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