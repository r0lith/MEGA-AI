const { generateWAMessageFromContent, proto } = require('baileys');

let handler = async (m, { conn }) => {
  const msg = generateWAMessageFromContent(
    m.chat,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: 'Tap any button below to proceed.'
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: 'MEG • IGNOU'
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'Assignment Question Papers',
                    url: 'https://drive.google.com/drive/folders/1NGM7u9elrEPl_qdigPiUW2_aWa-3lTGJ?usp=sharing'
                  })
                },
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'Solved Assignments',
                    url: 'https://drive.google.com/drive/folders/1DHnTlOAiUvkJs9tqaLHcuHrg5fntrUyO?usp=sharing'
                  })
                },
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'Submission Guidelines',
                    url: 'https://drive.google.com/drive/folders/1b5ml6JfMScAlqGfV1gujBTOf06kQz6VO?usp=drive_link'
                  })
                },
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: 'Assignment Front Page(s)',
                    url: 'https://drive.google.com/file/d/1l8HnJK2iS9M3Lw-bHoOreHw3CYeR2til/view?usp=drive_link'
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

handler.help = ['massgn'];
handler.tags = ['main'];
handler.command = /^massgn$/i;

module.exports = handler;
  