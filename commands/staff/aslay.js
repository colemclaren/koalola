const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class aslay extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'aslay',
			group: 'staff',
			aliases: ['aslayid'],
			memberName: 'aslay',
			description: 'Slay a player on the TTT servers.',
			args: [
				{
					key: 'user',
					label: 'Name/SteamID',
					prompt: 'SteamID or Name of the naughty fellow?',
					max: 32,
					type: 'string',
					parse: str => {
						return helper.parsePlayer(str);
					}
				},
				{
					key: 'rounds',
					label: 'Rounds',
					prompt: 'What\'s the number of rounds to slay for?',
					type: 'integer'
				},
				{
					key: 'reason',
					label: 'Reason',
					prompt: 'Finally, what\'s the slay reason?',
					type: 'string'
				}],
			weightPermissions: 40,
			examples: [
				/* Command Emoji */ ':cop:',
				/* Command Image */ ''
			]
		});
	}

	async hasPermission(msg) {
		return await helper.canRunCommand(msg, 'aslayid');
	}

	async run(msg, args) {
		await helper.checkTargetAndRunCommand(args.user, this.client, [
			await this.client.getSteamID(msg.author.id),
			[helper.discordRank(msg.member.highestRole.name)], //will have the users rank added to for further processing
			msg.member.displayName,
			'aslayid',
			'', //will become the server
			JSON.stringify(Object.values(args)),
			'NULL' //this will get assigned the users steamid once processed
		], msg);
	}
};