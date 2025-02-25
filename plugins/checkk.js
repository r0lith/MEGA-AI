let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!m.isGroup) throw `✳️ This command can only be used in groups.`;

    m.reply("🚀 Listening for participant removals and advanced WebSocket logs...");

    // Function to fetch and log all group members
    async function logGroupMembers(groupId, event) {
        try {
            let groupMetadata = await conn.groupMetadata(groupId);
            console.log(`📊 ${event} - Group Members of ${groupId}:`, JSON.stringify(groupMetadata.participants, null, 2));
        } catch (err) {
            console.error(`⚠️ Error fetching group metadata for ${groupId}:`, err);
        }
    }

    // Listen for participant removals
    conn.ev.on('group-participants.update', async (update) => {
        console.log("🔹 Participant Update Detected!");
        console.log(JSON.stringify(update, null, 2));

        const { id, participants, action, author } = update;

        if (action === "remove") {
            console.log(`❌ User(s) removed from ${id}`);
            participants.forEach(user => console.log(`- Removed: ${user}`));
            console.log(`📌 Removed by: ${author || "Unknown"}`);

            // Log members *before* removal
            await logGroupMembers(id, "BEFORE REMOVAL");

            // Delay to ensure WhatsApp updates group state
            setTimeout(async () => {
                // Log members *after* removal
                await logGroupMembers(id, "AFTER REMOVAL");
            }, 5000);
        }
    });

    // Capture all WebSocket messages
    conn.ev.on('messages.upsert', async ({ messages }) => {
        console.log("📥 Incoming WebSocket Message:");
        console.log(JSON.stringify(messages, null, 2));
    });

    // Capture raw WhatsApp events
    conn.ev.on('raw', (data) => {
        console.log("🛰️ RAW Event Data:", JSON.stringify(data, null, 2));
    });

    // Capture connection updates
    conn.ev.on('connection.update', (update) => {
        console.log("🔌 Connection Update:", JSON.stringify(update, null, 2));
    });

    // Capture group metadata updates
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
