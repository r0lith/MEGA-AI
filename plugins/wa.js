async function waCommand(sock, chatId, message, userMessage) {
    try {
        let waNumber = '';

        const args = userMessage
            .replace(/^\.wa\s*/i, '')
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (args.length > 0) {
            waNumber = args.join('').replace(/[^0-9]/g, '');
        } else {
            const ctx = message.message?.extendedTextMessage?.contextInfo;

            if (ctx?.participant) {
                waNumber = ctx.participant.replace(/[^0-9]/g, '');
            } else if (ctx?.mentionedJid?.[0]) {
                waNumber = ctx.mentionedJid[0].replace(/[^0-9]/g, '');
            } else {
                return sock.sendMessage(
                    chatId,
                    { text: 'Please provide a number, reply to a user, or mention a user.' },
                    { quoted: message }
                );
            }
        }

        if (!waNumber) {
            return sock.sendMessage(
                chatId,
                { text: 'Invalid WhatsApp number.' },
                { quoted: message }
            );
        }

        const waLink = `https://wa.me/${waNumber}`;

        await sock.sendMessage(
            chatId,
            { text: `*WhatsApp Link:*\n${waLink}` },
            { quoted: message }
        );

    } catch (err) {
        console.error('WA COMMAND ERROR:', err);
        await sock.sendMessage(
            chatId,
            { text: 'Failed to generate WhatsApp link.' },
            { quoted: message }
        );
    }
}

module.exports = waCommand;
