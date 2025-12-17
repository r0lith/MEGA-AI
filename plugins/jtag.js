import { rejectIfNotAdmin } from '../lib/adminCheck.js'; // kept for compatibility if you need it

if (!global.groupMetaCache) global.groupMetaCache = {};

let handler = async (m, { conn }) => {
  try {
    // --- Require a quoted text message (same UX as before) ---
    if (!m.quoted) {
      return conn.sendMessage(
        m.chat,
        { text: `✳️ Reply to a *text message* with *tag*` },
        { quoted: m }
      );
    }

    const quoted = m.quoted;
    const text = quoted?.text || quoted?.conversation;
    if (!text) {
      return conn.sendMessage(
        m.chat,
        { text: `✳️ This command only works on *text messages*.` },
        { quoted: m }
      );
    }

    // --- Parse target JID argument (optional) ---
    // m.text may contain the command and args. We'll be forgiving with where the arg is.
    const body = (m.text || m?.conversation || '').trim();
    const parts = body.split(/\s+/);
    // parts[0] is command; first arg (if any) at parts[1]
    let targetArg = parts[1] || null;

    // Normalize target JID if provided
    let targetJid;
    if (targetArg) {
      targetArg = targetArg.trim();
      // if arg contains ':' or looks like lid, keep as-is; if no @ treat as @g.us
      if (!targetArg.includes('@')) {
        targetJid = targetArg + '@g.us';
      } else {
        targetJid = targetArg;
      }
    } else {
      // default to current chat (works only if current chat is a group)
      targetJid = m.chat;
    }

    // --- Fetch metadata for target group (cached) ---
    const cacheEntry = global.groupMetaCache[targetJid];
    let metadata;
    if (cacheEntry && Date.now() - cacheEntry.timestamp < 60_000) {
      metadata = cacheEntry.data;
    } else {
      try {
        metadata = await conn.groupMetadata(targetJid);
      } catch (err) {
        return conn.sendMessage(
          m.chat,
          { text: `✳️ Could not fetch metadata for ${targetJid}. Make sure the JID is correct and the bot is in that group.` },
          { quoted: m }
        );
      }
      global.groupMetaCache[targetJid] = { data: metadata, timestamp: Date.now() };
    }

    // --- Resolve sender id robustly ---
    const senderId = m.sender || m.participant || (m.key && (m.key.participant || m.key.remoteJid)) || null;
    if (!senderId) {
      return conn.sendMessage(
        m.chat,
        { text: `✳️ Unable to determine your sender id.` },
        { quoted: m }
      );
    }

    // --- Check sender is admin in target group ---
    const senderParticipant = metadata.participants.find(
      p => p.id === senderId || p.jid === senderId || (p.lid && senderId.includes(p.lid.split('@')[0]))
    );

    const senderIsAdmin =
      senderParticipant?.admin === 'admin' ||
      senderParticipant?.admin === 'superadmin' ||
      senderParticipant?.isAdmin === true ||
      senderParticipant?.role === 'admin';

    if (!senderIsAdmin) {
      return conn.sendMessage(
        m.chat,
        { text: `✳️ You must be an *admin of ${targetJid}* to run this command.` },
        { quoted: m }
      );
    }

    // --- Normalize bot JID and check bot admin status in target ---
    const botJidRaw = conn.user?.id || conn.user; // library differences
    const botJid = (botJidRaw && botJidRaw.split ? botJidRaw.split(':')[0] + '@s.whatsapp.net' : botJidRaw) || conn.user;

    let botInfo = metadata.participants.find(
      p =>
        p.id === botJid ||
        p.jid === botJid ||
        p.lid === botJid ||
        (p.lid && botJid && botJid.includes(p.lid.split('@')[0]))
    );

    if (!botInfo) {
      // fallback: find any admin participant with lid (some metadata shapes differ)
      botInfo = metadata.participants.find(p => p.isAdmin && p.lid);
      console.warn('[TOTAG] Bot participant not found directly — using fallback:', botInfo);
    }

    const botIsAdmin =
      botInfo?.admin === 'admin' ||
      botInfo?.admin === 'superadmin' ||
      botInfo?.isAdmin === true ||
      botInfo?.role === 'admin';

    if (!botIsAdmin) {
      return conn.sendMessage(
        m.chat,
        { text: `✳️ I need admin rights in ${targetJid} to tag all members.` },
        { quoted: m }
      );
    }

    // --- Build mentions (exclude bot) ---
    const users = metadata.participants
      .map(p => p.id || p.jid)
      .filter(id => id && id !== botJid);

    if (!users.length) {
      return conn.sendMessage(
        m.chat,
        { text: `✳️ No members found to tag in ${targetJid}.` },
        { quoted: m }
      );
    }

    // --- Send the message to the target group with mentions ---
    await conn.sendMessage(
      targetJid,
      {
        text,
        mentions: users
      },
      { quoted: m }
    );

    console.log(`[TOTAG] ${senderId} tagged ${users.length} members in ${targetJid}`);

  } catch (err) {
    console.error('❌ Error in totag command:', err);
    await conn.sendMessage(
      m.chat,
      { text: `An error occurred: ${err?.message || String(err)}` },
      { quoted: m }
    );
  }
};

handler.help = ['jtag'];
handler.tags = ['group'];
handler.command = /^(jtag)$/i;

// allow invocation from private chats as well as groups — don't force group-only restriction here
// (previous version set handler.group = true; we intentionally omit that)

export default handler;
