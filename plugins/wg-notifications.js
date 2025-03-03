async function sendReminder(chatId, sock, message = "1 minute left to vote!") {
    sock.sendMessage(chatId, { text: `⏳ Reminder: ${message}` });
}

async function sendGameAnnouncement(chatId, sock, message) {
    sock.sendMessage(chatId, { text: `📢 Game Announcement: ${message}` });
}

async function sendInactiveAlert(chatId, sock, player) {
    sock.sendMessage(chatId, { text: `⚠️ @${player.split('@')[0]}, you haven’t voted yet!`, mentions: [player] });
}

export { sendReminder, sendGameAnnouncement, sendInactiveAlert };
