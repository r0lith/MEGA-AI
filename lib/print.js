const { WAMessageStubType } = require("@whiskeysockets/baileys");
const PhoneNumber = require("awesome-phonenumber");
const chalk = require("chalk");
const { watchFile } = require("fs");
const urlRegexSafe = require("url-regex-safe");

const urlRegex = urlRegexSafe({ strict: false });
const MAX_MESSAGE_LENGTH = 400;

/* ───── caches ───── */
const nameCache = new Map();
const phoneCache = new Map();
const lidToJidCache = global.lidToJidCache || (global.lidToJidCache = new Map());
const lidToNameCache = global.lidToNameCache || (global.lidToNameCache = new Map());

/* ───── helpers ───── */
function formatPhoneNumber(jid) {
  try {
    if (!jid) return "Unknown";
    if (phoneCache.has(jid)) return phoneCache.get(jid);

    let num = jid.split("@")[0];
    let formatted = PhoneNumber("+" + num).getNumber("international") || num;
    phoneCache.set(jid, formatted);
    return formatted;
  } catch {
    return jid.split("@")[0];
  }
}

async function getCachedName(conn, jid) {
  if (!jid) return "Unknown";
  if (nameCache.has(jid)) return nameCache.get(jid);

  try {
    const name = await conn.getName(jid);
    const finalName = name && name.trim() ? name : "Unknown";
    nameCache.set(jid, finalName);
    return finalName;
  } catch {
    return "Unknown";
  }
}

/* ───── MAIN LOGGER ───── */
async function printMessage(m, conn = { user: {} }) {
  try {
    const chatJid = m.chat || m.key?.remoteJid || "";
    const senderJid = m.sender || m.key?.participant || "";
    const time = new Date(
      (m.messageTimestamp?.low || m.messageTimestamp || Date.now() / 1000) * 1000
    )
      .toTimeString()
      .split(" ")[0];

    /* 🔥 WHATSAPP CHANNEL (NEWSLETTER) DETECTION */
    if (chatJid.endsWith("@newsletter")) {
      console.log(
        chalk.bgBlue.black(" CHANNEL MESSAGE "),
        "\n" + chalk.greenBright("Channel ID: "),
        chalk.cyanBright(chatJid)
      );
    }

    const chatName = await getCachedName(conn, chatJid);
    const senderName = await getCachedName(conn, senderJid);
    const senderPhone = formatPhoneNumber(senderJid);
    const mePhone = formatPhoneNumber(conn.user?.jid);

    const stubType = m.messageStubType
      ? WAMessageStubType[m.messageStubType]
      : "Message";

    const msgType = m.mtype || "text";

    console.log(chalk.cyanBright("╭───────────────"));
    console.log(
      chalk.cyanBright("│"),
      chalk.green("Bot:"),
      mePhone,
      "~",
      conn.user?.name
    );
    console.log(
      chalk.cyanBright("│"),
      chalk.yellow("Time:"),
      time
    );
    console.log(
      chalk.cyanBright("│"),
      chalk.green("From:"),
      senderPhone,
      "~",
      senderName
    );
    console.log(
      chalk.cyanBright("│"),
      chalk.yellow("Chat:"),
      chatName,
      `(${chatJid})`
    );
    console.log(
      chalk.cyanBright("│"),
      chalk.magenta("Type:"),
      stubType,
      "|",
      msgType
    );
    console.log(chalk.cyanBright("╰───────────────"));

    if (typeof m.text === "string" && m.text) {
      let text = m.text.replace(/\u200e+/g, "");
      text = text.replace(urlRegex, (url) => chalk.blueBright(url));

      if (text.length > MAX_MESSAGE_LENGTH) {
        text = text.slice(0, MAX_MESSAGE_LENGTH) + "\n...truncated";
      }

      console.log(m.isCommand ? chalk.yellow(text) : text);
    }
  } catch (err) {
    console.error(chalk.red("Logger error:"), err.message);
  }
}

/* ───── HOT RELOAD NOTICE ───── */
watchFile(__filename, () => {
  console.log(chalk.redBright("print.js updated"));
});

module.exports = printMessage;
