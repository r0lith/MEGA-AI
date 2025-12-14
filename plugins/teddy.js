let teddyUsers = {}; // Tracks users who received teddy animation

async function teddyCommand(sock, chatId, message) {
    try {
        const sender = message.key.participant || message.key.remoteJid;

        // Extract user message text
        const userMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        if (!userMessage.toLowerCase().startsWith('.teddy')) return;

        if (teddyUsers[sender]) return; // Already processing for this user
        teddyUsers[sender] = true;

        // Array of cute symbols
        const teddyEmojis = [
            '❤','💕','😻','🧡','💛','💚','💙','💜','🖤','❣',
            '💞','💓','💗','💖','💘','💝','💟','♥','💌','🙂',
            '🤗','😌','😉','🤗','😊','🎊','🎉','🎁','🎈'
        ];

        // Send initial message
        const pingMsg = await sock.sendMessage(chatId, { text: `(\\_/)\n( •.•)\n/>🤍` }, { quoted: message });

        // Animate teddy by updating message with emojis
        for (let i = 0; i < teddyEmojis.length; i++) {
            await sleep(500); // 500ms delay

            await sock.relayMessage(
                chatId,
                {
                    protocolMessage: {
                        key: pingMsg.key,
                        type: 14, // Edit type
                        editedMessage: {
                            conversation: `(\\_/)\n( •.•)\n/>${teddyEmojis[i]}`
                        }
                    }
                },
                {}
            );
        }

        // Reset user state
        delete teddyUsers[sender];

    } catch (err) {
        console.error("Error in teddy plugin:", err);
        try {
            await sock.sendMessage(chatId, { text: "❌ Something went wrong while sending teddy emojis." }, { quoted: message });
        } catch {}
        delete teddyUsers[sender];
    }
}

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

module.exports = teddyCommand;
