import roles from "./wg-roles.js";
import { getGame, updateGameState, removeGame } from "./wg-gameState.js";
import { nextPhase } from "./wg-events.js"; // Import nextPhase function

// Function to shuffle an array (used for randomizing roles)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Command to start the game
async function startGame(chatId, sender, args, sock, m) {
    let game = getGame(chatId);

    if (game) {
        console.log(`⚠️ DEBUG: Game already exists in "${chatId}".`);
        return sock.sendMessage(chatId, { text: "A game is already in progress!" });
    }

    console.log(`🟢 DEBUG: Creating a new game in "${chatId}".`);

    game = {
        players: [],
        rolesAssigned: false,
        status: "waiting",
        phase: "night",
        votes: {},
        werewolfTargets: [],
        dayCount: 1
    };
    updateGameState(chatId, game);

    console.log(`✅ DEBUG: New game created in "${chatId}".`);

    sock.sendMessage(chatId, { text: "🐺 *Werewolf Game Started!* 🐺\nType wjoin to participate! You have 2 minutes to join." });

    setTimeout(() => {
        if (getGame(chatId)) {
            assignRoles(chatId, sender, args, sock, m);
        } else {
            console.log(`❌ DEBUG: Game in "${chatId}" was deleted before role assignment.`);
        }
    }, 120000);
}

// Command to join the game
async function joinGame(chatId, sender, args, sock, m) {
    let senderName = m.pushName || sender.split('@')[0];
    let game = getGame(chatId);

    console.log(`🟡 DEBUG: User "${senderName}" is trying to join game in "${chatId}".`);

    if (!sender.includes("@s.whatsapp.net")) {
        console.log(`❌ DEBUG: Group ID detected as player (${sender})`);
        return sock.sendMessage(chatId, { text: "Invalid player detected! Only individual users can join." });
    }

    if (!game) {
        console.log(`❌ DEBUG: No active game found for "${chatId}".`);
        return sock.sendMessage(chatId, { text: "No active game! Type /startgame to begin." });
    }

    if (game.rolesAssigned) {
        console.log(`⚠️ DEBUG: Roles already assigned, cannot join.`);
        return sock.sendMessage(chatId, { text: "Role assignment has started. You can't join now!" });
    }

    if (game.players.includes(sender)) {
        console.log(`⚠️ DEBUG: User "${senderName}" has already joined.`);
        return sock.sendMessage(chatId, { text: "You've already joined the game!" });
    }

    game.players = [...new Set([...game.players, sender])];
    updateGameState(chatId, game);

    console.log(`✅ DEBUG: Updated player list:`, game.players);

    const playerCount = game.players.length;
    let responseMessage = `✅ @${senderName} has joined the game!`;
    if (playerCount > 1) {
        responseMessage += `\n${playerCount} participants have joined.`;
    }

    sock.sendMessage(chatId, { text: responseMessage, mentions: [sender] });
}

// Function to assign roles and notify players
async function assignRoles(chatId, sender, args, sock, m) {
    let game = getGame(chatId);

    if (!game) {
        console.log(`❌ DEBUG: Game does not exist when trying to assign roles in "${chatId}".`);
        return sock.sendMessage(chatId, { text: "No active game! Type /startgame to begin." });
    }

    console.log(`🎭 DEBUG: Assigning roles in "${chatId}". Players:`, game.players);

    if (game.players.length < 3) {
        return sock.sendMessage(chatId, { text: "Not enough players to start! Minimum 3 required." });
    }

    const assignedRoles = assignRandomRoles(game.players);
    game.roles = assignedRoles;
    game.rolesAssigned = true;
    game.status = "ongoing";
    updateGameState(chatId, game);

    console.log(`✅ DEBUG: Roles assigned in "${chatId}".`, game.roles);

    game.players.forEach((player) => {
        sock.sendMessage(player, {
            text: `🎭 Your role: *${game.roles[player].name}*\n📜 ${game.roles[player].description}\n⚡ Abilities: ${game.roles[player].abilities.length > 0 ? game.roles[player].abilities.join(', ') : 'None'}`
        });
    });

    sock.sendMessage(chatId, { 
        text: `🎉 Roles assigned! Players: ${[...new Set(game.players.map(p => `@${p.split('@')[0]}`))].join(', ')}`, 
        mentions: [...new Set(game.players)] 
    });

    // Trigger the next phase after roles are assigned
    nextPhase(chatId, sock);
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
            ...roles[roleKey] 
        };
    });
    return assignedRoles;
}

// Handler to start the game
let handler = async (m, { conn }) => {
    await startGame(m.key.remoteJid, m.key.participant || m.key.remoteJid, [], conn, m);
}

handler.help = ['wstart'];
handler.tags = ['game'];
handler.command = ['wstart'];
handler.group = true;

export default handler;

// Listener for "wjoin" command
handler.all = async function (m) {
    if (/^wjoin$/i.test(m.text)) {
        await joinGame(m.key.remoteJid, m.key.participant || m.key.remoteJid, [], this, m);
    }
    return !0;
}

// Export the functions
export { startGame, joinGame };