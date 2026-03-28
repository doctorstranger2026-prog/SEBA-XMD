const { zokou } = require("../framework/zokou");
const { 
    getWarnCountByJID, 
    ajouterUtilisateurAvecWarnCount, 
    resetWarnCountByJID 
} = require("../bdd/warn");

let antiStatus = {};
let actionType = {};


// 🔥 COMMAND
zokou({
    nomCom: "antistatus",
    categorie: "group",
    reaction: "📵"
}, async (dest, zk, commandeOptions) => {

    const { repondre, arg, verifGroupe, verifAdmin } = commandeOptions;

    if (!verifGroupe) return repondre("❌ Group only");
    if (!verifAdmin) return repondre("❌ Admin only");

    if (!arg[0]) {
        return repondre(`📵 *ANTI STATUS*

.antistatus on
.antistatus off
.antistatus delete
.antistatus warn
.antistatus remove`);
    }

    const option = arg[0].toLowerCase();

    if (option === "on") {
        antiStatus[dest] = true;
        return repondre("✅ Anti-status enabled");
    }

    if (option === "off") {
        antiStatus[dest] = false;
        return repondre("❌ Anti-status disabled");
    }

    if (["delete", "warn", "remove"].includes(option)) {
        actionType[dest] = option;
        return repondre(`⚙️ Action set to: ${option}`);
    }

    repondre("⚠️ Use: on/off/delete/warn/remove");
});


// 🔥 AUTO DETECT (NO INDEX EDIT)
zokou({
    nomCom: ""
}, async (dest, zk, commandeOptions) => {

    const { ms, verifGroupe, auteurMessage } = commandeOptions;

    if (!verifGroupe) return;
    if (!antiStatus[dest]) return;

    let text =
        ms.message?.conversation ||
        ms.message?.extendedTextMessage?.text ||
        "";

    let context =
        ms.message?.extendedTextMessage?.contextInfo ||
        ms.message?.imageMessage?.contextInfo ||
        ms.message?.videoMessage?.contextInfo;

    let isStatus = false;

    // detect status mention
    if (context?.participant?.includes("status@broadcast")) {
        isStatus = true;
    }

    if (text.includes("mentioned this group") || text.includes("status@broadcast")) {
        isStatus = true;
    }

    if (!isStatus) return;

    const sender = auteurMessage;

    // delete message
    await zk.sendMessage(dest, {
        delete: {
            remoteJid: dest,
            fromMe: false,
            id: ms.key.id,
            participant: sender
        }
    });

    const action = actionType[dest] || "delete";

    // ===== DELETE =====
    if (action === "delete") {
        await zk.sendMessage(dest, {
            text: `📵 @${sender.split("@")[0]} status mentions are not allowed!`,
            mentions: [sender]
        });
    }

    // ===== WARN =====
    else if (action === "warn") {

        const warn = await getWarnCountByJID(sender) || 0;

        if (warn >= 3) {
            await zk.groupParticipantsUpdate(dest, [sender], "remove");

            await zk.sendMessage(dest, {
                text: `🚫 @${sender.split("@")[0]} removed (3 warnings)`,
                mentions: [sender]
            });

            await resetWarnCountByJID(sender);
        } else {
            await ajouterUtilisateurAvecWarnCount(sender);

            await zk.sendMessage(dest, {
                text: `⚠️ Warning ${warn + 1}/3\nStop mentioning group in status!`,
                mentions: [sender]
            });
        }
    }

    // ===== REMOVE =====
    else if (action === "remove") {
        await zk.groupParticipantsUpdate(dest, [sender], "remove");

        await zk.sendMessage(dest, {
            text: `🚫 @${sender.split("@")[0]} removed for status mention`,
            mentions: [sender]
        });
    }
});
