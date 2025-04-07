let handler = async (m, { conn, usedPrefix, command }) => {
	
if (!m.mentionedJid[0] && !m.quoted) return m.reply(`✳️ ${mssg.useCmd}\n\n*${usedPrefix + command}* @tag`) 
let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender

// Check if the user is the owner
let userNumber = user.split('@')[0];
let userName = conn.getName(user);
  if (userNumber === '919737825303' || userName === 'Rolith') {
    return conn.sendMessage(m.chat, { text: "He's my owner, you idiot." });
  }

if (conn.user.jid.includes(user)) return m.reply(`✳️ No puedo hacer un auto kick`)

await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
m.reply(`✅ ${mssg.kick}`) 

}

handler.help = ['kick @user']
handler.tags = ['group']
handler.command = ['kick', 'expulsar'] 
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
