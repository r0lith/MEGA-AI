let handler = async (m, { conn, text, usedPrefix, command }) => {
  let who
  if (m.isGroup) {
    if (m.mentionedJid[0]) {
      who = m.mentionedJid[0]
    } else if (m.quoted) {
      who = m.quoted.sender
    } else if (text) {
      // If text is provided, assume it's a number
      let number = text.replace(/[^0-9]/g, '') // Remove non-numeric characters
      if (!number) throw `✳️ Please provide a valid number or mention someone.\n\n📌 Example: ${usedPrefix + command} @user or ${usedPrefix + command} 1234567890`
      if (!number.includes('@')) number += '@s.whatsapp.net' // Convert to JID
      who = number
    } else {
      throw `✳️ Tag, mention, or provide a number.\n\n📌 Example: ${usedPrefix + command} @user or ${usedPrefix + command} 1234567890`
    }
  } else {
    who = m.chat
  }

  let user = global.db.data.users[who]
  if (!who || !user) throw `✳️ User not found in the database. Make sure the number is correct and includes the country code.`

  let users = global.db.data.users
  users[who].banned = true
  conn.reply(
    m.chat,
    `✅ BANNED\n\n───────────\n@${who.split`@`[0]} you will no longer be able to use my commands.`,
    m,
    { mentions: [who] }
  )
}

handler.help = ['ban @user', 'ban <number>']
handler.tags = ['owner']
handler.command = /^ban$/i
handler.rowner = true

export default handler