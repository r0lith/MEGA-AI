const path = require('path');
const fs = require('fs');
const axios = require('axios');

const GITHUB_USERNAME = 'stormfiber';

/**
 * Save credentials from GitHub Gist to session/creds.json
 * @param {string} txt - Gist ID with optional prefix
 */
async function SaveCreds(txt) {
    const __dirname = path.dirname(__filename);

    const gistId = txt.replace('GlobalTechInfo/MEGA-MD_', '');
    const gistUrl = `https://gist.githubusercontent.com/${GITHUB_USERNAME}/${gistId}/raw/creds.json`;
    // console.log(`🔗 GIST URL: ${gistUrl}`);

    try {
        // console.log('📥 Downloading credentials from GitHub Gist...');
        const response = await axios.get(gistUrl);
        const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        
        const sessionDir = path.join(__dirname, '..', 'session');
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
            console.log('📁 Created session directory:', sessionDir);
        }
        
        const credsPath = path.join(sessionDir, 'creds.json');
        fs.writeFileSync(credsPath, data);
        console.log('✅ Saved credentials to', credsPath);

    } catch (error) {
        console.error('❌ Error downloading or saving credentials:', error.message);
        if (error.response) {
            console.error('❌ Status:', error.response.status);
            console.error('❌ Response:', error.response.data);
        }
        throw error;
    }
}

module.exports = SaveCreds;
