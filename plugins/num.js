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

    // Extract country code and number series
    let countryCode = phoneNumber.slice(0, phoneNumber.length - 10);
    let numberSeries = phoneNumber.slice(0, 5);

    for (let groupId in groups) {
      let group = groups[groupId];
      console.log(`Checking group: ${group.subject}`);
      for (let participant of group.participants) {
        console.log('Participant object:', participant);
        if (participant.id && participant.id.startsWith(countryCode) && participant.id.includes(numberSeries)) {
          groupCount++;
          groupNames.push(group.subject);
          break;
        }
      }
    }

    results.push(`The phone number ${phoneNumber} is in ${groupCount} groups:\n${groupNames.join('\n')}`);

    // Add a delay between requests to avoid rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
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