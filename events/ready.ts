import { Client } from "discord.js";
import { manager } from "..";

const ready = async (client: Client) => {
    if (!client.user) return;
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Generating docs...');
    // generateDocs(creator.commands);

    await manager.init(client.user);
    console.log('Manager init success');
}

export default ready;