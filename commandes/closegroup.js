const { zokou } = require("../framework/zokou");

zokou({
    nomCom: "closegroup",
    categorie: "group",
    reaction: "🔒"
}, async (dest, zk, commandeOptions) => {

    const { repondre, verifGroupe, verifAdmin, verifZokouAdmin } = commandeOptions;

    // only group
    if (!verifGroupe) return repondre("❌ This command is for groups only.");

    // only admin
    if (!verifAdmin) return repondre("❌ Only group admins can use this command.");

    // bot must be admin
    if (!verifZokouAdmin) return repondre("❌ I need admin rights to close the group.");

    try {
        // close group (admins only)
        await zk.groupSettingUpdate(dest, "announcement");

        repondre("🔒 *GROUP CLOSED*\nOnly admins can send messages now.");
    } catch (e) {
        console.log(e);
        repondre("❌ Failed to close the group.");
    }
});
