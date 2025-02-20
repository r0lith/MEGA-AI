import fs from 'fs';
import csv from 'csv-parser';

let handler = async (m, { conn, isOwner, quoted }) => {
  if (!isOwner) throw `✳️ This command can only be run by the owner.`;

  if (!quoted || !quoted.mimetype || !quoted.mimetype.includes('text/csv')) {
    throw 'Please reply to a CSV file containing phone numbers.';
  }

  console.log('CSV file detected, processing...');

  let buffer = await quoted.download();
  let phoneNumbers = [];

  // Parse the CSV file
  await new Promise((resolve, reject) => {
    let stream = fs.createReadStream(buffer);
    stream.pipe(csv())
      .on('data', (row) => {
        console.log('Row data:', row);
        if (row.phoneNumber) {
          phoneNumbers.push(row.phoneNumber.trim());
        } else {
          console.log('No phoneNumber field found in row:', row);
        }
      })
      .on('end', () => {
        console.log('CSV parsing completed. Phone numbers:', phoneNumbers);
        resolve();
      })
      .on('error', (error) => {
        console.error('Error parsing CSV:', error);
        reject(error);
      });
  });

  if (phoneNumbers.length === 0) {
    throw 'No phone numbers found in the CSV file.';
  }

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