const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class Ban extends commando.Command {
    constructor(client) {
        super(client, {
            name: 'votekickban',
            group: 'staff',
            memberName: 'votekickban',
            description: 'Remove a player\'s access to votekick on the TTT servers.',
            args: [
                {
                    key: 'user',
                    label: 'Name/SteamID',
                    prompt: 'SteamID or Name of the player to remove votekick access?',
                    max: 32,
                    type: 'string',
                    parse: str => {
                        return helper.parsePlayer(str);
                    }
                },
                {
                    key: 'reason',
                    label: 'Reason',
                    prompt: 'And what\'s the votekick ban reason?',
                    type: 'string'
                }],
            weightPermissions: 80,
            examples: [
                /* Command Emoji */ ':cop:',
                /* Command Image */ ''
            ]
        });
    }

    async hasPermission(msg) {
        return await helper.canRunCommand(msg, 'votekickban');
    }

    async run(msg, args) {
        if(!args.user || !args.reason) return;

        const rank = helper.discordRank(msg.member.highestRole.name);
        await helper.checkTargetAndRunCommand(args.user, this.client, [
            await this.client.getSteamID(msg.author.id),
            [rank], //will have the users rank added to for further processing
            msg.member.displayName,
            'votekickban',
            '', //will become the server
            JSON.stringify(Object.values(args)),
            'NULL' //this will get assigned the users steamid once processed
        ], msg);
    }
};