let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!m.mentionedJid[0] && !m.quoted && !text.includes('+')) {
        return m.reply(`✳️ Please use the command correctly\n\n*${usedPrefix + command}* @tag or +<phoneNumber>`);
    }

    let user;
    if (m.mentionedJid[0]) {
        user = m.mentionedJid[0];
    } else if (m.quoted) {
        user = m.quoted.sender;
    } else {
        const parts = text.split(' ');
        user = parts[0].includes('+') ? parts[0].replace('+', '') + '@s.whatsapp.net' : null;
        text = parts.slice(1).join(' ');
    }

    if (!user) {
        return m.reply(`✳️ Please use the command correctly\n\n*${usedPrefix + command}* @tag or +<phoneNumber>`);
    }

    if (conn.user.jid.includes(user)) return m.reply(`✳️ I cannot kick myself`);

    const communityJid = '120363257304349229@g.us';  // Replace with your Announcements Channel JID

    try {
        await conn.groupParticipantsUpdate(communityJid, [user], 'remove');
        m.reply(`✅ User has been kicked from the community`);
    } catch (err) {
        console.error("❌ Error removing user:", err);
        m.reply(`❌ Error removing user: ${err.message}`);
    }
}

handler.help = ['newkick @user or +<phoneNumber>'];
handler.tags = ['group'];
handler.command = ['newkick'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;