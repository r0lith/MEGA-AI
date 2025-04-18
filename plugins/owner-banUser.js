let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    console.log(`Command ${command} triggered by ${m.sender}`);
    
    if (!global.db || !global.db.data || !global.db.data.users) {
      console.error('global.db is not initialized or missing required properties.');
      return conn.reply(m.chat, '❌ Database is not initialized. Please check the bot setup.', m);
    }

    let who;
    if (m.isGroup) {
      if (m.mentionedJid[0]) {
        who = m.mentionedJid[0];
      } else if (m.quoted) {
        who = m.quoted.sender;
      } else if (text) {
        let number = text.replace(/[^0-9]/g, ''); // Remove non-numeric characters
        if (!number) throw `✳️ Please provide a valid number or mention someone.\n\n📌 Example: ${usedPrefix + command} @user or ${usedPrefix + command} 1234567890`;
        if (!number.includes('@')) number += '@s.whatsapp.net'; // Convert to JID
        who = number;
      } else {
        throw `✳️ Tag, mention, or provide a number.\n\n📌 Example: ${usedPrefix + command} @user or ${usedPrefix + command} 1234567890`;
      }
    } else {
      who = m.chat;
    }
    
    console.log('Target JID:', who);
    
    // Check if the user exists in the database, and add them if missing
    if (!global.db.data.users[who]) {
      console.log(`User ${who} not found in the database. Adding them now.`);
      global.db.data.users[who] = { banned: false }; // Initialize user with default properties
    }
    
    let user = global.db.data.users[who];
    let users = global.db.data.users;
    users[who].banned = true;
    console.log(`User ${who} has been banned.`);
    
    conn.reply(
      m.chat,
      `✅ BANNED\n\n───────────\n@${who.split`@`[0]} you will no longer be able to use my commands.`,
      m,
      { mentions: [who] }
    );
  } catch (err) {
    console.error('Error in banUser handler:', err);
    conn.reply(m.chat, '❌ An error occurred. Please try again.', m);
  }
};

handler.help = ['ban @user', 'ban <number>'];
handler.tags = ['owner'];
handler.command = /^ban$/i;
handler.rowner = true;

export default handler;