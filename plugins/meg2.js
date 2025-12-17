const shareLink = "\n\nShare and join for more updates: https://chat.whatsapp.com/KJycVyqrqzC5SqHjPKGnwe";

const handlers = {

  mbooks: async (m) => {
    const text = "📚 MEG Study Material Books available here: https://drive.google.com/drive/folders/1MpZNPPdbM2-1mi0stXK8YIOn-Ga6fx87?usp=drive_link" + shareLink;
    await m.reply(text);
  },
  datesheet: async (m) => {
    const text = "🗓️ Exam Datesheet: _Will be availible in 2026_" + shareLink;
    await m.reply(text);
  },
    gcard: async (m) => {
    const text = "Gradecard Link: https://gradecard.ignou.ac.in/gradecard/" + shareLink;
    await m.reply(text);
  },
   mstatus: async (m) => {
    const text = "Material Dispatch Status: https://gradecard.ignou.ac.in/mpddstatus/Jul25/StudentMaterialStatus.aspx" + shareLink;
    await m.reply(text);
  },
  examform: async (m) => {
    const text = "📝 Access the Exam Form Portal here: https://exam.ignou.ac.in/" + shareLink;
    await m.reply(text);
  },
  mnotes: async (m) => {
    const text = "📖 Subject Notes: https://drive.google.com/drive/folders/1iP-uru2XLtMtEwqZrS_F-qg_aPEMw1-H?usp=drive_link" + shareLink;
    await m.reply(text);
  },
  mpyqs: async (m) => {
    const text = "📑 Previous Year Question Papers: https://drive.google.com/drive/folders/1KS6vTgslGMPUkgUB8X079dagsy-BeZ_q?usp=drive_link" + shareLink;
    await m.reply(text);
  },
  reregistration: async (m) => {
    const text = "🔄 Re-Registration Portal: https://onlinerr.ignou.ac.in/" + shareLink;
    await m.reply(text);
  },
    reeva: async (m) => {
    const text = "🔄 Re-Evaluation Portal: https://www.ignou.ac.in/pages/60" + shareLink;
    await m.reply(text);
  },
  studentportal: async (m) => {
    const text = "🧑‍🎓 Access the Student Portal here: https://ignou.samarth.edu.in/index.php/site/login" + shareLink;
    await m.reply(text);
  },
  teeresults: async (m) => {
    const text = "📊 Check your TEE Results here: https://termendresult.ignou.ac.in/login.aspx" + shareLink;
    await m.reply(text);
  },
};

let handler = async (m, { command }) => {
  if (handlers[command]) {
    await handlers[command](m);
  } else {
    await m.reply("Sorry, that command is not recognized." + shareLink);
  }
};

handler.command = [
  'massgn',
  'mbooks',
  'datesheet',
  'gcard',
  'mstatus',
  'examform',
  'mnotes',
  'mpyqs',
  'reregistration',
  'reeva',
  'studentportal',
  'teeresults'
];
handler.help = handler.command;
handler.tags = ['main'];

export default handler;
