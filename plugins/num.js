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
  let participantMap = new Map();

  // Preprocess the groups to create a mapping of country codes and number series to participants
  for (let groupId in groups) {
    let group = groups[groupId];
    for (let participant of group.participants) {
      if (participant.id) {
        let countryCode = participant.id.slice(0, participant.id.length - 15); // Extract country code
        let numberSeries = participant.id.slice(0, 5); // Extract number series
        if (!participantMap.has(countryCode)) {
          participantMap.set(countryCode, new Map());
        }
        if (!participantMap.get(countryCode).has(numberSeries)) {
          participantMap.get(countryCode).set(numberSeries, []);
        }
        participantMap.get(countryCode).get(numberSeries).push({ group: group.subject, id: participant.id });
      }
    }
  }

  let results = [];

  for (let phoneNumber of phoneNumbers) {
    let groupCount = 0;
    let groupNames = [];

    // Extract country code and number series from the phone number
    let countryCode = phoneNumber.slice(0, phoneNumber.length - 10);
    let numberSeries = phoneNumber.slice(0, 5);

    if (participantMap.has(countryCode) && participantMap.get(countryCode).has(numberSeries)) {
      let participants = participantMap.get(countryCode).get(numberSeries);
      for (let participant of participants) {
        if (participant.id.includes(phoneNumber)) {
          groupCount++;
          groupNames.push(participant.group);
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