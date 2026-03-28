const { zokou } = require("../framework/zokou");

zokou({
    nomCom: "opengroup",
    categorie: "group",
    reaction: "🔓"
}, async (dest, zk, commandeOptions) => {

    const { repondre, verifGroupe, verifAdmin, verifZokouAdmin } = commandeOptions;

    // group only
    if (!verifGroupe) return repondre("❌ This command is for groups only.");

    // admin only
    if (!verifAdmin) return repondre("❌ Only admins can use this command.");

    // bot must be admin
    if (!verifZokouAdmin) return repondre("❌ I need admin rights.");

    try {
        await zk.groupSettingUpdate(dest, "not_announcement");

        repondre("🔓 Group is now OPEN.\nAll members can send messages.");
    } catch (e) {
        repondre("❌ Failed to open group.");
        console.log(e);
    }
});
