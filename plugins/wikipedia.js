const axios = require('axios');

async function wikiCommand(sock, chatId, message) {
    try {
        // Extract command text
        const body = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const query = body.replace(/^(\.wiki|\.wikipedia)\s*/i, '').trim();

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: "✳️ Enter what you want to search for on Wikipedia.\nExample: .wiki Pakistan"
            }, { quoted: message });
        }

        const formattedQuery = query.replace(/ /g, "_");

        // Use Wikipedia REST API with proper User-Agent
        const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(formattedQuery)}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MEGA-BOT/1.0',
                'Accept-Language': 'en'
            }
        });

        const data = res.data;

        if (data.extract) {
            await sock.sendMessage(chatId, {
                text: `▢ *Wikipedia*\n\n‣ Search: ${data.title}\n\n${data.extract}\n\nRead more: ${data.content_urls.desktop.page}`
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text: "⚠️ No results found." }, { quoted: message });
        }

    } catch (e) {
        console.error('Wikipedia plugin error:', e.message || e);
        await sock.sendMessage(chatId, { text: "⚠️ No results found or Wikipedia blocked the request." }, { quoted: message });
    }
}

module.exports = wikiCommand;
