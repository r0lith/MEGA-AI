import puppeteer from 'puppeteer';

// Helper function to introduce a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function to split text into paragraphs
const splitIntoParagraphs = (text, maxLength = 500) => {
  const sentences = text.split('. '); // Split by full stops
  const paragraphs = [];
  let currentParagraph = '';

  for (const sentence of sentences) {
    if ((currentParagraph + sentence).length > maxLength) {
      paragraphs.push(currentParagraph.trim());
      currentParagraph = '';
    }
    currentParagraph += sentence + '. ';
  }

  if (currentParagraph.trim()) {
    paragraphs.push(currentParagraph.trim());
  }

  return paragraphs;
};

const handler = async (m, { conn }) => {
  const groupJid = '120363400184060008@g.us'; // Replace with your group's JID
  conn.sentSubmissions = conn.sentSubmissions || new Set(); // Store already sent submissions

  await conn.reply(m.chat, 'Fetching submissions, please wait...', m);

  try {
    // Launch a headless browser with necessary flags
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Set the request headers to ensure UTF-8 encoding
    await page.setExtraHTTPHeaders({
      'Content-Type': 'application/json; charset=utf-8',
    });

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

    // Iterate through all submissions
    const submissions = json.data;
    for (let i = 0; i < submissions.length; i++) {
      const submission = submissions[i];
      const submissionId = submission.id; // Assuming each submission has a unique ID

      // Skip if this submission has already been sent
      if (conn.sentSubmissions.has(submissionId)) {
        console.log(`Skipping already sent submission ID: ${submissionId}`);
        continue;
      }

      // Mark this submission as sent
      conn.sentSubmissions.add(submissionId);

      // Prepare the message content
      const subject = submission.content[0];
      const body = submission.content[1];
      const paragraphs = splitIntoParagraphs(body);

      // Combine paragraphs into a single message
      const combinedMessage = paragraphs.join('\n\n');

      // Send the message to the specific group
      try {
        await conn.reply(
          groupJid,
          `*Anonymous Message #${i + 1}*\n\n*Subject:* *${subject}*\n\n${combinedMessage}\n-------------------------\nHave something to say but you can't open up? Share yourself at *The Comfort Corner* Anonymously: https://comfortcorner.unaux.com/`,
          null
        );
        await delay(2000); // Add a 2-second delay between messages
      } catch (sendError) {
        console.error('Error sending message:', sendError);
      }
    }

    await conn.reply(m.chat, 'All new submissions have been sent to the group.', m);
  } catch (error) {
    console.error('Error:', error);
    await conn.reply(m.chat, 'An error occurred while fetching submissions.', m);
  }
};

// Command metadata
handler.help = ['autocc'];
handler.tags = ['tools'];
handler.command = /^(autocc)$/i;
handler.admin = false;
handler.group = false;

export default handler;