let handler = async (m, { conn, usedPrefix, command }) => {
    m.reply("Hitler Mode successfully activated");
}

handler.help = ['hitler'];
handler.tags = ['group'];
handler.command = ['hitler'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;