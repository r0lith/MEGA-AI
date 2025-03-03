import { startGame, joinGame, assignRoles } from "./wg-game.js";
import { startVotingPhase, castVote, tallyVotes } from "./wg-voting.js";
import { processNightActions } from "./wg-actions.js";

// Command registry
const commands = {
    "wstart": startGame,
    "wjoin": joinGame,
    "wroles": assignRoles,
    "wvote": castVote,
    "wvotes": tallyVotes,
    "wnight": processNightActions,
};

// Function to handle incoming commands
async function handleCommand(m, sock) {
    const chatId = m.key.remoteJid;
    const sender = m.key.participant || m.key.remoteJid;
    const messageText = m.text.trim();
    
    // Extract command (e.g., "wvote @player")
    const [command, ...args] = messageText.split(" ");
    
    if (commands[command]) {
        try {
            await commands[command](chatId, sender, args, sock, m);
        } catch (error) {
            console.error(`❌ Error executing ${command}:`, error);
            sock.sendMessage(chatId, { text: `⚠️ Error executing command: ${command}` });
        }
    }
}

export { handleCommand };
