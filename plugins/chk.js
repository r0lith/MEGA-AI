let handler = async (m, { conn, usedPrefix, command }) => {
    
    m.reply("🚀 Listening for WebSocket messages related to community removals...");

    conn.ws.on('frame', (frame) => {
        if (frame.tag === "iq" && frame.attrs.type === "set") {  // Log only "set" frames
            console.log("🛰️ WebSocket SET Frame Detected:");
            console.log(JSON.stringify(frame, null, 2));
        }
    });

}

handler.help = ['chk'];
handler.tags = ['group'];
handler.command = ['chk']; 
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
