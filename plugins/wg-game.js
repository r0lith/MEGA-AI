const roles = require("./wg-roles"); // Import role definitions
const games = {}; // Store active games

// Function to shuffle an array (used for randomizing roles)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Command to start the game
async function startGame(m, sock) {
    const chatId = m.key.remoteJid;
    if (games[chatId]) {
        return sock.sendMessage(chatId, { text: "A game is already in progress!" });
    }
    
    games[chatId] = { players: [], rolesAssigned: false, status: "waiting", phase: "night", votes: {}, werewolfTargets: [], dayCount: 1 };
    sock.sendMessage(chatId, { text: "🐺 *Werewolf Game Started!* 🐺\nType wjoin to participate! You have 2 minutes to join." });
    
    // Wait 2 minutes before assigning roles
    setTimeout(() => assignRoles(chatId, sock), 120000);
}

// Command to join the game
async function joinGame(m, sock) {
    const chatId = m.key.remoteJid;
    let sender = m.key.participant || m.key.remoteJid;

    // Ensure sender is a valid user (not a group ID)
    if (!sender.includes("@s.whatsapp.net")) {
        return sock.sendMessage(chatId, { text: "Invalid player detected! Only individual users can join." });
    }

    if (!games[chatId]) {
        return sock.sendMessage(chatId, { text: "No active game! Type /startgame to begin." });
    }
    if (games[chatId].rolesAssigned) {
        return sock.sendMessage(chatId, { text: "Role assignment has started. You can't join now!" });
    }
    if (games[chatId].players.includes(sender)) {
        return sock.sendMessage(chatId, { text: "You've already joined the game!" });
    }

    console.log(`User joining: ${sender}, Current Players:`, games[chatId].players); // debugging
    games[chatId].players.push(sender);
    const playerCount = games[chatId].players.length;
    
    let responseMessage = `✅ @${sender.split('@')[0]} has joined the game!`;
    if (playerCount > 1) {
        responseMessage += `\n${playerCount} participants have joined.`;
    }

    sock.sendMessage(chatId, { text: responseMessage, mentions: [sender] });

}

// Function to assign roles and notify players
async function assignRoles(chatId, sock) {
    const game = games[chatId];
    if (!game || game.players.length < 5) {
        delete games[chatId];
        return sock.sendMessage(chatId, { text: "Not enough players to start! Minimum 5 required." });
    }
    
    const assignedRoles = assignRandomRoles(game.players);
    game.roles = assignedRoles;
    game.rolesAssigned = true;
    game.status = "ongoing";
    
    game.players.forEach((player) => {
        sock.sendMessage(player, { text: `🎭 Your role: *${game.roles[player].name}*\n📜 ${game.roles[player].description}\n⚡ Abilities: ${game.roles[player].abilities.length > 0 ? game.roles[player].abilities.join(', ') : 'None'}` });
    });
    
    sock.sendMessage(chatId, { text: `🎉 Roles assigned! Players: ${game.players.map(p => `@${p.split('@')[0]}`).join(', ')}`, mentions: game.players });
}

// Helper function to shuffle and assign roles
function assignRandomRoles(players) {
    const roleKeys = Object.keys(roles);
    shuffleArray(roleKeys);
    
    let assignedRoles = {};
    players.forEach((player, index) => {
        const roleKey = roleKeys[index % roleKeys.length];
        assignedRoles[player] = {
            name: roleKey,
            ...roles[roleKey] // Merge full role details
        };
    });
    return assignedRoles;

}

// Handler to start the game
let handler = async (m, { conn }) => {
    await startGame(m, conn);
}

handler.help = ['wstart'];
handler.tags = ['game'];
handler.command = ['wstart'];
handler.group = true;

export default handler;

// Listener for "wjoin" command
handler.all = async function (m) {
    if (/^wjoin$/i.test(m.text)) {
        await joinGame(m, this);
    }
    return !0;
}
