import { handleCommand } from "./wg-commands.js";

async function messageHandler(sock, m) {
    const chatId = m.key.remoteJid;
    const messageText = m.text?.trim();

    if (!messageText) return;

    // Check if message starts with "w" (our command prefix)
    if (messageText.startsWith("w")) {
        await handleCommand(m, sock);
    }
}

export { messageHandler };
