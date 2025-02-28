const gameData = {};

// Command to start the game
async function startGame(chatId) {
    if (gameData[chatId]) {
        return "A game is already in progress!";
    }
    
    gameData[chatId] = { players: [], rolesAssigned: false };
    setTimeout(() => assignRoles(chatId), 120000);
    return "🐺 *Werewolf Game Started!* 🐺\nType /join to participate! You have 2 minutes to join.";
}

// Function to assign roles and notify players
async function assignRoles(chatId) {
    const game = gameData[chatId];
    if (!game || game.players.length < 3) {
        delete gameData[chatId];
        return "Not enough players to start! Minimum 3 required.";
    }
    
    const roles = shuffleRoles(game.players.length);
    game.players.forEach((player, index) => {
        // Notify each player of their role
    });
    
    gameData[chatId].rolesAssigned = true;
    return `🎉 Roles assigned! Players: ${game.players.map(p => `@${p.split('@')[0]}`).join(', ')}`;
}

// Helper function to shuffle and assign roles
function shuffleRoles(playerCount) {
    const baseRoles = ['Werewolf', 'Villager', 'Seer', 'Doctor', 'Hunter'];
    const shuffledRoles = baseRoles.sort(() => Math.random() - 0.5);
    return shuffledRoles.slice(0, playerCount);
}

module.exports = { startGame };