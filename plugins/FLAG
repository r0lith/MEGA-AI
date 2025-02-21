let handler = async (m, { conn, participants, groupMetadata, args }) => {
    const groupAdmins = participants.filter(p => p.admin)
    const adminTags = groupAdmins.map(v => `@${v.id.split('@')[0]}`).join(' ')
    const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'
    
    let text = `
    New message has been flagged!
    ${adminTags}
    `.trim()
    conn.sendMessage(m.chat, text, { mentions: [...groupAdmins.map(v => v.id), owner] })
}
handler.help = ['flag']
handler.tags = ['group']
handler.command = ['flag', 'f'] 
handler.group = true
export default handler