import { Player } from 'discord-player';
import { Client } from 'discord.js';
import voiceStateUpdate from './events/voiceStateUpdate';
import ready from './events/ready';

export const registerPlayerEvents = (player: Player) => {
    player.on('error', (queue, error) => {
        console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
    })
}

export const registerClientEvents = (client: Client) => {
    client.on('ready', ready);
    client.on('voiceStateUpdate', voiceStateUpdate);
}