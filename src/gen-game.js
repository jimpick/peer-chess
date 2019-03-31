const PeerBase = require('peer-base')

;(async function run () {
  const keys = await PeerBase.keys.generate()
  console.log('Keys public', Buffer.from(keys.read._key).toString('hex'))
  console.log('Keys secret', Buffer.from(keys.write._key).toString('hex'))
  console.log('Both keys', PeerBase.keys.uriEncode(keys))
  console.log('Public key', PeerBase.keys.uriEncodeReadOnly(keys))
  console.log('Public encoded', keys.read.bytes.toString('hex'))
  console.log('Secret encoded', keys.write.bytes.toString('hex'))
})()
