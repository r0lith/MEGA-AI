let handler = async (m, { conn, args }) => {
    if (!args[0] || isNaN(args[0])) throw `✳️ Please specify the number of messages to delete. Example: purge 10`;

    let count = parseInt(args[0]);
    if (count < 1) throw `✳️ The number of messages to delete must be at least 1.`;

    try {
        // Use loadMessages instead of fetchMessages
        let messages = await conn.loadMessages(m.chat, count + 1); // Fetch messages, including the command message
        for (let msg of messages.messages.slice(1)) { // Skip the command message itself
            let deleteOptions = {
                remoteJid: m.chat,
                fromMe: msg.key.fromMe,
                id: msg.key.id,
            };
            if (msg.key.participant) {
                deleteOptions.participant = msg.key.participant; // Add participant only if it exists
            }
            await conn.sendMessage(m.chat, { delete: deleteOptions });
        }
    } catch (e) {
        console.error('Error while deleting messages:', e);
        throw `❌ Failed to delete messages. Make sure the bot has admin privileges and the messages are deletable.`;
    }
};

handler.help = ['purge <number>'];
handler.tags = ['group'];
handler.command = /^purge$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;