const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class Wipe extends commando.Command {
	constructor(client) {
        super(client, {
            name: 'wipe',
            group: 'staff',
            memberName: 'wipe',
            description: 'Reset a player\'s inventory on the TTT servers.',
            args: [
                {
                    key: 'user',
                    label: 'Name/SteamID',
                    prompt: 'SteamID or Name of the player to wipe?',
                    max: 32,
                    type: 'string',
                    parse: str => {
                        return helper.parsePlayer(str);
                    }
				}
			],
            weightPermissions: 80,
            examples: [
                /* Command Emoji */ ':skull_crossbones:',
                /* Command Image */ ''
            ]
        });
    }

    async hasPermission(msg) {
        return await helper.canRunCommand(msg, 'wipe');
    }

    async run(msg, args) {
        if(!args.user) return;

        const rank = helper.discordRank(msg.member.highestRole.name);
        await helper.checkTargetAndRunCommand(args.user, this.client, [
            await this.client.getSteamID(msg.author.id),
            [rank], //will have the users rank added to for further processing
            msg.member.displayName,
            'wipe',
            '', //will become the server
            JSON.stringify(Object.values(args)),
            'NULL' //this will get assigned the users steamid once processed
        ], msg);
    }
};