import fetch from 'node-fetch';
import https from 'https';

// Create an HTTPS agent to bypass SSL verification
const agent = new https.Agent({ rejectUnauthorized: false });

const handler = async (m, { conn }) => {
  conn.mywebsite = conn.mywebsite ? conn.mywebsite : {};
  await conn.reply(m.chat, 'Please wait...', m);

  try {
    // Fetch the HTML content of the submissions page
    const url = 'https://comfortcorner.unaux.com/submissions/';
    const response = await fetch(url, { agent });
    if (!response.ok) throw new Error('Failed to fetch the website content');
    const html = await response.text();

    console.log(html); // Debug: Log the fetched HTML

    // Parse the HTML to extract data
    const results = [];
    const regex = /<tr>([\s\S]*?)<\/tr>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      const trHtml = match[1];
      const subjectMatch = /<td class="field-your-subject">([\s\S]*?)<\/td>/i.exec(trHtml);
      const messageMatch = /<td class="field-your-message">([\s\S]*?)<\/td>/i.exec(trHtml);

      console.log('trHtml:', trHtml); // Debug: Log each <tr>
      console.log('subjectMatch:', subjectMatch); // Debug: Log matched subject
      console.log('messageMatch:', messageMatch); // Debug: Log matched message

      if (subjectMatch && messageMatch) {
        results.push({
          subject: subjectMatch[1].trim(),
          message: messageMatch[1].trim(),
        });
      }
    }

    console.log('Parsed Results:', results); // Debug: Log parsed results

    // Check if no results were parsed
    if (results.length === 0) {
      await conn.reply(m.chat, 'No submissions found.', m);
      return;
    }

    // Limit the results to the first 5 entries
    const limitedResults = results.slice(0, 5);

    // Prepare the message with the parsed data
    const infoText = `✦ ──『 *WEBSITE SUBMISSIONS* 』── ✦\n\n[ ⭐ Reply with the number of the desired submission to get more details]. \n\n`;
    const orderedLinks = limitedResults
      .map((item, index) => `*${index + 1}.* ${item.subject}`)
      .join('\n\n');
    const fullText = `${infoText}\n\n${orderedLinks}`;

    console.log('Final Message:', fullText); // Debug: Log the final message

    // Send the message and store data for further interaction
    const { key } = await conn.reply(m.chat, fullText, m);
    conn.mywebsite[m.sender] = {
      results: limitedResults,
      key,
      timeout: setTimeout(() => {
        conn.sendMessage(m.chat, { delete: key });
        delete conn.mywebsite[m.sender];
      }, 150 * 1000),
    };
  } catch (error) {
    await conn.reply(m.chat, `Error: ${error.message}`, m);
  }
};

// This function handles the user's reply to the bot message
handler.before = async (m, { conn }) => {
  conn.mywebsite = conn.mywebsite ? conn.mywebsite : {};
  if (m.isBaileys || !(m.sender in conn.mywebsite)) return;

  const { results, key, timeout } = conn.mywebsite[m.sender];
  if (!m.quoted || m.quoted.id !== key.id || !m.text) return;

  const choice = m.text.trim();
  const inputNumber = Number(choice);
  if (inputNumber >= 1 && inputNumber <= results.length) {
    const selectedItem = results[inputNumber - 1];
    console.log('Selected Item:', selectedItem); // Debug: Log the selected item

    // Send the details of the selected item
    const detailsText = `*Subject:* ${selectedItem.subject}\n*Message:* ${selectedItem.message}`;
    await conn.reply(m.chat, detailsText, m);
  } else {
    m.reply(
      `Invalid sequence number. Please select a number from the list above (1 to ${results.length}).`
    );
  }
};

// Command metadata
handler.help = ['submissions'];
handler.tags = ['tools'];
handler.command = /^(submissions)$/i;
handler.admin = false;
handler.group = false;

export default handler;
