import roles from "./wg-roles.js";
import { getGame, updateGameState } from "./wg-gameState.js";

// Handles night actions for all roles
async function processNightActions(chatId, sender, args, sock, m) {
    const game = getGame(chatId);
    if (!game) return sock.sendMessage(chatId, { text: "No active game found!" });

    const results = [];
    const protectedPlayers = new Set();
    const killedPlayers = new Set();
    const convertedPlayers = new Set();
    const dousedPlayers = new Set();

    // Process Guardian Angel protection first
    for (const player of game.players) {
        if (game.actions[player]?.action === "protect") {
            protectedPlayers.add(game.actions[player].target);
            results.push(`🛡️ @${game.actions[player].target.split('@')[0]} was protected by the Guardian Angel!`);
        }
    }

    // Process Werewolf kills
    for (const player of game.players) {
        if (game.actions[player]?.action === "kill") {
            const target = game.actions[player].target;
            if (!protectedPlayers.has(target)) {
                killedPlayers.add(target);
                results.push(`💀 @${target.split('@')[0]} was killed by the Werewolves!`);
            } else {
                results.push(`❌ @${target.split('@')[0]} was attacked but survived!`);
            }
        }
    }

    // Process Seer's ability
    for (const player of game.players) {
        if (game.actions[player]?.action === "revealRole") {
            const target = game.actions[player].target;
            const role = roles[game.roles[target]?.name] || { name: "Unknown" }; // Use roles from wg-roles.js
            await sock.sendMessage(player, { text: `🔮 You had a vision! @${target.split('@')[0]}'s role is *${role.name}*.` });
        }
    }

    // Process Alpha Wolf conversion
    for (const player of game.players) {
        if (game.actions[player]?.action === "convert") {
            const target = game.actions[player].target;
            if (game.roles[target].team !== "werewolf") {
                game.roles[target].team = "werewolf";
                convertedPlayers.add(target);
                results.push(`🐺 @${target.split('@')[0]} has been converted into a Werewolf!`);
            }
        }
    }

    // Process Arsonist dousing
    for (const player of game.players) {
        if (game.actions[player]?.action === "douse") {
            dousedPlayers.add(game.actions[player].target);
            results.push(`⛽ @${game.actions[player].target.split('@')[0]} has been doused in gasoline!`);
        }
    }

    // Process Arsonist ignition
    for (const player of game.players) {
        if (game.actions[player]?.action === "ignite") {
            for (const doused of dousedPlayers) {
                killedPlayers.add(doused);
                results.push(`🔥 @${doused.split('@')[0]} was burned alive by the Arsonist!`);
            }
            dousedPlayers.clear();
        }
    }

    // Process Hunter's revenge kill
    for (const killed of killedPlayers) {
        const role = roles[game.roles[killed]?.name] || {}; // Use roles from wg-roles.js
        if (role.name === "Hunter") {
            const revengeTarget = game.actions[killed]?.target;
            if (revengeTarget) {
                killedPlayers.add(revengeTarget);
                results.push(`🎯 @${revengeTarget.split('@')[0]} was shot by the Hunter before dying!`);
            }
        }
    }

    // Notify killed players via DM
    for (const killed of killedPlayers) {
        await sock.sendMessage(killed, { text: "💀 You have been eliminated! You can no longer participate in discussions, but you may watch the game." });
    }

    // Update game state
    for (const killed of killedPlayers) {
        game.players = game.players.filter(p => p !== killed);
    }
    updateGameState(chatId, game);
    
    // Announce night results
    sock.sendMessage(chatId, { text: results.length ? results.join('\n') : "🌙 The night was peaceful..." });
}

export { processNightActions };