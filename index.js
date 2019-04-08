import './chess-element'
import './index.css'
import { html, render } from 'lit-html'

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

function top () {
  const { hash } = location
  const match = hash.match(/^#game=([1-9a-zA-Z]{47,})$/)
  if (match) {
    const readKey = match[1]
    const writeKey = localStorage.getItem(`key:${readKey}`)
    return html`
      <h1>Game</h1>

      <chess-element game=${readKey} writeKey=${writeKey}></chess-element>

      <div>
        <a href="/">Back to Top</a>
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

window.addEventListener('hashchange', r)