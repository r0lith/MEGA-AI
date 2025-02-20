import fs from 'fs';

let handler = async (m, { conn, isOwner, text }) => {
  if (!isOwner) throw `✳️ This command can only be run by the owner.`;

  if (!text) {
    throw 'Please send a message containing phone numbers, each on a new line.';
  }

  console.log('Message detected, processing...');

  let phoneNumbers = text.split('\n').map(number => number.trim()).filter(number => number);

  if (phoneNumbers.length === 0) {
    throw 'No phone numbers found in the message.';
  }

  console.log('Phone numbers extracted:', phoneNumbers);

  let groups = await conn.groupFetchAllParticipating();
  let results = [];

  for (let phoneNumber of phoneNumbers) {
    let groupCount = 0;
    let groupNames = [];

    for (let groupId in groups) {
      let group = groups[groupId];
      if (group.participants.some(participant => participant.jid.includes(phoneNumber))) {
        groupCount++;
        groupNames.push(group.subject);
      }
    }

    results.push(`The phone number ${phoneNumber} is in ${groupCount} groups:\n${groupNames.join('\n')}`);
  }

  let messageContent = {
    text: results.join('\n\n'),
  };

  await conn.sendMessage(m.chat, messageContent);
};

handler.help = ['checkgroups'];
handler.tags = ['group'];
handler.command = /^(checkgroups)$/i;

export default handler;