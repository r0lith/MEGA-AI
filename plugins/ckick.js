let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!m.mentionedJid[0] && !m.quoted && !text.includes('+')) {
        return m.reply(`✳️ Please use the command correctly\n\n*${usedPrefix + command}* @tag or +<phoneNumber> <communityNumber>`);
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
        return m.reply(`✳️ Please use the command correctly\n\n*${usedPrefix + command}* @tag or +<phoneNumber> <communityNumber>`);
    }

    if (conn.user.jid.includes(user)) return m.reply(`✳️ I cannot kick myself`);

    const communityNumber = text.trim();
    if (!communityNumber || (communityNumber !== '1' && communityNumber !== '2')) {
        return m.reply(`❌ Error: Please specify a valid community number (1 For Vadodara or 2 For Ahmedabad)`);
    }

    const communityJid = communityNumber === '1' ? '120363255340111236@g.us' : '120363257304349229@g.us';

    try {
        await conn.groupParticipantsUpdate(communityJid, [user], 'remove');
        m.reply(`✅ User has been kicked`);
    } catch (err) {
        console.error("❌ Error removing user:", err);
        m.reply(`❌ Error removing user: ${err.message}`);
    }
}

handler.help = ['ckick @user or +<phoneNumber> <communityNumber>'];
handler.tags = ['group'];
handler.command = ['ckick', 'expulsarcomunidad'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;