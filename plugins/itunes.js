const fetch = require('node-fetch');

async function itunesCommand(sock, chatId, message, text) {
    if (!text) {
        return sock.sendMessage(chatId, {
            text: 'Please provide a song name. Example: `.itunes Blinding Lights`',
            quoted: message
        });
    }

    try {
        const url = `https://api.popcat.xyz/itunes?q=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        if (!res.ok) throw `API request failed with status ${res.status}`;

        const json = await res.json();

        const songInfo = `
*Song Information:*
• *Name:* ${json.name || 'N/A'}
• *Artist:* ${json.artist || 'N/A'}
• *Album:* ${json.album || 'N/A'}
• *Release Date:* ${json.release_date || 'N/A'}
• *Price:* ${json.price || 'N/A'}
• *Length:* ${json.length || 'N/A'}
• *Genre:* ${json.genre || 'N/A'}
• *URL:* ${json.url || 'N/A'}
`.trim();

        if (json.thumbnail) {
            await sock.sendMessage(chatId, {
                image: { url: json.thumbnail },
                caption: songInfo,
                quoted: message
            });
        } else {
            await sock.sendMessage(chatId, { text: songInfo, quoted: message });
        }

    } catch (error) {
        console.error('iTunes Command Error:', error);
        await sock.sendMessage(chatId, {
            text: 'An error occurred while fetching the song info. Please try again later.',
            quoted: message
        });
    }
}

module.exports = itunesCommand;
