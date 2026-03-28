const { zokou } = require("../framework/zokou");

zokou({
    nomCom: "kickall",
    categorie: "group",
    reaction: "⚠️"
}, async (dest, zk, commandeOptions) => {

    const { 
        repondre, 
        verifGroupe, 
        verifAdmin, 
        verifZokouAdmin, 
        infosGroupe 
    } = commandeOptions;

    // group only
    if (!verifGroupe) return repondre("❌ This command is for groups only.");

    // admin only
    if (!verifAdmin) return repondre("❌ Only group admins can use this command.");

    // bot must be admin
    if (!verifZokouAdmin) return repondre("❌ I need admin rights to do this.");

    let participants = infosGroupe.participants;

    // filter non-admin members
    let membersToRemove = participants
        .filter(p => p.admin === null)
        .map(p => p.id);

    if (membersToRemove.length === 0) {
        return repondre("❌ No members to remove.");
    }

    await repondre(`⚠️ Removing ${membersToRemove.length} members...`);

    // remove in chunks (safe way)
    const chunkSize = 5;

    for (let i = 0; i < membersToRemove.length; i += chunkSize) {
        let chunk = membersToRemove.slice(i, i + chunkSize);

        await zk.groupParticipantsUpdate(dest, chunk, "remove");

        // delay kidogo ili kuepuka block
        await new Promise(res => setTimeout(res, 2000));
    }

    repondre("✅ All non-admin members have been removed.");
});
