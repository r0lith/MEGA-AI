const Qasim = require('api-qasim');

module.exports = async function trendsCommand(sock, chatId, message, text) {
    try {
        if (!text || text.trim() === '') {
            await sock.sendMessage(chatId, {
                text: '*Please provide a country name.*\nExample: .trends Pakistan or .trends South-Africa'
            }, { quoted: message });
            return;
        }
        const result = await Qasim.trendtwit(text.trim());

        if (!result) {
            throw new Error('No data received');
        }

        let output = `*Trending topics in ${text}:*\n\n`;

        if (typeof result === 'string') {
            output += result;
        } 
        else if (result.result && Array.isArray(result.result) && result.result.length) {
            result.result.forEach((trend, i) => {
                if (trend.hastag && trend.tweet) {
                    output += `${i + 1}. ${trend.hastag} - ${trend.tweet}\n`;
                }
            });
        } 
        else {
            throw new Error('No trending data found');
        }

        await sock.sendMessage(chatId, {
            text: output
        }, { quoted: message });

    } catch (error) {
        console.error('Error in trendsCommand:', error);
        await sock.sendMessage(chatId, {
            text: 'Failed to fetch trending topics. Please try again later.'
        }, { quoted: message });
    }
};
