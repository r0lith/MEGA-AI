const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const FileType = require('file-type');

async function getMediaBuffer(message) {
    const m = message.message || {};
    let stream, chunks = [];

    if (m.imageMessage) stream = await downloadContentFromMessage(m.imageMessage, 'image');
    else if (m.videoMessage) stream = await downloadContentFromMessage(m.videoMessage, 'video');
    else if (m.audioMessage) stream = await downloadContentFromMessage(m.audioMessage, 'audio');
    else if (m.stickerMessage) stream = await downloadContentFromMessage(m.stickerMessage, 'sticker');
    else if (m.documentMessage) stream = await downloadContentFromMessage(m.documentMessage, 'document');
    else return null;

    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
}

async function getQuotedMediaBuffer(message) {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted) return null;
    return getMediaBuffer({ message: quoted });
}

async function tourlCommand(sock, chatId, message) {
    try {
        let buffer = await getMediaBuffer(message);
        if (!buffer) buffer = await getQuotedMediaBuffer(message);
        if (!buffer) {
            return await sock.sendMessage(chatId, { text: 'Send or reply to a media (image, video, audio, sticker, document, or file) to get a URL.' }, { quoted: message });
        }

        if (buffer.length > 10 * 1024 * 1024) {
            return await sock.sendMessage(chatId, { text: '✴️ Media exceeds 10 MB. Please upload a smaller file.' }, { quoted: message });
        }

        const type = await FileType.fromBuffer(buffer); // CJS correct usage
        if (!type?.ext) throw new Error('❌ Could not determine file type.');

        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('userhash', '');
        form.append('fileToUpload', buffer, `upload.${type.ext}`);

        const res = await axios.post('https://catbox.moe/user/api.php', form, { headers: form.getHeaders() });
        const url = res.data;

        if (!url.startsWith('https://')) throw new Error('Upload failed. Invalid URL returned.');

        const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
        await sock.sendMessage(chatId, { text: `✅ Upload Successful!\n📎 URL: ${url}\n💾 Size: ${sizeMB} MB` }, { quoted: message });

    } catch (e) {
        console.error('Catbox upload error:', e);
        await sock.sendMessage(chatId, { text: `❌ Upload failed: ${e.message || e}` }, { quoted: message });
    }
}

module.exports = tourlCommand;
