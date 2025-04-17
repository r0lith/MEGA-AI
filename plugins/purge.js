let handler = async (m, { conn, args }) => {
    if (!args[0] || isNaN(args[0])) throw `✳️ Please specify the number of messages to delete. Example: purge 10`;
  
    let count = parseInt(args[0]);
    if (count < 1) throw `✳️ The number of messages to delete must be at least 1.`;
  
    try {
      let messages = await conn.fetchMessages(m.chat, { limit: count + 1 }); // Fetch messages, including the command message
      for (let msg of messages.slice(1)) { // Skip the command message itself
        await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: msg.key.fromMe, id: msg.key.id, participant: msg.key.participant } });
      }
    } catch (e) {
      console.error(e);
      throw `❌ Failed to delete messages. Make sure the bot has admin privileges.`;
    }
  };
  
  handler.help = ['purge <number>'];
  handler.tags = ['group'];
  handler.command = /^purge$/i;
  handler.group = true;
  handler.admin = true;
  handler.botAdmin = true;
  
  export default handler;