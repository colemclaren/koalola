const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class Perma extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'perma',
			group: 'staff',
			memberName: 'perma',
			description: 'Assign a perma ban on the TTT servers.',
			args: [{
				key: 'user',
				label: 'Name/SteamID',
				prompt: 'WHO\'S STEAMID SHALL FEEL THE WRATH OF A BAN HAMMER??',
				max: 32,
				type: 'string',
				parse: str => {
					return helper.parsePlayer(str);
				}
			},
				{
					key: 'reason',
					label: 'Reason',
					prompt: 'And if the cops show up, what\'s the reason for this perma ban?',
					type: 'string'
				}],
			weightPermissions: 50,
			examples: [
				/* Command Emoji */ ':skull_crossbones:',
				/* Command Image */ ''
			]
		});
	}

	async hasPermission(msg) {
		return await helper.canRunCommand(msg, 'perma');
	}

	async run(msg, args) {
		let currentBan = await this.client.easyQuery('SELECT id FROM player_bans WHERE steam_id = ? AND (length = 0 OR time + length > UNIX_TIMESTAMP())', args.user);
		if(helper.rankWeight[(msg.member.highestRole.name || '@everyone')] <= 50 && currentBan[0])
			return msg.basicEmbed('Administrator access is required to update a ban', true);

		await helper.checkTargetAndRunCommand(args.user, this.client, [
			await this.client.getSteamID(msg.author.id),
			[helper.discordRank(msg.member.highestRole.name)], //will have the users rank added to for further processing
			msg.member.displayName,
			'perma',
			'', //will become the server
			JSON.stringify(Object.values(args)),
			'NULL' //this will get assigned the users steamid once processed
		], msg);
	}
};