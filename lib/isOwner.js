const { isSudo } = require('./index');

/**
 * 🔐 HARD-CODED OWNER JID
 * Change this to YOUR WhatsApp JID
 */
const OWNER_JID = '919737825303@s.whatsapp.net';

// Clean numeric owner ID (for fallback matching)
const OWNER_NUM = OWNER_JID.split(':')[0].split('@')[0];

async function isOwnerOrSudo(senderId, sock = null, chatId = null) {
    if (!senderId) return false;

    const senderIdClean = senderId.split(':')[0].split('@')[0];
    const senderLidNumeric = senderId.includes('@lid')
        ? senderId.split('@')[0].split(':')[0]
        : '';

    // ✅ Direct JID match
    if (senderId === OWNER_JID) return true;

    // ✅ Clean numeric match
    if (senderIdClean === OWNER_NUM) return true;

    // ✅ Group + LID handling
    if (sock && chatId && chatId.endsWith('@g.us') && senderId.includes('@lid')) {
        try {
            const botLid = sock.user?.lid || '';
            const botLidNumeric = botLid.includes(':')
                ? botLid.split(':')[0]
                : botLid.includes('@')
                    ? botLid.split('@')[0]
                    : botLid;

            // Owner talking as bot-linked LID
            if (senderLidNumeric && botLidNumeric && senderLidNumeric === botLidNumeric) {
                return true;
            }

            const metadata = await sock.groupMetadata(chatId);
            const participants = metadata.participants || [];

            const participant = participants.find(p => {
                const pLid = p.lid || '';
                const pId = p.id || '';

                const pLidNumeric = pLid.includes(':')
                    ? pLid.split(':')[0]
                    : pLid.includes('@')
                        ? pLid.split('@')[0]
                        : pLid;

                const pIdClean = pId.split(':')[0].split('@')[0];

                return (
                    p.id === senderId ||
                    p.lid === senderId ||
                    pLidNumeric === senderLidNumeric ||
                    pIdClean === senderIdClean ||
                    pIdClean === OWNER_NUM
                );
            });

            if (participant) {
                const participantId = participant.id || '';
                const participantLid = participant.lid || '';

                const participantIdClean = participantId.split(':')[0].split('@')[0];
                const participantLidNumeric = participantLid.includes(':')
                    ? participantLid.split(':')[0]
                    : participantLid.includes('@')
                        ? participantLid.split('@')[0]
                        : participantLid;

                if (
                    participantId === OWNER_JID ||
                    participantIdClean === OWNER_NUM ||
                    participantLidNumeric === botLidNumeric
                ) {
                    return true;
                }
            }
        } catch (e) {
            console.error('❌ [isOwner] Group/LID check error:', e);
        }
    }

    // ✅ Final numeric fallback
    if (senderId.includes(OWNER_NUM)) return true;

    // ✅ Sudo fallback
    try {
        return await isSudo(senderId);
    } catch (e) {
        console.error('❌ [isOwner] Sudo check error:', e);
        return false;
    }
}

module.exports = isOwnerOrSudo;