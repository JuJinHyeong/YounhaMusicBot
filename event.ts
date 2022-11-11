import { Player } from 'discord-player';
import { Client } from 'discord.js';
import voiceStateUpdate from './events/voiceStateUpdate';
import ready from './events/ready';
import { manager } from '.';

export const registerPlayerEvents = (player: Player) => {
    player.on('error', (queue, error) => {
        console.log(`[${queue.guild.name}] Error emitted from the queue: ${error.message}`);
    })

    player.on('trackStart', (queue, track) => {
        manager.showLyrics(queue.guild, track);
    })

    player.on('trackEnd', (queue, track) => {
        manager.addTrack(queue);
    })

    player.on('queueEnd', async (queue) => {
        await manager.removeLyrics(queue.guild);
    })
}

export const registerClientEvents = (client: Client) => {
    client.on('ready', ready);
    client.on('voiceStateUpdate', voiceStateUpdate);
}