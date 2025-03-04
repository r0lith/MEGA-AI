import { getGame, updateGameState, removeGame } from "./wg-gameState.js";
import roles from "./wg-roles.js";

const voteCounts = {};
const votedPlayers = {}; // Track players who have voted

async function startVotingPhase(chatId, sender, args, sock, m) {
    const game = getGame(chatId);
    if (!game) return sock.sendMessage(chatId, { text: "No active game found!" });
    
    voteCounts[chatId] = {};
    votedPlayers[chatId] = new Set();
    
    sock.sendMessage(chatId, { text: "☀️ Daytime has begun! You have 2 minutes to discuss before voting begins." });
    
    setTimeout(() => {
        sock.sendMessage(chatId, { text: "🗳️ Voting has started! Type wvote @player to vote." });
        setTimeout(() => tallyVotes(chatId, sock, game.players.length), 120000); // 2-minute voting period
    }, 120000); // 2-minute discussion period
} 

async function castVote(chatId, sender, args, sock, m) {
    const game = getGame(chatId);
    if (!voteCounts[chatId] || !game) {
        console.log(`❌ DEBUG: No voting phase is active or no game found for chatId: ${chatId}`);
        return sock.sendMessage(chatId, { text: "No voting phase is active right now." });
    }
    
    const target = args[0] + "@s.whatsapp.net";
    if (votedPlayers[chatId].has(sender)) {
        console.log(`⚠️ DEBUG: ${sender} has already voted.`);
        return sock.sendMessage(chatId, { text: "⚠️ You have already voted. Wait for the next voting phase." });
    }
    if (!game.players.includes(target)) {
        console.log(`⚠️ DEBUG: Invalid vote. ${target} is not in the game.`);
        return sock.sendMessage(chatId, { text: "⚠️ Invalid vote. The player you are voting for is not in the game." });
    }
    
    voteCounts[chatId][sender] = target;
    votedPlayers[chatId].add(sender);
    console.log(`✅ DEBUG: ${sender} voted for ${target}`);
    sock.sendMessage(chatId, { text: `✅ @${sender.split('@')[0]} voted for @${target.split('@')[0]}.` });
}

async function tallyVotes(chatId, sock, playerCount) {
    if (!voteCounts[chatId]) return;
    
    const votes = Object.values(voteCounts[chatId]);
    const voteResults = votes.reduce((acc, player) => {
        acc[player] = (acc[player] || 0) + 1;
        return acc;
    }, {});

    let minVotesRequired = playerCount < 6 ? 2 : playerCount <= 10 ? 3 : 4;

    if (votes.length < minVotesRequired) {
        sock.sendMessage(chatId, { text: `⚠️ Not enough votes! A minimum of ${minVotesRequired} votes is required.` });
        return;
    }
    
    let mostVoted = Object.entries(voteResults).sort((a, b) => b[1] - a[1]);
    if (mostVoted.length === 0 || (mostVoted.length > 1 && mostVoted[0][1] === mostVoted[1][1])) {
        sock.sendMessage(chatId, { text: "⚖️ The vote is tied. No one was eliminated today." });
        return;
    }

    let eliminated = mostVoted[0][0];
    let game = getGame(chatId);
    let eliminatedRole = roles[game.roles[eliminated]?.name] || { name: "Unknown", team: "neutral" };
    
    if (eliminatedRole.name === "Prince") {
        return sock.sendMessage(chatId, { text: `👑 @${eliminated.split('@')[0]} was lynched but survived! They are the *Prince*!` });
    }
    if (["Tanner", "Jester"].includes(eliminatedRole.name)) {
        sock.sendMessage(chatId, { text: `🤡 @${eliminated.split('@')[0]} has been lynched! They were a *${eliminatedRole.name}* and WIN the game!` });
        removeGame(chatId);
        return;
    }
    if (eliminatedRole.name === "Executioner") {
        const executioner = Object.keys(game.roles).find(p => game.roles[p]?.target === eliminated);
        if (executioner) {
            sock.sendMessage(chatId, { text: `⚔️ The *Executioner* (@${executioner.split('@')[0]}) successfully got their target lynched! They win!` });
            removeGame(chatId);
            return;
        }
    }
    if (eliminatedRole.name === "Traitor" && game.players.filter(p => roles[game.roles[p]?.name]?.team === "werewolf").length === 0) {
        game.roles[eliminated].team = "werewolf";
        return sock.sendMessage(chatId, { text: `🩸 @${eliminated.split('@')[0]} was the *Traitor* and has now transformed into a Werewolf!` });
    }
    if (eliminatedRole.name === "Lover") {
        const partner = game.lovers[eliminated];
        if (partner && game.players.includes(partner)) {
            game.players = game.players.filter(p => p !== partner);
            sock.sendMessage(chatId, { text: `💔 @${partner.split('@')[0]} died of heartbreak after losing their Lover!` });
        }
    }

    game.players = game.players.filter(p => p !== eliminated);
    updateGameState(chatId, game);

    sock.sendMessage(chatId, { text: `🔪 @${eliminated.split('@')[0]} was lynched! They were a *${eliminatedRole.name}* ${eliminatedRole.team === "werewolf" ? "🐺" : "😢"}!` });

    checkWinCondition(chatId, sock, game);
    delete voteCounts[chatId];
}

function checkWinCondition(chatId, sock, game) {
    const werewolves = game.players.filter(p => roles[game.roles[p]?.name]?.team === "werewolf").length;
    const villagers = game.players.filter(p => roles[game.roles[p]?.name]?.team === "village").length;
    const arsonists = game.players.filter(p => roles[game.roles[p]?.name]?.name === "Arsonist").length;
    const dousedPlayers = game.dousedPlayers || [];
    const cultists = game.players.filter(p => roles[game.roles[p]?.name]?.team === "cult").length;

    if (cultists === game.players.length) {
        sock.sendMessage(chatId, { text: "🔮 The Cult Leader has converted everyone! The Cult wins!" });
        removeGame(chatId);
        return;
    }
    if (arsonists > 0 && dousedPlayers.length > 0 && dousedPlayers.every(p => !game.players.includes(p))) {
        sock.sendMessage(chatId, { text: "🔥 The Arsonist has burned the entire town! The Arsonist wins!" });
        removeGame(chatId);
        return;
    }
    if (werewolves >= villagers) {
        sock.sendMessage(chatId, { text: "🐺 The Werewolves have overpowered the village! The Werewolves win!" });
        removeGame(chatId);
    } else if (werewolves === 0) {
        sock.sendMessage(chatId, { text: "🎉 The village has eliminated all the Werewolves! The Villagers win!" });
        removeGame(chatId);
    }
}

// Listener for "wvote @user"
async function handleVoteCommand(m, sock) {
    const chatId = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const messageText = m.text.trim();
    
    const match = messageText.match(/^wvote @(\d+)/);
    if (!match) {
        console.log(`❌ DEBUG: Invalid vote command format: ${messageText}`);
        return;
    }
    
    const target = match[1] + "@s.whatsapp.net";
    console.log(`🟢 DEBUG: Handling vote command from ${sender} for ${target}`);
    await castVote(chatId, sender, [target], sock, m);
}

export { startVotingPhase, castVote, tallyVotes, handleVoteCommand };

// Define the handler object
const handler = {
    all: async function (m) {
        if (/^wvote @\d+$/i.test(m.text)) {
            await handleVoteCommand(m, this);
        }
        return !0;
    }
};