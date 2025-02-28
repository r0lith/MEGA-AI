const roles = {
    "villager": {
        name: "Villager",
        team: "village",
        description: "A simple villager with no special abilities.",
        abilities: []
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
        description: "Has a 20% chance to convert their victim into a werewolf instead of killing them.",
        abilities: ["convert"]
    },
    "guardian_angel": {
        name: "Guardian Angel",
        team: "village",
        description: "Can protect one player per night from being killed.",
        abilities: ["protect"]
    },
    "cursed": {
        name: "Cursed",
        team: "village",
        description: "Appears as a normal villager but turns into a werewolf if bitten.",
        abilities: []
    },
    "hunter": {
        name: "Hunter",
        team: "village",
        description: "If killed, the hunter gets a final shot at a target before dying.",
        abilities: ["revengeKill"]
    },
    "fool": {
        name: "Fool",
        team: "neutral",
        description: "Believes they are the Seer but always gets incorrect information.",
        abilities: ["fakeReveal"]
    },
    "traitor": {
        name: "Traitor",
        team: "werewolf",
        description: "Secretly helps the werewolves but appears as a villager to the Seer.",
        abilities: []
    },
    "tanner": {
        name: "Tanner",
        team: "neutral",
        description: "Wants to be lynched. If lynched, they win and everyone else loses.",
        abilities: []
    },
    "cupid": {
        name: "Cupid",
        team: "neutral",
        description: "Chooses two players at the start of the game to be lovers. If one dies, the other dies too.",
        abilities: ["pairLovers"]
    },
    "wild_child": {
        name: "Wild Child",
        team: "village",
        description: "Chooses a role model. If the role model dies, they become a werewolf.",
        abilities: ["chooseRoleModel"]
    },
    "arsonist": {
        name: "Arsonist",
        team: "neutral",
        description: "Each night, they can douse a player’s house with kerosene. Later, they can ignite all doused houses.",
        abilities: ["douse", "ignite"]
    },
    "serial_killer": {
        name: "Serial Killer",
        team: "neutral",
        description: "A lone killer who eliminates one player per night and wins by being the last one alive.",
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
        abilities: []
    },
    "oracle": {
        name: "Oracle",
        team: "village",
        description: "Every morning, the oracle is told one role that is NOT in the game.",
        abilities: ["revealMissingRole"]
    },
    "mason": {
        name: "Mason",
        team: "village",
        description: "Knows who the other masons are.",
        abilities: ["seeMasons"]
    },
    "drunk": {
        name: "Drunk",
        team: "village",
        description: "If the wolves attack the Drunk, they will be too drunk to kill the next night.",
        abilities: []
    },
    "lycan": {
        name: "Lycan",
        team: "village",
        description: "A villager who appears as a werewolf to the Seer.",
        abilities: []
    },
    "thief": {
        name: "Thief",
        team: "neutral",
        description: "Can steal a player’s role on the first night, turning the victim into a normal villager.",
        abilities: ["stealRole"]
    },
    "traitor": {
        name: "Traitor",
        team: "werewolf",
        description: "If all werewolves die, the traitor turns into a werewolf.",
        abilities: []
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
        description: "If lynched, their identity is revealed, and they survive once.",
        abilities: ["surviveLynch"]
    },
    "mayor": {
        name: "Mayor",
        team: "village",
        description: "If revealed, their vote counts as two during lynching.",
        abilities: ["doubleVote"]
    }
};

export default roles; // ES module export
