const { proto, prepareWAMessageMedia, generateWAMessageFromContent } = require('@whiskeysockets/baileys');

let handler = async (m, { conn, usedPrefix }) => {
  console.log('[MEG HANDLER FIRED]', m.text);
  const text =
    `Hello student! 🙋‍♂️\n` +
    `You can check the options below to access Assignments, Books, Datesheet, Exam Forms, and more to help you with your studies.`;

  const msg = generateWAMessageFromContent(
    m.chat,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({ text }),

            header: proto.Message.InteractiveMessage.Header.create({
              ...(await prepareWAMessageMedia(
                { image: { url: '../assets/bot_image.jp' } },
                { upload: conn.waUploadToServer }
              )),
              hasMediaAttachment: true
            }),

            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  name: 'single_select',
                  buttonParamsJson: JSON.stringify({
                    title: 'Tap Here',
                    sections: [
                      {
                        highlight_label: 'Jul-2025 & Jan-2026',
                        rows: [
                          {
                            title: 'Assignments',
                            description: 'Assignments & More',
                            id: `${usedPrefix}massgn`
                          },
                          {
                            title: 'Books',
                            description: 'MEG Study Material',
                            id: `${usedPrefix}mbooks`
                          },
                          {
                            title: 'Datesheet',
                            description: 'Exam Datesheet',
                            id: `${usedPrefix}datesheet`
                          },
                          {
                            title: 'Exam Form',
                            description: 'Exam Form Portal',
                            id: `${usedPrefix}examform`
                          },
                          {
                            title: 'Gradecard',
                            description: "Student's Gradecard",
                            id: `${usedPrefix}gcard`
                          },
                          {
                            title: 'Material Dispatch',
                            description: 'Material Dispatch Status',
                            id: `${usedPrefix}mstatus`
                          },
                          {
                            title: 'Notes',
                            description: 'Subject Notes',
                            id: `${usedPrefix}mnotes`
                          },
                          {
                            title: 'PYQs',
                            description: 'Previous Year Question Papers',
                            id: `${usedPrefix}mpyqs`
                          },
                          {
                            title: 'Re-Registration',
                            description: 'Re-Registration Portal',
                            id: `${usedPrefix}reregistration`
                          },
                          {
                            title: 'Re-Evaluation',
                            description: 'Re-Evaluation Portal',
                            id: `${usedPrefix}reeva`
                          },
                          {
                            title: 'Student Portal',
                            description: 'Access Student Portal',
                            id: `${usedPrefix}studentportal`
                          },
                          {
                            title: 'TEE Results',
                            description: 'Check TEE Results',
                            id: `${usedPrefix}teeresults`
                          }
                        ]
                      }
                    ]
                  })
                }
              ]
            })
          })
        }
      }
    },
    {}
  );

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
};

handler.help = ['meg'];
handler.tags = ['main'];
handler.command = /^meg$/i;

module.exports = handler;
