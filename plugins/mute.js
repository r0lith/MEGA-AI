// --- Imports ---
const { rejectIfNotAdmin } = require('../lib/adminCheck')


let mutedUsers = {};
if (!global.groupMetaCache) global.groupMetaCache = {};

// --- Command Handler ---
let handler = async (m, { conn, args, command }) => {
  try {
    // ✅ Step 1: Ensure sender is admin
    const allowed = await rejectIfNotAdmin(conn, m);
    if (!allowed) return; // stops execution if not admin

    // ✅ Step 2: Ensure bot is admin too (for delete rights)
    const botJidRaw = conn.user.id;
    const botJid = botJidRaw.split(':')[0] + '@s.whatsapp.net';

    // --- metadata cache (to avoid rate-overlimit) ---
    const cacheEntry = global.groupMetaCache[m.chat];
    let metadata;

    if (cacheEntry && Date.now() - cacheEntry.timestamp < 60000) {
      metadata = cacheEntry.data;
    } else {
      metadata = await conn.groupMetadata(m.chat);
      global.groupMetaCache[m.chat] = { data: metadata, timestamp: Date.now() };
    }




    // ✅ Try to find bot info more reliably
    let botInfo = metadata.participants.find(
      p =>
        p.id === botJid ||
        p.jid === botJid ||
        p.lid === botJid ||
        (p.lid && botJid?.includes(p.lid.split('@')[0]))
    );

    // If still not found, fallback to any participant that looks like a bot (isAdmin:true)
    if (!botInfo) {
      botInfo = metadata.participants.find(p => p.isAdmin && p.lid);
      console.warn('[Mute] Bot participant not found directly — using fallback:', botInfo);
    }

    const botIsAdmin =
      botInfo?.admin === 'admin' ||
      botInfo?.admin === 'superadmin' ||
      botInfo?.isAdmin === true ||
      botInfo?.role === 'admin';

    console.log('[Mute] Bot admin check:', { botJid, found: !!botInfo, botIsAdmin });

    if (!botIsAdmin) {
      return conn.sendMessage(
        m.chat,
        { text: '✳️ I need to be an admin to mute users (to delete their messages).' },
        { quoted: m }
      );
    }

    // --- Original Mute Logic ---
    if (!m.quoted) throw '✳️ Please reply to a message to mute the user.';

    // Safely resolve target user JID/LID
    let userToMute =
      m.quoted.key?.participant ||
      m.message?.extendedTextMessage?.contextInfo?.participant ||
      m.quoted.sender;

    if (!userToMute) {
      return conn.sendMessage(
        m.chat,
        { text: 'Could not identify the user to mute. Please reply to a valid message.' },
        { quoted: m }
      );
    }

    // Protect owner
    if (userToMute.startsWith('919737825303')) {
      return conn.sendMessage(m.chat, { text: "He's my owner, you idiot." }, { quoted: m });
    }

    // --- MUTE / UNMUTE Commands ---
    if (command === 'mute') {
      const duration = args[0];
      if (!duration) throw '✳️ Please specify duration, e.g. !mute 10m';

      const time = parseDuration(duration);
      if (!time) throw '✳️ Invalid duration format. Use 10s / 5m / 1h';

      mutedUsers[userToMute] = Date.now() + time;
      console.log(`[Mute] Muting user ${userToMute} for ${duration}`);

      await conn.sendMessage(m.chat, { text: `🔇 User has been muted for ${duration}.` }, { quoted: m });

      setTimeout(() => {
        delete mutedUsers[userToMute];
        conn.sendMessage(m.chat, { text: `🔊 User has been unmuted.` }, { quoted: m });
      }, time);

    } else if (command === 'unmute') {
      if (mutedUsers[userToMute]) {
        delete mutedUsers[userToMute];
        await conn.sendMessage(m.chat, { text: '🔊 User has been unmuted.' }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, { text: '✳️ User is not muted.' }, { quoted: m });
      }
    }
  } catch (err) {
    console.error('❌ Error in mute/unmute command:', err);
    await conn.sendMessage(m.chat, { text: `An error occurred: ${err.message || err}` }, { quoted: m });
  }
};

// --- Message Interceptor (for deleting muted users’ messages) ---
handler.before = async (m, { conn }) => {
  const userJid = m.sender;
  const userLid = m.participant;

  const isMutedByJid = mutedUsers[userJid] && Date.now() < mutedUsers[userJid];
  const isMutedByLid = userLid && mutedUsers[userLid] && Date.now() < mutedUsers[userLid];

  if (isMutedByJid || isMutedByLid) {
    try {
      console.log(`[Mute] Deleting message from muted user: ${userJid || userLid}`);
      await conn.sendMessage(m.chat, { delete: m.key });
      return true;
    } catch (e) {
      console.error(`[Mute] Failed to delete message: ${e.message}`);
      delete mutedUsers[userJid];
      delete mutedUsers[userLid];
      return false;
    }
  }
  return false;
};

// --- Command Info ---
handler.help = ['mute <duration>', 'unmute'];
handler.tags = ['group'];
handler.command = /^(mute|unmute)$/i;
handler.group = true;

module.exports = handler;

// --- Helper Function ---
function parseDuration(duration) {
  const match = duration.match(/^(\d+)(s|m|h)$/);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    default: return null;
  }
}
