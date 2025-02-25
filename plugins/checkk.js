let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!m.isGroup) throw `✳️ This command can only be used in groups.`;

    // Listen for participant updates (add/remove)
    conn.ev.on('group-participants.update', async (update) => {
        console.log("🔹 Participant Update Detected!");
        console.log(update);

        const { id, participants, action } = update;

        if (action === "remove") {
            console.log(`❌ User(s) removed from ${id}`);
            participants.forEach(user => console.log(`- Removed: ${user}`));
        }
    });

    m.reply("🚀 Listening for participant removals...");
}

handler.help = ['checkk'];
handler.tags = ['group'];
handler.command = ['checkk'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;