const Qasim = require('api-qasim');

const channelInfo = {
    forwardingScore: 1,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363319098372999@newsletter',
        newsletterName: 'MEGA MD',
        serverMessageId: -1
    }
};

const messageTemplates = {
    error: (text) => ({ text, contextInfo: channelInfo }),
    success: (text) => ({ text, contextInfo: channelInfo })
};

async function wattpadCommand(sock, chatId, message, query) {
    if (!query || query.trim() === '') {
        return await sock.sendMessage(chatId, messageTemplates.error(
            `*Please provide a query (e.g., story title, author, or tag).*\nExample: .wattpad The Hunger Games`
        ), { quoted: message });
    }

    try {
        const results = await Qasim.wattpad(query.trim());

        if (!Array.isArray(results) || results.length === 0) {
            throw new Error('No results found for your query.');
        }

        const formattedResults = results.slice(0, 9).map((story, index) => {
            const title = story.judul || 'No title available';
            const reads = story.dibaca || 'No reads available';
            const votes = story.divote || 'No votes available';
            const thumb = story.thumb || '';
            const link = story.link || 'No link available';

            return `${index + 1}. *${title}*\n*Reads*: ${reads}\n*Votes*: ${votes}\nRead more: ${link}${thumb ? `\n${thumb}` : ''}`;
        }).join('\n\n');

        await sock.sendMessage(chatId, messageTemplates.success(`*Search Results For "${query}":*\n\n${formattedResults}`), { quoted: message });

    } catch (error) {
        console.error('Error in wattpadCommand:', error);
        await sock.sendMessage(chatId, messageTemplates.error(`An error occurred: ${error.message || error}`), { quoted: message });
    }
}

module.exports = wattpadCommand;
