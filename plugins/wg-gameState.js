import { makeInMemoryStore } from "@whiskeysockets/baileys";
import fs from "fs";
import path from "path";

const store = makeInMemoryStore({});
store.games = {}; // Ensure the games property is initialized

const FILE_PATH = "./data/baileys_store.json";
const DIR_PATH = path.dirname(FILE_PATH);

// Ensure the data directory exists
if (!fs.existsSync(DIR_PATH)) {
    fs.mkdirSync(DIR_PATH, { recursive: true });
}

// Load stored data when the bot starts
if (fs.existsSync(FILE_PATH)) {
    store.readFromFile(FILE_PATH);
    // Ensure the games property is initialized after reading from file
    if (!store.games) {
        store.games = {};
    }
}

// Save data every 10 seconds
setInterval(() => {
    store.writeToFile(FILE_PATH);
}, 10000);

// Function to get active game state
function getGame(chatId) {
    console.log(`🔍 DEBUG: Retrieving game state for chatId: ${chatId}`);
    const game = store.games?.[chatId] || null;
    console.log(`🔍 DEBUG: Retrieved game state:`, game);
    return game;
}

// Function to update game state
function updateGameState(chatId, gameData) {
    if (!store.games) store.games = {};
    store.games[chatId] = gameData;
    console.log(`🔄 DEBUG: Updated game state for chatId: ${chatId}`, gameData);
}

// Function to remove a game when it ends
function removeGame(chatId) {
    if (store.games) {
        delete store.games[chatId];
        console.log(`❌ DEBUG: Removed game state for chatId: ${chatId}`);
    }
}

export { getGame, updateGameState, removeGame };