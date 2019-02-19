const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class Ban extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'votekickunban',
            group: 'staff',
            memberName: 'votekickunban',
            description: 'Lift a player\'s ban from using votekick on the TTT servers.',
            args: [
                {
                    key: 'user',
                    label: 'Name/SteamID',
                    prompt: 'SteamID or Name of player to lift the votekick ban from?',
                    max: 32,
                    type: 'string',
                    parse: str => {
                        return helper.parsePlayer(str);
                    }
                }],
            weightPermissions: 80,
            examples: [
                /* Command Emoji */ ':cop:',
                /* Command Image */ ''
            ]
        });
    }

    async hasPermission(msg) {
        return await helper.canRunCommand(msg, 'votekickunban');
    }

    async run(msg, args) {
        if(!args.user || !args.reason) return;

        const rank = helper.discordRank(msg.member.highestRole.name);
        await helper.checkTargetAndRunCommand(args.user, this.client, [
            await this.client.getSteamID(msg.author.id),
            [rank], //will have the users rank added to for further processing
            msg.member.displayName,
            'votekickunban',
            '', //will become the server
            JSON.stringify(Object.values(args)),
            'NULL' //this will get assigned the users steamid once processed
        ], msg);
    }
};