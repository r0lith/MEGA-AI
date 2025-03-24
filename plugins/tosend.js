import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text }) => {
    let [number, ...message] = text.split(' ')
    if (!number || !message.length) throw 'Usage: .tomsg <number> <message>'
    
    number = number.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
    let msg = generateWAMessageFromContent(number, {
        extendedTextMessage: {
            text: message.join(' ')
        }
    }, { quoted: m })
    
    await conn.relayMessage(number, msg.message, { messageId: msg.key.id })
    m.reply(`Message sent to ${number}`)
}

handler.help = ['tomsg']
handler.tags = ['general']
handler.command = ['tomsg']
handler.admin = false
handler.group = false

export default handler
