let handler = async (m, { conn }) => {
    try {
        const groups = await conn.groupFetchAllParticipating();
        let message = "🔹 Bot is in the following groups:\n\n";

        Object.entries(groups).forEach(([jid, data]) => {
            message += `📌 Group Name: ${data.subject} | JID: ${jid}\n`;
        });

        m.reply(message);
    } catch (err) {
        console.error("❌ Error fetching groups:", err);
        m.reply(`❌ Error fetching groups: ${err.message}`);
    }
}

handler.help = ['getgroups'];
handler.tags = ['group'];
handler.command = ['getgroups'];
handler.admin = true;
handler.group = true;

export default handler;