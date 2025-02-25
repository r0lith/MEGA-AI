let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!m.isGroup) throw `✳️ This command can only be used in groups.`;

    m.reply("🚀 Listening for participant removals, WebSocket messages, and hidden API events...");

    // Utility function to get timestamps
    function getTimestamp() {
        return new Date().toISOString();
    }

    // Function to fetch and log all group members
    async function logGroupMembers(groupId, event) {
        try {
            let groupMetadata = await conn.groupMetadata(groupId);
            console.log(`📊 ${getTimestamp()} - ${event} - Group Members of ${groupId}:`, JSON.stringify(groupMetadata.participants, null, 2));
        } catch (err) {
            console.error(`⚠️ ${getTimestamp()} - Error fetching group metadata for ${groupId}:`, err);
        }
    }

    // Detect Announcements Channel JID (Community Main Group)
    try {
        let groups = await conn.groupFetchAllParticipating();
        let groupJIDs = Object.keys(groups);
        let announcementsJID = null;

        for (let groupId of groupJIDs) {
            if (groups[groupId].announce) {  // If it's an Announcements Channel
                announcementsJID = groupId;
                break;
            }
        }

        if (announcementsJID) {
            console.log(`📢 ${getTimestamp()} - Detected Announcements Channel: ${announcementsJID}`);
        } else {
            console.log(`⚠️ ${getTimestamp()} - No Announcements Channel detected.`);
        }
    } catch (err) {
        console.error("⚠️ Error fetching community details:", err);
    }

    // Listen for participant removals
    conn.ev.on('group-participants.update', async (update) => {
        console.log(`🔹 ${getTimestamp()} - Participant Update Detected!`);
        console.log(JSON.stringify(update, null, 2));

        const { id, participants, action, author } = update;

        if (action === "remove") {
            console.log(`❌ ${getTimestamp()} - User(s) removed from ${id}`);
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
        console.log(`📥 ${getTimestamp()} - Incoming WebSocket Message:`);
        console.log(JSON.stringify(messages, null, 2));
    });

    // Capture raw WhatsApp events
    conn.ev.on('raw', (data) => {
        console.log(`🛰️ ${getTimestamp()} - RAW Event Data:`);
        console.log(JSON.stringify(data, null, 2));
    });

    // Capture connection updates
    conn.ev.on('connection.update', (update) => {
        console.log(`🔌 ${getTimestamp()} - Connection Update:`);
        console.log(JSON.stringify(update, null, 2));
    });

    // Capture group metadata updates
    conn.ev.on('groups.update', async (update) => {
        console.log(`📢 ${getTimestamp()} - Group Update Event:`);
        console.log(JSON.stringify(update, null, 2));
    });

    // Capture all message stub events (hidden message actions)
    conn.ev.on("message.update", async (message) => {
        console.log(`📄 ${getTimestamp()} - Message Stub Event Detected:`);
        console.log(JSON.stringify(message, null, 2));
    });

    // Capture admin and settings changes in groups
    conn.ev.on("group.update", async (update) => {
        console.log(`⚙️ ${getTimestamp()} - Group Settings Changed:`);
        console.log(JSON.stringify(update, null, 2));
    });
}

handler.help = ['checkk'];
handler.tags = ['group'];
handler.command = ['checkk'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
