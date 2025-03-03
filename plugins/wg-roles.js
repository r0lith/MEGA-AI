const roles = {
    "villager": {
        name: "Villager",
        team: "village",
        description: "A simple villager with no special abilities.",
        abilities: ["None"]
    },
    "werewolf": {
        name: "Werewolf",
        team: "werewolf",
        description: "Each night, werewolves vote to eliminate a player.",
        abilities: ["kill"]
    },
    "seer": {
        name: "Seer",
        team: "village",
        description: "Can peek into the future and discover a player's role each night.",
        abilities: ["revealRole"]
    },
    "alpha_wolf": {
        name: "Alpha Wolf",
        team: "werewolf",
        description: "Has a 20% chance to turn their target into a werewolf instead of killing them.",
        abilities: ["convert"]
    },
    "guardian_angel": {
        name: "Guardian Angel",
        team: "village",
        description: "Can shield one player per night from being eliminated.",
        abilities: ["protect"]
    },
    "cursed": {
        name: "Cursed",
        team: "village",
        description: "Appears as a normal villager but turns into a werewolf if bitten.",
        abilities: ["None"]
    },
    "hunter": {
        name: "Hunter",
        team: "village",
        description: "If eliminated, gets one final chance to take down a target.",
        abilities: ["revengeKill"]
    },
    "fool": {
        name: "Fool",
        team: "neutral",
        description: "Believes they are the Seer but always receives incorrect role information.",
        abilities: ["fakeReveal"]
    },
    "traitor": {
        name: "Traitor",
        team: "werewolf",
        description: "If all werewolves are eliminated, the traitor transforms into a werewolf.",
        abilities: ["None"]
    },
    "tanner": {
        name: "Tanner",
        team: "neutral",
        description: "Wants to be lynched. If lynched, they win, and everyone else loses.",
        abilities: ["None"]
    },
    "cupid": {
        name: "Cupid",
        team: "neutral",
        description: "Chooses two players as lovers. If one dies, the other dies too.",
        abilities: ["pairLovers"]
    },
    "wild_child": {
        name: "Wild Child",
        team: "village",
        description: "Chooses a role model. If the role model dies, they turn into a werewolf.",
        abilities: ["chooseRoleModel"]
    },
    "arsonist": {
        name: "Arsonist",
        team: "neutral",
        description: "Can douse players' houses with kerosene each night and ignite them later.",
        abilities: ["douse", "ignite"]
    },
    "serial_killer": {
        name: "Serial Killer",
        team: "neutral",
        description: "A lone killer who eliminates one player per night and wins by being the last survivor.",
        abilities: ["kill"]
    },
    "snow_wolf": {
        name: "Snow Wolf",
        team: "werewolf",
        description: "Can freeze a player, preventing them from acting at night. Cannot freeze the same player twice in a row.",
        abilities: ["freeze"]
    },
    "beholder": {
        name: "Beholder",
        team: "village",
        description: "Knows who the Seer is but has no special abilities.",
        abilities: ["None"]
    },
    "oracle": {
        name: "Oracle",
        team: "village",
        description: "Every morning, learns one role that is NOT in the game.",
        abilities: ["revealMissingRole"]
    },
    "mason": {
        name: "Mason",
        team: "village",
        description: "Knows who the other Masons are.",
        abilities: ["seeMasons"]
    },
    "drunk": {
        name: "Drunk",
        team: "village",
        description: "If attacked by werewolves, they become too intoxicated to kill the next night.",
        abilities: ["None"]
    },
    "lycan": {
        name: "Lycan",
        team: "village",
        description: "A villager who appears as a werewolf to the Seer.",
        abilities: ["None"]
    },
    "thief": {
        name: "Thief",
        team: "neutral",
        description: "Can steal a player's role on the first night, making the victim a normal villager.",
        abilities: ["stealRole"]
    },
    "pacifist": {
        name: "Pacifist",
        team: "village",
        description: "Can convince the village to skip one lynching during the game.",
        abilities: ["skipLynch"]
    },
    "prince": {
        name: "Prince",
        team: "village",
        description: "If lynched, survives once and is revealed to the village.",
        abilities: ["surviveLynch"]
    },
    "mayor": {
        name: "Mayor",
        team: "village",
        description: "Once revealed, their vote counts as two during lynching.",
        abilities: ["doubleVote"]
    }
};

export default roles; // ES module export
