const fetch = require('node-fetch');

const imageUrls = {
    chinese: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/tiktokpics/china.json',
    hijab: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/tiktokpics/hijab.json',
    malaysia: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/tiktokpics/malaysia.json',
    japanese: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/tiktokpics/japan.json',
    korean: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/tiktokpics/korea.json',
    malay: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/tiktokpics/malaysia.json',
    random: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/tiktokpics/random.json',
    random2: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/tiktokpics/random2.json',
    thai: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/tiktokpics/thailand.json',
    vietnamese: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/tiktokpics/vietnam.json',
    indo: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/tiktokpics/indonesia.json',
    boneka: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/boneka.json',
    blackpink3: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/blackpink.json',
    bike: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/bike.json',
    antiwork: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/antiwork.json',
    aesthetic: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/aesthetic.json',
    justina: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/justina.json',
    doggo: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/doggo.json',
    cosplay2: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/cosplay.json',
    cat: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/cat.json',
    car: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/car.json',
    profile2: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/profile.json',
    ppcouple2: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/ppcouple.json',
    notnot: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/notnot.json',
    kpop: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/kpop.json',
    kayes: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/kayes.json',
    ulzzanggirl: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/ulzzanggirl.json',
    ulzzangboy: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/ulzzangboy.json',
    ryujin: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/ryujin.json',
    rose: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/rose.json',
    pubg: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/pubg.json',
    wallml: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/wallml.json',
    wallhp: 'https://raw.githubusercontent.com/GlobalTechInfo/GLOBAL-XMD/master/src/media/randompics/wallhp.json',
};

const channelInfo = {
    forwardingScore: 1,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363319098372999@newsletter',
        newsletterName: 'MEGA MD',
        serverMessageId: -1
    }
};

const messageTemplates = {
    error: (text) => ({ text, contextInfo: channelInfo }),
    success: (imageUrl, command) => ({
        image: { url: imageUrl },
        caption: `*Here is the result of: ${command}*\n*𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 © 𝙼𝙴𝙶𝙰-𝙼𝙳*`,
        contextInfo: channelInfo
    })
};

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function ImagesCommand(sock, chatId, message, command) {
    try {
        const selectedUrl = imageUrls[command];
        if (!selectedUrl) {
            return await sock.sendMessage(chatId, messageTemplates.error('Invalid command'));
        }

        const res = await fetch(selectedUrl);
        if (!res.ok) throw new Error('Failed to fetch media');

        const images = await res.json();
        if (!Array.isArray(images) || images.length === 0) {
            throw new Error('No images found in the dataset');
        }

        const image = pickRandom(images);

        await sock.sendMessage(chatId, messageTemplates.success(image.url, command));
    } catch (err) {
        console.error('Error in tiktokImageCommand:', err);
        await sock.sendMessage(chatId, messageTemplates.error('An error occurred while processing the request. Please try again later.'));
    }
}

module.exports = ImagesCommand;
