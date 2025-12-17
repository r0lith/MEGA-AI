import pkg from 'baileys';
const { proto, prepareWAMessageMedia, generateWAMessageFromContent } = pkg;
let handler = async (m, { conn, usedPrefix }) => {
  const OwnerName = 'Hello there!';
  const str = `Hello student! 🙋‍♂️ You can check the options below to access Assignments, Books, Datesheet, Exam Forms, and more to help you with your studies.`;

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
              },

            ],
          })
        })
      }
    }
  }, {});

  await conn.relayMessage(msg.key.remoteJid, msg.message, {
    messageId: msg.key.id
  });
};
handler.help = ['MEG'];
handler.tags = ['main'];
handler.command = ['MEG', 'Meg', 'meg'];
export default handler;