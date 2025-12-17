// --- Imports ---
const isAdmin = require('../lib/isAdmin');

// --- In-memory mute store ---
let mutedUsers = {};
if (!global.groupMetaCache) global.groupMetaCache = {};

// --- Command Handler ---
let handler = async (m, { conn, args, command }) => {
  try {
    // ❗ Group only
    if (!m.isGroup) {
      return conn.sendMessage(
        m.chat,
        { text: '❌ This command works only in groups.' },
        { quoted: m }
      );
    }

    // ✅ Admin checks (sender + bot)
    const adminCheck = await isAdmin(conn, m);

    let senderIsAdmin = false;
    let botIsAdmin = false;

    if (typeof adminCheck === 'boolean') {
      senderIsAdmin = adminCheck;
      botIsAdmin = adminCheck;
    } else if (typeof adminCheck === 'object') {
      senderIsAdmin = adminCheck.senderAdmin;
      botIsAdmin = adminCheck.botAdmin;
    }

    if (!senderIsAdmin) {
      return conn.sendMessage(
        m.chat,
        { text: '❌ Only group admins can use this command.' },
        { quoted: m }
      );
    }

    if (!botIsAdmin) {
      return conn.sendMessage(
        m.chat,
        { text: '❌ I need admin rights to mute users (delete messages).' },
        { quoted: m }
      );
    }

    // ❗ Must reply to a message
    if (!m.quoted) {
      return conn.sendMessage(
        m.chat,
        { text: '✳️ Reply to a user’s message to mute/unmute them.' },
        { quoted: m }
      );
    }

    // --- Resolve target user ---
    const userToMute =
      m.quoted?.sender ||
      m.quoted?.key?.participant ||
      m.message?.extendedTextMessage?.contextInfo?.participant;

    if (!userToMute) {
      return conn.sendMessage(
        m.chat,
        { text: '❌ Could not identify the user.' },
        { quoted: m }
      );
    }

    // ❗ Protect owner (edit number if needed)
    if (userToMute.startsWith('919737825303')) {
      return conn.sendMessage(
        m.chat,
        { text: '🚫 You cannot mute the owner.' },
        { quoted: m }
      );
    }

    // --- MUTE ---
    if (command === 'mute') {
      const duration = args[0];
      if (!duration) {
        return conn.sendMessage(
          m.chat,
          { text: '✳️ Usage: !mute 10s / 5m / 1h' },
          { quoted: m }
        );
      }

      const time = parseDuration(duration);
      if (!time) {
        return conn.sendMessage(
          m.chat,
          { text: '❌ Invalid duration format (use s/m/h).' },
          { quoted: m }
        );
      }

      mutedUsers[userToMute] = Date.now() + time;

      await conn.sendMessage(
        m.chat,
        { text: `🔇 User muted for ${duration}.` },
        { quoted: m }
      );

      setTimeout(() => {
        delete mutedUsers[userToMute];
        conn.sendMessage(m.chat, { text: '🔊 User unmuted.' });
      }, time);
    }

    // --- UNMUTE ---
    else if (command === 'unmute') {
      if (mutedUsers[userToMute]) {
        delete mutedUsers[userToMute];
        await conn.sendMessage(
          m.chat,
          { text: '🔊 User unmuted.' },
          { quoted: m }
        );
      } else {
        await conn.sendMessage(
          m.chat,
          { text: 'ℹ️ User is not muted.' },
          { quoted: m }
        );
      }
    }
  } catch (err) {
    console.error('[Mute Error]', err);
    await conn.sendMessage(
      m.chat,
      { text: `❌ Error: ${err.message || err}` },
      { quoted: m }
    );
  }
};

// --- Message Interceptor (auto delete muted users) ---
handler.before = async (m, { conn }) => {
  const userJid = m.sender;
  const userLid = m.participant;

  const muted =
    (mutedUsers[userJid] && Date.now() < mutedUsers[userJid]) ||
    (userLid && mutedUsers[userLid] && Date.now() < mutedUsers[userLid]);

  if (muted) {
    try {
      await conn.sendMessage(m.chat, { delete: m.key });
      return true;
    } catch (e) {
      console.error('[Mute] Delete failed:', e.message);
      delete mutedUsers[userJid];
      delete mutedUsers[userLid];
    }
  }
  return false;
};

// --- Command Metadata ---
handler.help = ['mute <duration>', 'unmute'];
handler.tags = ['group'];
handler.command = /^(mute|unmute)$/i;
handler.group = true;

module.exports = handler;

// --- Helper ---
function parseDuration(input) {
  const match = input.match(/^(\d+)(s|m|h)$/i);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  if (unit === 's') return value * 1000;
  if (unit === 'm') return value * 60 * 1000;
  if (unit === 'h') return value * 60 * 60 * 1000;

  return null;
}
