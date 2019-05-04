const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class SetGroup extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'setgroup',
			group: 'staff',
			memberName: 'setgroup',
			description: 'Set the group of a player on the TTT servers.',
			args: [{
				key: 'user',
				label: 'Name/SteamID',
				prompt: 'What\'s the Player\'s SteamID?',
				max: 32,
				type: 'string',
				parse: str => {
					return helper.parsePlayer(str);
				}
			},{
				key: 'rank',
				label: 'Rank',
				prompt: 'Which group are you setting them to?\n```\ncommunitylead\nheadadmin\nsenioradmin\nadmin\nmoderator\ntrialstaff\ncredibleclub\nvip\nuser```',
				type: 'string'
			}],
			weightPermissions: 80,
			examples: [
				/* Command Emoji */ ':hatching_chick:',
				/* Command Image */ ''
			]
		});
	}

	async hasPermission(msg) {
		return await helper.canRunCommand(msg, 'setgroup');
	}

	async run(msg, args) {

		await helper.checkTargetAndRunCommand(args.user, this.client, [
			await this.client.getSteamID(msg.author.id),
			[helper.discordRank(msg.member.highestRole.name)], //will have the users rank added to for further processing
			msg.member.displayName,
			'setgroup',
			'', //will become the server
			JSON.stringify(Object.values(args)),
			'NULL' //this will get assigned the users steamid once processed
		], msg);

	}
};