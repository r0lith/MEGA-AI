let notesDB = {};

async function notesCommand(sock, chatId, message, userMessage) {
    try {
        const sender = message.key.participant || message.key.remoteJid;

        const args = userMessage.trim().split(" ");
        const action = args[1] ? args[1].toLowerCase() : null;
        const content = args.slice(2).join(" ").trim();
        const menuText = `
╭───── *『 NOTES 』* ───◆
┃ Store notes for later use
┃
┃ ● Add Note
┃    .notes add your text here
┃
┃ ● Get All Notes
┃    .notes all
┃
┃ ● Delete Note
┃    .notes del noteID
┃
┃ ● Delete All Notes
┃    .notes delall
╰━━━━━━━━━━━━━━━━━──⊷`;

        if (!action) {
            return await sock.sendMessage(chatId, { text: menuText }, { quoted: message });
        }
        if (action === "add") {
            if (!content) {
                return sock.sendMessage(chatId, { text: "Please write a note to save.\nExample: .notes add buy milk" }, { quoted: message });
            }

            if (!notesDB[sender]) notesDB[sender] = [];

            const newID = notesDB[sender].length + 1;

            notesDB[sender].push({ id: newID, text: content });

            return sock.sendMessage(chatId, {
                text: `Note saved.\nID: ${newID}`
            }, { quoted: message });
        }
        if (action === "all") {
            if (!notesDB[sender] || notesDB[sender].length === 0) {
                return sock.sendMessage(chatId, { text: "You have no notes saved." }, { quoted: message });
            }

            const list = notesDB[sender]
                .map(n => `${n.id}. ${n.text}`)
                .join("\n");

            return sock.sendMessage(chatId, { text: `Your Notes:\n\n${list}` }, { quoted: message });
        }
        if (action === "del") {
            const id = parseInt(args[2]);

            if (!id || !notesDB[sender] || !notesDB[sender].find(n => n.id === id)) {
                return sock.sendMessage(chatId, {
                    text: "Invalid note ID.\nExample: .notes del 1"
                }, { quoted: message });
            }

            notesDB[sender] = notesDB[sender].filter(n => n.id !== id);

            return sock.sendMessage(chatId, { text: `Note ID ${id} deleted.` }, { quoted: message });
        }
        if (action === "delall") {
            if (!notesDB[sender] || notesDB[sender].length === 0) {
                return sock.sendMessage(chatId, { text: "You have no notes to delete." }, { quoted: message });
            }

            notesDB[sender] = [];

            return sock.sendMessage(chatId, { text: "All notes deleted successfully." }, { quoted: message });
        }
        return sock.sendMessage(chatId, { text: menuText }, { quoted: message });

    } catch (err) {
        console.error("Notes error:", err);
        await sock.sendMessage(chatId, { text: "Error in notes module." });
    }
}

module.exports = notesCommand;
