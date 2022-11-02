import dotenv from 'dotenv';
import path from 'path';
import { Client, GatewayDispatchEvents } from 'discord.js';
import { Player } from 'discord-player';
import { GatewayServer, SlashCreator } from 'slash-create';

import { registerClientEvents, registerPlayerEvents } from './event';
import YounhaPlayerManager from './utils/younhaPlayerManager';

dotenv.config();

export const client = new Client({
    intents: [
        'Guilds',
        'GuildVoiceStates',
        'GuildMessages'
    ]
});

export const manager = new YounhaPlayerManager(new Player(client));

export const creator = new SlashCreator({
    applicationID: process.env.DISCORD_CLIENT_ID || '',
    publicKey: process.env.DISCORD_CLIENT_PUBKEY || '',
    token: process.env.DISCORD_CLIENT_TOKEN || '',
    client
});

creator
    .withServer(
        new GatewayServer(
            (handler) => client.ws.on(GatewayDispatchEvents.InteractionCreate, handler)
        )
    )
    .registerCommandsIn(path.join(__dirname, 'commands'), ['.ts'])
    .syncCommands();

registerClientEvents(client);
registerPlayerEvents(manager.player);

client.login(process.env.DISCORD_CLIENT_TOKEN);
