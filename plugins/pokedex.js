const fetch = require('node-fetch');

async function pokedexCommand(sock, chatId, message, text) {
    if (!text) {
        return sock.sendMessage(chatId, { text: 'Please provide a Pokémon name to search for. Example: `.pokedex pikachu`' }, { quoted: message });
    }

    try {
        const url = `https://some-random-api.com/pokemon/pokedex?pokemon=${encodeURIComponent(text)}`;
        const res = await fetch(url);
        const json = await res.json();

        if (!res.ok) throw json.error || 'Unknown error';

        const messageText = `
*≡ Name:* ${json.name}
*≡ ID:* ${json.id}
*≡ Type:* ${Array.isArray(json.type) ? json.type.join(', ') : json.type}
*≡ Abilities:* ${Array.isArray(json.abilities) ? json.abilities.join(', ') : json.abilities}
*≡ Species:* ${Array.isArray(json.species) ? json.species.join(', ') : json.species}
*≡ Height:* ${json.height}
*≡ Weight:* ${json.weight}
*≡ Experience:* ${json.base_experience}
*≡ Description:* ${json.description}
`.trim();

        await sock.sendMessage(chatId, { text: messageText, quoted: message });
    } catch (error) {
        console.error('Pokedex Command Error:', error);
        await sock.sendMessage(chatId, { text: `❌ Error: ${error}` }, { quoted: message });
    }
}

module.exports = pokedexCommand;
