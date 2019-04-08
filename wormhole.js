const host = 'wormhole.jimpick.com'
const origin = `https://${host}`
const wsOrigin = `wss://${host}`
/*
 const host = 'localhost:38881'
 const origin = `http://${host}`
 const wsOrigin = `ws://${host}`
*/

export async function wormholeSend (secret, update) {
  try {
    update({ code: '', status: 'connecting' })
    const res = await fetch(`${origin}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: secret
    })
    if (res.status !== 201) {
      update({ code: '', status: `Error code: ${res.status}` })
      return
    }
    const { id, code } = await res.json()
    update({ code, status: '' })
    const socket = new WebSocket(`${wsOrigin}/status/${id}`)
    socket.onopen = () => {
      socket.onmessage = async event => {
        const blob = event.data
        const status = await (new Response(blob)).text()
        console.log('ws data:', status)
        update({ code, status })
      }
    }
  } catch (e) {
    console.error('Exception', e)
    update({ code: '', status: e.message })
  }
}