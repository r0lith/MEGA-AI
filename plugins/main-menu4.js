import pkg from '@whiskeysockets/baileys';
const { proto, prepareWAMessageMedia, generateWAMessageFromContent } = pkg;
import moment from 'moment-timezone';
import { createHash } from 'crypto';
import { xpRange } from '../lib/levelling.js';

let handler = async (m, { conn, usedPrefix, isAdmin, isOwner }) => {
    // Check if the user is an admin or the bot owner
    if (!isAdmin && !isOwner) {
        return m.reply(`✳️ This command can only be used by group admins or the bot owner.`);
    }

    let d = new Date(new Date() + 3600000);
    let locale = 'en';
    let week = d.toLocaleDateString(locale, { weekday: 'long' });
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    let _uptime = process.uptime() * 1000;
    let uptime = clockString(_uptime);

    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    if (!(who in global.db.data.users)) throw `✳️ The user is not found in my database`;

    let user = global.db.data.users[who];
    let { level } = user;
    let { min, xp, max } = xpRange(level, global.multiplier);
    let greeting = ucapan();

    let str = `
      『 ULTRA-MD 』  
      © 2024 GlobalTechInfo`;

    let msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                "messageContextInfo": {
                    "deviceListMetadata": {},
                    "deviceListMetadataVersion": 2
                },
                interactiveMessage: proto.Message.InteractiveMessage.create({
                    body: proto.Message.InteractiveMessage.Body.create({
                        text: str
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                        text: "Use The Below Buttons"
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        ...(await prepareWAMessageMedia({ image: { url: './assets/Ultra.jpg' } }, { upload: conn.waUploadToServer })),
                        title: null,
                        subtitle: null,
                        hasMediaAttachment: false,
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: [
                            {
                                "name": "single_select",
                                "buttonParamsJson": JSON.stringify({
                                    "title": "TAP TO OPEN",
                                    "sections": [{
                                        "title": "HERE IS BUTTONS MENU",
                                        "highlight_label": "ULTRA",
                                        "rows": [
                                            { "header": "", "title": "🎭 Fun Menu", "description": "The bot's party hat. Games, jokes and instant ROFLs.", "id": `${usedPrefix}funmenu` },
                                            { "header": "", "title": "💵 Economy Menu", "description": "Your personal vault of virtual economy.", "id": `${usedPrefix}economymenu` },
                                            { "header": "", "title": "🎮 Game Menu", "description": "Enter the gaming arena.", "id": `${usedPrefix}gamemenu` },
                                            { "header": "", "title": "🫐 Sticker Menu", "description": "A rainbow of stickers.", "id": `${usedPrefix}stickermenu` },
                                            { "header": "", "title": "🖍️ Fancy Text", "description": "Fancy Text Generator.", "id": `${usedPrefix}fancy` },
                                            { "header": "", "title": "🎊 Tool Menu", "description": "Your handy-dandy toolkit.", "id": `${usedPrefix}toolmenu` },
                                            { "header": "", "title": "🏵️ Logo Menu", "description": "Create a logo that screams You.", "id": `${usedPrefix}logomenu` },
                                            { "header": "", "title": "🖌️ Fancy Text2", "description": "From Text To Fancy Text As jpg", "id": `${usedPrefix}fancy2` },
                                            { "header": "", "title": "🌄 NSFW Menu", "description": "The After Dark menu.", "id": `${usedPrefix}nsfwmenu` }
                                        ]
                                    }]
                                })
                            },
                            {
                                "name": "quick_reply",
                                "buttonParamsJson": JSON.stringify({
                                    "display_text": "MENU2 ❇️",
                                    "id": `${usedPrefix}menu2`
                                })
                            },
                            {
                                "name": "cta_url",
                                "buttonParamsJson": JSON.stringify({
                                    "display_text": "OWNER 🌟",
                                    "url": "https://wa.me/message/HA35ZL76JSHJB1"
                                })
                            },
                            {
                                "name": "cta_url",
                                "buttonParamsJson": JSON.stringify({
                                    "display_text": "SCRIPT 💕",
                                    "url": "https://github.com/GlobalTechInfo/ULTRA-MD"
                                })
                            }
                        ],
                    })
                })
            }
        }
    });

    await conn.relayMessage(msg.key.remoteJid, msg.message, {
        messageId: msg.key.id
    });
}

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'help'];

export default handler;