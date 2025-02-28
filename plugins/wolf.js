const gameData = {};

// Command to start the game
async function startGame(m, sock) {
    const chatId = m.key.remoteJid;
    if (gameData[chatId]) {
        return sock.sendMessage(chatId, { text: "A game is already in progress!" });
    }
    
    gameData[chatId] = { players: [], rolesAssigned: false };
    sock.sendMessage(chatId, { text: "🐺 *Werewolf Game Started!* 🐺\nType /join to participate! You have 2 minutes to join." });
    
    // Wait 2 minutes before assigning roles
    setTimeout(() => assignRoles(chatId, sock), 120000);
}

// Command to join the game
async function joinGame(m, sock) {
    const chatId = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    
    if (!gameData[chatId]) {
        return sock.sendMessage(chatId, { text: "No active game! Type /startgame to begin." });
    }
    if (gameData[chatId].rolesAssigned) {
        return sock.sendMessage(chatId, { text: "Role assignment has started. You can't join now!" });
    }
    if (gameData[chatId].players.includes(sender)) {
        return sock.sendMessage(chatId, { text: "You've already joined the game!" });
    }
    
    gameData[chatId].players.push(sender);
    const playerCount = gameData[chatId].players.length;
    sock.sendMessage(chatId, { text: `✅ @${sender.split('@')[0]} has joined the game! (${playerCount} participants)`, mentions: [sender] });
}

// Function to assign roles and notify players
async function assignRoles(chatId, sock) {
    const game = gameData[chatId];
    if (!game || game.players.length < 3) {
        delete gameData[chatId];
        return sock.sendMessage(chatId, { text: "Not enough players to start! Minimum 3 required." });
    }
    
    const roles = shuffleRoles(game.players.length);
    game.players.forEach((player, index) => {
        sock.sendMessage(player, { text: `🎭 Your role: *${roles[index]}*` });
    });
    
    gameData[chatId].rolesAssigned = true;
    sock.sendMessage(chatId, { text: `🎉 Roles assigned! Players: ${game.players.map(p => `@${p.split('@')[0]}`).join(', ')}`, mentions: game.players });
}

// Helper function to shuffle and assign roles
function shuffleRoles(playerCount) {
    const baseRoles = ['Werewolf', 'Villager', 'Seer', 'Doctor', 'Hunter'];
    const shuffledRoles = baseRoles.sort(() => Math.random() - 0.5);
    return shuffledRoles.slice(0, playerCount);
}

// Handler to start the game
let handler = async (m, { conn }) => {
    if (m.text === '/startgame') {
        await startGame(m, conn);
    } else if (m.text === '/join') {
        await joinGame(m, conn);
    }
}

handler.help = ['wstart'];
handler.tags = ['game'];
handler.command = ['wstart'];
handler.group = true;

export default handler;