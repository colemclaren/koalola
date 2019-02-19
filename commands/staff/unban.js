const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class Unban extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'unban',
			group: 'staff',
			memberName: 'unban',
			description: 'Unban a player from the TTT servers.',
			args: [{
				key: 'user',
				label: 'Name/SteamID',
				prompt: 'What\'s the Player\'s SteamID to unban?',
				max: 32,
				type: 'string',
				// nothing else has validation atm, so added to to-do
				/*
				validate: str => {
					return (str.match(/^STEAM_[0-5]:[01]:\d+$/) || str.match(/^[0-9]{17}$/))
				},
				*/
				parse: str => {
					return helper.parsePlayer(str);
				}
			},
				{
					key: 'reason',
					label: 'Reason',
					prompt: 'What\'s the reason for unbanning?',
					type: 'string'
				}],
			weightPermissions: 70,
			examples: [
				/* Command Emoji */ ':balloon:',
				/* Command Image */ ''
			]
		});
	}

	async hasPermission(msg) {
		return await helper.canRunCommand(msg, 'unban');
	}

	async run(msg, args) {
		/*const user = await this.client.easyQuery('SELECT name FROM player_bans WHERE steam_id = ? AND unban_reason IS NULL AND (UNIX_TIMESTAMP() - time > length OR length = 0) LIMIT 1', args.user);

		if(!user[0] || !user[0].name) return msg.basicEmbed('That user is not currently banned or was not found, try using their SteamID.', true);

		await this.client.easyQuery('UPDATE player_bans SET unban_reason = ? WHERE steam_id = ? ORDER BY time DESC LIMIT 1', [args.reason, args.user]);

		msg.basicEmbed(`Okay, unbanned **${user[0].name}** for ` + '``' + args.reason + '``.')*/

		await helper.checkTargetAndRunCommand(args.user, this.client, [
			await this.client.getSteamID(msg.author.id),
			[helper.discordRank(msg.member.highestRole.name)], //will have the users rank added to for further processing
			msg.member.displayName,
			'unban',
			'', //will become the server
			JSON.stringify(Object.values(args)),
			'NULL' //this will get assigned the users steamid once processed
		], msg);
	}
};