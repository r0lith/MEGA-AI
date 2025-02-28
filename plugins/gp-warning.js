let war = global.maxwarn
let handler = async (m, { conn, text, args, groupMetadata, usedPrefix, command }) => {      
        let who
        if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
        else who = m.chat
        if (!who) throw `✳️ ${mssg.noMention}\n\n📌 ${mssg.example}: ${usedPrefix + command} @user`
        if (conn.user.jid.includes(who)) return m.reply(`✳️ Please mention a user other than the Bot`)
        if (!(who in global.db.data.users)) throw `✳️ ${mssg.userDb}`
        let txt = text.replace('@' + who.split`@`[0], '').trim()
        let name = conn.getName(m.sender)
        let warn = global.db.data.users[who].warn
        if (warn < war - 1) { // Adjusted condition to remove on 3rd warning
            global.db.data.users[who].warn += 1
            m.reply(`
⚠️ *Warning Issued* ⚠️  

📌 *Admin:* ${name}  
👤 *User:* @${who.split`@`[0]}  
⚠️ *Warnings:* ${warn + 1}/${war}  
📝 *Reason:* ${txt}`, null, { mentions: [who] }) 
        } else if (warn == war - 1) { // Adjusted condition to remove on 3rd warning
            global.db.data.users[who].warn = 0
            m.reply(`⛔ You have reached the maximum number of warnings (${war}).`)
            await time(3000)
            await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
            m.reply(`♻️ You have been removed from the group *${groupMetadata.subject}* for receiving *${war}* warnings.`, who)
            m.reply(`
⚠️ *WARNING* ⚠️
You have been removed from the group.

▢ *Warnings:* ${war}/${war} 
${mssg.wningUser(war)}`, who)
        }
}
handler.help = ['warn @user']
handler.tags = ['group']
handler.command = ['warn'] 
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler

const time = async (ms) => {
            return new Promise(resolve => setTimeout(resolve, ms));
        }