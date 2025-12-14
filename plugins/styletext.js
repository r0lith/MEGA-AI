const Qasim = require('api-qasim');

module.exports = async function styleTextCommand(sock, chatId, message, text) {
    try {
        if (!text || text.trim() === '') {
            await sock.sendMessage(chatId, { 
                text: "❌ Please provide a text to style.\nExample: .styletext Hello" 
            }, { quoted: message });
            return;
        }

        const styledResult = await Qasim.styletext(text);

        if (!Array.isArray(styledResult) || styledResult.length === 0) {
            throw new Error('No styled text found.');
        }

        const buttons = styledResult.slice(0, 5).map((item, index) => ({
            buttonId: `.style ${index + 1}`,
            buttonText: { displayText: item.name || `Style ${index + 1}` },
            type: 1
        }));

        let messageText = 'Choose a styled version of the text by replying with the number:\n\n';
        styledResult.forEach((item, index) => {
            const styledText = item.result || item;
            messageText += `*${index + 1}.* ${styledText}\n`;
        });

        const sentMsg = await sock.sendMessage(chatId, {
            text: messageText,
            buttons: buttons,
            headerType: 1
        }, { quoted: message });

        sock.styletext = sock.styletext || {};
        sock.styletext[sentMsg.key.id] = styledResult;

        const listener = async ({ messages }) => {
            const m = messages[0];
            if (!m.message || !m.key || !m.key.remoteJid) return;

            // Only respond to messages in the same chat
            if (m.key.remoteJid !== chatId) return;

            // Only respond to messages that quote the sent bot message
            let isQuoted = false;
            if (m.message.extendedTextMessage &&
                m.message.extendedTextMessage.contextInfo &&
                m.message.extendedTextMessage.contextInfo.quotedMessage) {
                const quotedId = m.message.extendedTextMessage.contextInfo.stanzaId || m.message.extendedTextMessage.contextInfo.quotedMessageKey?.id;
                if (quotedId === sentMsg.key.id) isQuoted = true;
            }

            // Get text from plain message
            let userReply = m.message.conversation || '';
            // Also allow quoted reply
            if (m.message.extendedTextMessage && m.message.extendedTextMessage.text) userReply = m.message.extendedTextMessage.text;

            if (!userReply) return;
            if (!isQuoted && m.message.conversation !== sentMsg.key.id) return;

            const choice = parseInt(userReply.trim());
            if (!isNaN(choice) && choice >= 1 && choice <= styledResult.length) {
                const selectedText = styledResult[choice - 1].result || styledResult[choice - 1];
                await sock.sendMessage(m.key.remoteJid, { text: selectedText }, { quoted: m });
                delete sock.styletext[sentMsg.key.id];
                sock.ev.off('messages.upsert', listener);
            } else {
                await sock.sendMessage(m.key.remoteJid, { 
                    text: `❌ Invalid selection. Please choose a number between 1 and ${styledResult.length}.` 
                }, { quoted: m });
            }
        };

        sock.ev.on('messages.upsert', listener);

    } catch (error) {
        console.error('Error in styleTextCommand:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to style the text. Please try again later.' 
        }, { quoted: message });
    }
};
