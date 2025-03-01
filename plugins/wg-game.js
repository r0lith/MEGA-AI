import roles from "./wg-roles.js"; // ✅ ES module import
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
        console.log(`⚠️ DEBUG: Game already exists in "${chatId}".`);
        return sock.sendMessage(chatId, { text: "A game is already in progress!" });
    }

    console.log(`🟢 DEBUG: Creating a new game in "${chatId}".`);

    games[chatId] = {
        players: [],
        rolesAssigned: false,
        status: "waiting",
        phase: "night",
        votes: {},
        werewolfTargets: [],
        dayCount: 1
    };

    console.log(`✅ DEBUG: New game created in "${chatId}". Current games:`, JSON.stringify(games, null, 2));

    sock.sendMessage(chatId, { text: "🐺 *Werewolf Game Started!* 🐺\nType wjoin to participate! You have 2 minutes to join." });

    setTimeout(() => {
        if (games[chatId]) {  
            assignRoles(chatId, sock);
        } else {
            console.log(`❌ DEBUG: Game in "${chatId}" was deleted before role assignment.`);
        }
    }, 120000);
}


// Command to join the game
async function joinGame(m, sock) {
    const chatId = m.key.remoteJid;
    let sender = m.key.participant || m.key.remoteJid;
    let senderName = m.pushName || sender.split('@')[0];

    console.log(`🟡 DEBUG: User "${senderName}" is trying to join game in "${chatId}".`);

    // 🚨 Prevent Group ID from joining
    if (!sender.includes("@s.whatsapp.net")) {
        console.log(`❌ DEBUG: Group ID detected as player (${sender})`);
        return sock.sendMessage(chatId, { text: "Invalid player detected! Only individual users can join." });
    }

    if (!games[chatId]) {
        console.log(`❌ DEBUG: No active game found for "${chatId}".`);
        console.log(`🟠 DEBUG: All active games before error:`, JSON.stringify(games, null, 2));
        return sock.sendMessage(chatId, { text: "No active game! Type /startgame to begin." });
    }
    

    if (games[chatId].rolesAssigned) {
        console.log(`⚠️ DEBUG: Roles already assigned, cannot join.`);
        return sock.sendMessage(chatId, { text: "Role assignment has started. You can't join now!" });
    }

    if (games[chatId].players.includes(sender)) {
        console.log(`⚠️ DEBUG: User "${senderName}" has already joined.`);
        return sock.sendMessage(chatId, { text: "You've already joined the game!" });
    }

    console.log(`✅ DEBUG: User "${senderName}" is added to the game. Players before:`, games[chatId].players);

    games[chatId].players = [...new Set([...games[chatId].players, sender])];

    console.log(`✅ DEBUG: Updated player list:`, games[chatId].players);

    const playerCount = games[chatId].players.length;
    let responseMessage = `✅ @${senderName} has joined the game!`;
    if (playerCount > 1) {
        responseMessage += `\n${playerCount} participants have joined.`;
    }

    sock.sendMessage(chatId, { text: responseMessage, mentions: [sender] });
}




// Function to assign roles and notify players
async function assignRoles(chatId, sock) {
    if (!games[chatId]) {
        console.log(`❌ DEBUG: Game does not exist when trying to assign roles in "${chatId}".`);
        return sock.sendMessage(chatId, { text: "No active game! Type /startgame to begin." });
    }

    const game = games[chatId];

    console.log(`🎭 DEBUG: Assigning roles in "${chatId}". Players:`, game.players);

    if (game.players.length < 3) {
        return sock.sendMessage(chatId, { text: "Not enough players to start! Minimum 3 required." });
    }

    const assignedRoles = assignRandomRoles(game.players);
    game.roles = assignedRoles;
    game.rolesAssigned = true;
    game.status = "ongoing";

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
}

// Helper function to shuffle and assign roles
function assignRandomRoles(players) {
    const roleKeys = Object.keys(roles);
    shuffleArray(roleKeys);
    
    let assignedRoles = {};
    players.forEach((player, index) => {
        const roleKey = roleKeys[index % roleKeys.length];

        // Debugging: Log role assignment
        console.log(`Assigning role: ${roleKey}`, roles[roleKey]);

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
