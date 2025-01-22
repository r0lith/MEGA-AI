// Command metadata
// Description: Fetch and parse submissions from a website
// Usage: !submissions
// Author: Your Name
// Date: YYYY-MM-DD
import puppeteer from 'puppeteer';
const handler = async (m, { conn, text }) => {
  conn.mywebsite = conn.mywebsite ? conn.mywebsite : {};
  if (conn.mywebsite[m.sender] && conn.mywebsite[m.sender].awaitingReply) {
    const selectedNumber = parseInt(text, 10);
    const limitedResults = conn.mywebsite[m.sender].results;
    if (selectedNumber >= 1 && selectedNumber <= 5) {
      const selectedItem = limitedResults[selectedNumber - 1];
      const selectedContent = `*Anonymous Message #${selectedNumber}*\n\n*Subject:* *${selectedItem.content[0]}*\n\n${selectedItem.content[1]}\n-------------------------\nHave something to say but you can't open up? Share yourself at *The Comfort Corner* Anonymously: https://comfortcorner.unaux.com/`;
      await conn.reply(m.chat, selectedContent, m);
    } else {
      await conn.reply(m.chat, 'Please reply with a number between 1 and 5.', m);
    }
    // Clear the state after handling the reply
    delete conn.mywebsite[m.sender].awaitingReply;
    return;
  }
  await conn.reply(m.chat, 'Please wait...', m);
  try {
    // Launch a headless browser with necessary flags
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    // Navigate to the URL and wait for the JavaScript challenge to complete
    const url = 'https://comfortcorner.unaux.com/wp-json/cf7-views/v1/get-data';
    await page.goto(url, { waitUntil: 'networkidle2' });
    // Get the page content after the JavaScript challenge
    const pageContent = await page.evaluate(() => document.body.innerText);
    console.log('Fetched Response Text:', pageContent); // Debug: Log the fetched response text
    // Close the browser
    await browser.close();
    // Attempt to parse the response as JSON
    let json;
    try {
      json = JSON.parse(pageContent);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      await conn.reply(m.chat, 'An error occurred while parsing the response.', m);
      return;
    }
    console.log('Fetched JSON:', json); // Debug: Log the fetched JSON
    // Check if the response is successful
    if (!json.success) {
      await conn.reply(m.chat, 'Failed to fetch submissions.', m);
      return;
    }
    // Limit the results to the first 5 entries
    const limitedResults = json.data.slice(0, 5);
    // Prepare the message with the parsed data
    const infoText = "Comfort Corner Submissions:\n\nReply with the number of the desired submission to get more details.\n";
    const orderedLinks = limitedResults
      .map((item, index) => `*${index + 1}.* ${item.content[0]}`) // Listing the first element of the content array
      .join('\n\n');
    const fullText = `${infoText}\n\n${orderedLinks}`;
    console.log('Final Message:', fullText); // Debug: Log the final message
    // Send the message and store data for further interaction
    await conn.reply(m.chat, fullText, m);
    conn.mywebsite[m.sender] = {
      results: limitedResults,
      awaitingReply: true,
    };
  } catch (error) {
    console.error('Error:', error);
    await conn.reply(m.chat, 'An error occurred while fetching submissions.', m);
  }
};
// Command metadata
handler.help = ['submissions'];
handler.tags = ['tools'];
handler.command = /^(submissions)$/i;
handler.admin = false;
handler.group = false;
export default handler;