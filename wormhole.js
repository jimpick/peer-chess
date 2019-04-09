const host = 'wormhole.jimpick.com'
const origin = `https://${host}`
const wsOrigin = `wss://${host}`

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

export async function wormholeReceive (code, update) {
  try {
    update('receiving')
    const res = await fetch(`${origin}/receive/${code}`)
    if (res.status !== 200) {
      try {
        const json = await res.json()
        update(`Error code: ${res.status}, ${json.error}`)
      } catch (e) {
        update(`Error code: ${res.status}`)
      }
      return
    }
    const secret = await res.text()
    return secret.replace('\n', '')
  } catch (e) {
    console.error('Exception', e)
    update(e.message)
  }
}