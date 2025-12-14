const fs = require('fs');
const path = require('path');

const commandEmojis = ['⏳'];
const autoEmojis = [
  '💘','💝','💖','💗','💓','💞','💕','💟','❣️','❤️',
  '🧡','💛','💚','💙','💜','🤎','🖤','🤍','♥️',
  '🎈','🎁','💌','💐','😘','🤗',
  '🌸','🌹','🥀','🌺','🌼','🌷',
  '🍁','⭐️','🌟','😊','🥰','😍',
  '🤩','☺️'
];

const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

let AUTO_REACT_MESSAGES = false;
let lastReactedTime = 0;

function loadCommandReactState() {
    try {
        if (fs.existsSync(USER_GROUP_DATA)) {
            const data = JSON.parse(fs.readFileSync(USER_GROUP_DATA));
            return data.autoReaction || false;
        }
    } catch {}
    return false;
}

function saveCommandReactState(state) {
    const data = fs.existsSync(USER_GROUP_DATA)
        ? JSON.parse(fs.readFileSync(USER_GROUP_DATA))
        : {};
    data.autoReaction = state;
    fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
}

let COMMAND_REACT_ENABLED = loadCommandReactState();

function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/* COMMAND REACTION */
async function addCommandReaction(sock, message) {
    if (!COMMAND_REACT_ENABLED) return;
    if (!message?.key?.id) return;

    await sock.sendMessage(message.key.remoteJid, {
        react: { text: commandEmojis[0], key: message.key }
    });
}

async function handleAreactCommand(sock, chatId, message, isOwner) {
    if (!isOwner) return;

    const arg = message.message?.conversation?.split(' ')[1];

    if (arg === 'on') {
        COMMAND_REACT_ENABLED = true;
        saveCommandReactState(true);
        await sock.sendMessage(chatId, { text: '*✅ Command reactions enabled*' }, { quoted: message });
    } else if (arg === 'off') {
        COMMAND_REACT_ENABLED = false;
        saveCommandReactState(false);
        await sock.sendMessage(chatId, { text: '*❌ Command reactions disabled*' }, { quoted: message });
    }
}

/* AUTO REACT COMMAND */
async function autoReactCommand(sock, chatId, message, arg) {
    if (!['on', 'off'].includes(arg)) {
        await sock.sendMessage(chatId, {
            text: '*Usage:*\n.autoreact on/off'
        }, { quoted: message });
        return;
    }

    AUTO_REACT_MESSAGES = arg === 'on';

    await sock.sendMessage(chatId, {
        text: AUTO_REACT_MESSAGES ? '*✅ Auto-react enabled*' : '*❌ Auto-react disabled*'
    }, { quoted: message });

    if (sock.__autoReactAttached) return;

    sock.ev.on('messages.upsert', async ({ messages }) => {
        if (!AUTO_REACT_MESSAGES) return;

        for (const m of messages) {
            if (!m?.message) continue;
            if (m.key.fromMe) continue;

            const text =
                m.message.conversation ||
                m.message.extendedTextMessage?.text ||
                '';

            if (!text) continue;
            if (/^[!#.$%^&*+=?<>]/.test(text)) continue;

            const now = Date.now();
            if (now - lastReactedTime < 2000) continue;

            await sock.sendMessage(m.key.remoteJid, {
                react: {
                    text: random(autoEmojis),
                    key: m.key
                }
            });

            lastReactedTime = now;
        }
    });

    sock.__autoReactAttached = true;
}

module.exports = {
    addCommandReaction,
    handleAreactCommand,
    autoReactCommand
};

