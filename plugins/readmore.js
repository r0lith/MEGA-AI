const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

async function readMoreCommand(sock, chatId, message, text) {
    if (!text) {
        return await sock.sendMessage(
            chatId,
            { text: 'Usage:\n.readmore text\n.readmore text1|text2' },
            { quoted: message }
        );
    }

    let output;

    if (text.includes('|')) {
        const parts = text.split('|');

        const firstPart = parts.shift();
        const rest = parts.join('|');

        output = firstPart + readMore + rest;
    } else {
        output = text + readMore;
    }

    await sock.sendMessage(chatId, { text: output }, { quoted: message });
}

module.exports = readMoreCommand;
