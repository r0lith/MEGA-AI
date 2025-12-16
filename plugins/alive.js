const settings = require("../settings");

async function aliveCommand(sock, chatId, message) {
    try {
        const messages = [
            'Riruru Initializing…',
            'Aur bhai kaisa hai?👀',
            'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz',
            'Hum abhi zinda hain! 😎',
            'Nah I Would rather die',
            'Wut?'
        ];

        const reply =
            messages[Math.floor(Math.random() * messages.length)];

        await sock.sendMessage(chatId, {
            text: reply
        }, { quoted: message });

    } catch (error) {
        console.error('Error in alive command:', error);
        await sock.sendMessage(chatId, {
            text: 'Riruru Initializing…'
        }, { quoted: message });
    }
}

module.exports = aliveCommand;
