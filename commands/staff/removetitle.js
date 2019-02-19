const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class removetitle extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'removetitle',
			group: 'staff',
			aliases: ['remtitle'],
			memberName: 'removetitle',
			description: 'Remove a title from a player on the TTT servers.',
			args: [
				{
					key: 'user',
					label: 'Name/SteamID',
					prompt: 'SteamID or Name of the user?',
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
		return await helper.canRunCommand(msg, 'removetitle');
	}

	async run(msg, args) {
		await helper.checkTargetAndRunCommand(args.user, this.client, [
			await this.client.getSteamID(msg.author.id),
			[helper.discordRank(msg.member.highestRole.name)], //will have the users rank added to for further processing
			msg.member.displayName,
			'removetitle',
			'', //will become the server
			JSON.stringify(Object.values(args)),
			'NULL' //this will get assigned the users steamid once processed
		], msg);
	}
};