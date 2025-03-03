import { makeInMemoryStore } from "@whiskeysockets/baileys";
import fs from "fs";

const store = makeInMemoryStore({});
const FILE_PATH = "./data/baileys_store.json";

// Load stored data when the bot starts
if (fs.existsSync(FILE_PATH)) {
    store.readFromFile(FILE_PATH);
}

// Save data every 10 seconds
setInterval(() => {
    store.writeToFile(FILE_PATH);
}, 10000);

// Function to get active game state
function getGame(chatId) {
    return store.games?.[chatId] || null;
}

// Function to update game state
function updateGameState(chatId, gameData) {
    if (!store.games) store.games = {};
    store.games[chatId] = gameData;
}

// Function to remove a game when it ends
function removeGame(chatId) {
    if (store.games) {
        delete store.games[chatId];
    }
}

export { getGame, updateGameState, removeGame };