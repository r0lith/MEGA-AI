import fetch from 'node-fetch'

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text && !(m.quoted && m.quoted.text)) {
    throw `Please provide some text or quote a message to get a response.`
  }

  if (!text && m.quoted && m.quoted.text) {
    text = m.quoted.text
  }

  try {
    m.react(rwait)
    
    conn.sendPresenceUpdate('composing', m.chat)
    const prompt = encodeURIComponent(text)

    const guru1 = `https://api.gurusensei.workers.dev/llama?prompt=${prompt}`

    try {
      let response = await fetch(guru1)
      let data = await response.json()
      let result = data.response.response
      let mediaUrl = data.response.mediaUrl // Assuming the API provides a media URL

      if (!result) {
        throw new Error('No valid JSON response from the first API')
      }

      // Send text response
      await conn.sendMessage(m.chat, { text: result }, { quoted: m })

      // Send media if available
      if (mediaUrl) {
        await conn.sendMessage(m.chat, { image: { url: mediaUrl } }, { quoted: m }) // Change 'image' to 'video' or 'audio' if needed
      }

      m.react(done)
    } catch (error) {
      console.error('Error from the first API:', error)

      const guru2 = `https://ultimetron.guruapi.tech/gpt3?prompt=${prompt}`

      let response = await fetch(guru2)
      let data = await response.json()
      let result = data.completion
      let mediaUrl = data.mediaUrl // Assuming the second API also provides a media URL

      // Send text response
      await conn.sendMessage(m.chat, { text: result }, { quoted: m })

      // Send media if available
      if (mediaUrl) {
        await conn.sendMessage(m.chat, { image: { url: mediaUrl } }, { quoted: m }) // Change 'image' to 'video' or 'audio' if needed
      }

      m.react(done)
    }
  } catch (error) {
    console.error('Error:', error)
    throw `*ERROR*`
  }
}

handler.help = ['chatgpt']
handler.tags = ['AI']
handler.command = ['bro', 'chatgpt', 'ai', 'gpt']

export default handler