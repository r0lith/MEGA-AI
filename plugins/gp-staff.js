let handler = async (m, { conn, participants, groupMetadata, args }) => {
    const groupAdmins = participants.filter(p => p.admin)
    const listAdmin = groupAdmins.map(v => `@${v.id.split('@')[0]}`).join('\n')

    let text = `
New message has been flagged!

${listAdmin}
`.trim()
    conn.sendMessage(m.chat, { text: text, mentions: [...groupAdmins.map(v => v.id)] })
}

handler.help = ['staff']
handler.tags = ['group']
handler.command = ['staff', 'admins', 'listadmin', 'flag'] 
handler.group = true

export default handler