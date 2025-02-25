let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!m.isGroup) throw `✳️ This command can only be used in groups.`;

    m.reply("🚀 Listening for participant removals and detailed WebSocket logs...");

    // Listen for participant updates (add/remove)
    conn.ev.on('group-participants.update', async (update) => {
        console.log("🔹 Participant Update Detected!");
        console.log(JSON.stringify(update, null, 2));

        const { id, participants, action, author } = update;

        if (action === "remove") {
            console.log(`❌ User(s) removed from ${id}`);
            participants.forEach(user => console.log(`- Removed: ${user}`));
            console.log(`📌 Removed by: ${author || "Unknown"}`);

            // Fetch and log full group metadata
            try {
                let groupMetadata = await conn.groupMetadata(id);
                console.log("📊 Group Metadata:", JSON.stringify(groupMetadata, null, 2));
            } catch (err) {
                console.error("⚠️ Error fetching group metadata:", err);
            }
        }
    });

    // Capture all WebSocket messages for deeper analysis
    conn.ev.on('messages.upsert', async ({ messages }) => {
        console.log("📥 Incoming WebSocket Message:");
        console.log(JSON.stringify(messages, null, 2));
    });

    // Capture connection updates (to detect hidden processes)
    conn.ev.on('connection.update', (update) => {
        console.log("🔌 Connection Update:", JSON.stringify(update, null, 2));
    });

    // Capture raw events from WhatsApp (debugging)
    conn.ev.on('raw', (data) => {
        console.log("🛰️ RAW Event Data:", JSON.stringify(data, null, 2));
    });

    // Capture all group events
    conn.ev.on('groups.update', async (update) => {
        console.log("📢 Group Update Event:", JSON.stringify(update, null, 2));
    });
}

handler.help = ['checkk'];
handler.tags = ['group'];
handler.command = ['checkk'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
