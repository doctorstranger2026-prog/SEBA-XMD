const { zokou } = require("../framework/zokou");

let activeUsers = {}; // store active users per group

// 🔥 AUTO TRACK USERS (runs on every message)
zokou({
    nomCom: ""
}, async (dest, zk, commandeOptions) => {

    const { auteurMessage, verifGroupe } = commandeOptions;

    if (!verifGroupe) return;

    if (!activeUsers[dest]) {
        activeUsers[dest] = new Set();
    }

    activeUsers[dest].add(auteurMessage);
});


// 🔥 TAG ONLINE COMMAND
zokou({
    nomCom: "tagonline",
    categorie: "group",
    reaction: "📢"
}, async (dest, zk, commandeOptions) => {

    const { repondre, verifGroupe } = commandeOptions;

    if (!verifGroupe) return repondre("❌ This command works in groups only.");

    let users = activeUsers[dest];

    if (!users || users.size === 0) {
        return repondre("❌ No active members today.");
    }

    let text = `🔥 *ACTIVE MEMBERS (TODAY)* 🔥\n\n`;

    let mentions = [];

    users.forEach(user => {
        text += `@${user.split("@")[0]}\n`;
        mentions.push(user);
    });

    await zk.sendMessage(dest, {
        text: text,
        mentions: mentions
    });
});
