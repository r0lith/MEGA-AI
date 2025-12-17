const pkg = require('baileys');
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = pkg;

let handler = async (m, { conn, text, mentionedJid, usedPrefix }) => {

  // Extract the first mentioned user or from text
  let userToWelcome = null;

  if (mentionedJid && mentionedJid.length > 0) {
    userToWelcome = mentionedJid[0];
  } else if (text) {
    // Normalize phone number: remove spaces, plus sign, then extract digits only
    let number = text.replace(/\s+/g, '').replace(/^\+/, '').replace(/[^0-9]/g, '');
    if (number.length >= 10) {
      userToWelcome = number + '@s.whatsapp.net';
    }
  }

  if (!userToWelcome) {
    return m.reply('Please mention a user to welcome.');
  }

  // Prepare welcome message text with dynamic user mention
  const welcomeText = `Hello @${userToWelcome.split('@')[0]}! Welcome here! 🙋 You can check the options below to access Assignments, Books, Datesheet, Exam Forms, and more to help you with your studies.`;

  let message = await generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2,
        },
        interactiveMessage: proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({
            text: welcomeText
          }),
          header: proto.Message.InteractiveMessage.Header.create({
            ...(await prepareWAMessageMedia({ image: { url: './assets/A.png' } }, { upload: conn.waUploadToServer })),
            title: null,
            subtitle: null,
            hasMediaAttachment: false
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [
              {
                "name": "single_select",
                "buttonParamsJson": JSON.stringify({
                  "title": "Tap Here",
                  "sections": [{
                    "highlight_label": "Jul-2025 & Jan-2026",
                    "rows": [
                      { "header": "", "title": "Assignments", "description": "Assignments & More", "id": `${usedPrefix}massgn` },
                      { "header": "", "title": "Books", "description": "MEG Study Material", "id": `${usedPrefix}mbooks` },
                      { "header": "", "title": "Datesheet", "description": "Exam Datesheet", "id": `${usedPrefix}datesheet` },
                      { "header": "", "title": "Exam Form", "description": "Exam Form Portal", "id": `${usedPrefix}examform` },
                      { "header": "", "title": "Gradecard", "description": "Student's Gradecard", "id": `${usedPrefix}gcard` },
                      { "header": "", "title": "Material Dispatch", "description": "Material Dispatch Status", "id": `${usedPrefix}mstatus` },
                      { "header": "", "title": "Notes", "description": "Subject Notes", "id": `${usedPrefix}mnotes` },
                      { "header": "", "title": "PYQs", "description": "Previous Year Question Papers", "id": `${usedPrefix}mpyqs` },
                      { "header": "", "title": "Re-Registration", "description": "Re-Registration Portal", "id": `${usedPrefix}reregistration` },
                      { "header": "", "title": "Re-Evaluation", "description": "Re-Evaluation Portal", "id": `${usedPrefix}reeva` },
                      { "header": "", "title": "Student Portal", "description": "Access Student Portal", "id": `${usedPrefix}studentportal` },
                      { "header": "", "title": "TEE Results", "description": "Check TEE Results", "id": `${usedPrefix}teeresults` }
                    ]
                  }]
                })
              }
            ]
          })
        }),
      }
    }
  }, {});

  await conn.relayMessage(message.key.remoteJid, message.message, { messageId: message.key.id });
};

handler.help = ['welcome @user'];
handler.tags = ['main'];
handler.command = ['welcome'];
handler.group = true;
handler.admin = false; // optionally restrict to admin only

module.exports = handler;