import { getGame, updateGameState, removeGame } from "./wg-gameState.js";
import { startVotingPhase } from "./wg-voting.js";
import { processNightActions } from "./wg-actions.js";

async function nextPhase(chatId, sock) {
    const game = getGame(chatId);
    if (!game) return;

    if (game.phase === "night") {
        sock.sendMessage(chatId, { text: "🌙 The night falls... Players with abilities, take your actions!" });
        setTimeout(() => {
            processNightActions(chatId, null, null, sock, null);
            game.phase = "day";
            updateGameState(chatId, game);
            checkStatusUpdate(chatId, sock);
            nextPhase(chatId, sock);
        }, 20000); // 20-second night phase
    } else if (game.phase === "day") {
        sock.sendMessage(chatId, { text: "☀️ The sun rises... Time to discuss and vote!" });
        setTimeout(() => {
            startVotingPhase(chatId, null, null, sock, null);
            game.phase = "night";
            updateGameState(chatId, game);
        }, 20000); // 20-second discussion phase
    }
}

async function checkStatusUpdate(chatId, sock) {
    const game = getGame(chatId);
    if (!game) return;

    if (game.players.length === 2) {
        sock.sendMessage(chatId, { text: "⚠️ Only 2 players left! The game is nearing its end!" });
    }
}

async function checkAutoWin(chatId, sock) {
    const game = getGame(chatId);
    if (!game) return;

    const werewolves = game.players.filter(p => game.roles[p]?.team === "werewolf").length;
    const villagers = game.players.filter(p => game.roles[p]?.team === "village").length;

    if (werewolves === 0) {
        sock.sendMessage(chatId, { text: "🎉 The village has eliminated all Werewolves! Villagers win!" });
        removeGame(chatId);
    } else if (werewolves >= villagers) {
        sock.sendMessage(chatId, { text: "🐺 The Werewolves outnumber the villagers! Werewolves win!" });
        removeGame(chatId);
    }
}

export { nextPhase, checkStatusUpdate, checkAutoWin };
