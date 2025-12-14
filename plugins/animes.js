const axios = require('axios');

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
    success: (imageUrl, command) => ({
        image: { url: imageUrl },
        caption: `_${command}_`,
        contextInfo: channelInfo
    })
};

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function AnimesCommand(sock, chatId, message, command) {
    try {
        const apiUrl = `https://raw.githubusercontent.com/Guru322/api/Guru/BOT-JSON/anime-${command}.json`;

        const res = await axios.get(apiUrl);
        const images = res.data;

        if (!Array.isArray(images) || images.length === 0) {
            throw new Error('No images found');
        }

        const image = pickRandom(images);

        await sock.sendMessage(
            chatId,
            messageTemplates.success(image, command),
            { quoted: message }
        );

    } catch (err) {
        console.error('Error in animeImagesCommand:', err);
        await sock.sendMessage(
            chatId,
            messageTemplates.error('Failed to fetch anime image. Please try again later.'),
            { quoted: message }
        );
    }
}

module.exports = AnimesCommand;
