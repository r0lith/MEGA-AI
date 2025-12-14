const fetch = require('node-fetch');

async function imdbCommand(sock, chatId, message, text) {
    if (!text) {
        return sock.sendMessage(chatId, { 
            text: 'Please provide a movie title. Example: `.imdb Inception`', 
            quoted: message 
        });
    }

    try {
        const res = await fetch(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(text)}`);
        if (!res.ok) throw new Error(`API request failed with status ${res.status}`);

        const json = await res.json();
        console.log('IMDB JSON response:', json);

        const ratings = (json.ratings || []).map(r => `• *${r.source}:* ${r.value}`).join('\n') || 'No ratings available';

        const movieInfo = `
*Movie Information:*
• *Title:* ${json.title || 'N/A'}
• *Year:* ${json.year || 'N/A'}
• *Seasons:* ${json.totalseasons || 'N/A'}
• *Rated:* ${json.rated || 'N/A'}
• *Released:* ${json.released || 'N/A'}
• *Runtime:* ${json.runtime || 'N/A'}
• *Genres:* ${json.genres || 'N/A'}
• *Director:* ${json.director || 'N/A'}
• *Writer:* ${json.writer || 'N/A'}
• *Actors:* ${json.actors || 'N/A'}
• *Plot:* ${json.plot || 'N/A'}
• *Languages:* ${json.languages || 'N/A'}
• *Country:* ${json.country || 'N/A'}
• *Awards:* ${json.awards || 'N/A'}
• *Metascore:* ${json.metascore || 'N/A'}
• *Rating:* ${json.rating || 'N/A'}
• *Votes:* ${json.votes || 'N/A'}
• *IMDB ID:* ${json.imdbid || 'N/A'}
• *Type:* ${json.type || 'N/A'}
• *DVD:* ${json.dvd || 'N/A'}
• *Box Office:* ${json.boxoffice || 'N/A'}
• *Production:* ${json.production || 'N/A'}
• *Website:* ${json.website || 'N/A'}

*Ratings:*
${ratings}
        `.trim();

        if (json.poster) {
            await sock.sendMessage(chatId, { 
                image: { url: json.poster }, 
                caption: movieInfo, 
                quoted: message 
            });
        } else {
            await sock.sendMessage(chatId, { text: movieInfo, quoted: message });
        }

    } catch (error) {
        console.error('IMDB Command Error:', error);
        await sock.sendMessage(chatId, { 
            text: 'Failed to fetch movie information. Please try again later.', 
            quoted: message 
        });
    }
}

module.exports = imdbCommand;
