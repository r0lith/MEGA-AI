import pkg from 'baileys';
const { proto, prepareWAMessageMedia, generateWAMessageFromContent } = pkg;

let handler = async (m, { conn }) => {
  const str = `Tap any button below to proceed.`;

  // Example: send 3 CTA URL buttons
  await conn.sendMessage(
    m.chat,
    {
      text: str,
      // Optional: Uncomment and use if you want an image header
      // image: { url: './assets/A.png' },
      // caption: str,     // If using image
      footer: 'MEG • IGNOU',
      interactiveButtons: [
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "Assignment Question Papers",
            url: "https://drive.google.com/drive/folders/1NGM7u9elrEPl_qdigPiUW2_aWa-3lTGJ?usp=sharing"
          })
        },
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "Solved Assignments",
            url: "https://drive.google.com/drive/folders/1DHnTlOAiUvkJs9tqaLHcuHrg5fntrUyO?usp=sharing"
          })
        },
        {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "Submission Guidelines",
            url: "https://drive.google.com/drive/folders/1b5ml6JfMScAlqGfV1gujBTOf06kQz6VO?usp=drive_link"
          })
        },
           {
          name: "cta_url",
          buttonParamsJson: JSON.stringify({
            display_text: "Assignment Front Page(s)",
            url: "https://drive.google.com/file/d/1l8HnJK2iS9M3Lw-bHoOreHw3CYeR2til/view?usp=drive_link"
          })
        }
      ]
    },
    { quoted: m }
  );
};

handler.help = ['massgn'];
handler.tags = ['main'];
handler.command = ['massgn'];
export default handler;
