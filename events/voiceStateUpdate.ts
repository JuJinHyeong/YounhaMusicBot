import { VoiceState } from "discord.js";
import { client, manager } from "..";

const voiceStateUpdate = async (oldState: VoiceState, newState: VoiceState) => {
    if (oldState.member?.user.bot) return;
    if (newState.member?.user.bot) return;

    // when user leave...
    if (oldState.channel && !newState.channel) {
        const members = oldState.channel.members;
        const isHere = members.find((member) => member.id === client.user?.id);
        const many = members.filter((member) => !member.user.bot).size;

        if (!isHere) return;
        if (many > 0) return;
        return manager.pause(oldState.guild);
    }

    // when user in...
    if (!oldState.channel && newState.channel) {
        const isMarked = await manager.isMarkedChannel(newState.guild.id, newState.channelId || '');
        if (!isMarked) return;

        const members = newState.channel.members;
        const isHere = members.find((member) => member.id === client.user?.id)

        if (isHere) return
        if (manager.isPlaying(newState.guild)) return;

        await manager.play(newState.guild, newState.channel);
    }

    // when user switch channel...
    if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
        const members = oldState.channel.members
        const isHere = members.find((member) => member.id === client.user?.id)
        const many = members.filter((member) => !member.user.bot).size
        if (many < 1 && isHere) {
            manager.stop(oldState.guild);
        }

        const isMarked = await manager.isMarkedChannel(newState.guild.id, newState.channelId || '');
        if (!isMarked) return;

        const members2 = newState.channel.members;
        const isHere2 = members2.find((member) => member.id === client.user?.id)

        if (isHere2) return
        return await manager.play(newState.guild, newState.channel);
    }
}
export default voiceStateUpdate;