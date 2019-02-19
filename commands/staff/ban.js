const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class Ban extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'ban',
			group: 'staff',
			memberName: 'ban',
			description: 'Assign a player ban on the TTT servers.',
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
					key: 'length',
					label: 'Length',
					prompt: 'Enter the __number__ before the time unit for ban length. (time unit is next)',
					type: 'integer',
					parse: int => {
						return int.toString();
					}
				}, {
					key: 'unit',
					label: 'TimeUnit',
					prompt: 'Now the __time unit__ for the number you just entered. (ban reason is next) \n```\nseconds, minutes, hours, days, weeks, etc\n```',
					type: 'string',
					validate: str => {
						return helper.validateUnit(str);
					},
					parse: str => {
						return helper.parseUnit(str);
					}
				},
				{
					key: 'reason',
					label: 'Reason',
					prompt: 'Finally, what\'s the ban reason?',
					type: 'string'
				}],
			weightPermissions: 50,
			examples: [
				/* Command Emoji */ ':cop:',
				/* Command Image */ ''
			]
		});
	}

	async hasPermission(msg) {
		return await helper.canRunCommand(msg, 'ban');
	}

	async run(msg, args) {
		if(!args.user || !args.length || !args.unit || !args.reason) return;

		const rank = helper.discordRank(msg.member.highestRole.name);
		const length = args.length * (helper.length[args.unit + 's'] || helper.length[args.unit]);
		if(args.length > 1) args.unit = args.unit + 's';

		if (rank == 'trialstaff' && (args.length == 0 || length > 604800))
			return msg.basicEmbed('Trial staff can only ban a maximum of a week', true);

		let currentBan = await this.client.easyQuery('SELECT id FROM player_bans WHERE steam_id = ? AND (length = 0 OR time + length > UNIX_TIMESTAMP())', args.user);
		if(helper.rankWeight[(msg.member.highestRole.name || '@everyone')] <= 50 && currentBan[0])
			return msg.basicEmbed('Administrator access is required to update a ban', true);

		await helper.checkTargetAndRunCommand(args.user, this.client, [
			await this.client.getSteamID(msg.author.id),
			[rank], //will have the users rank added to for further processing
			msg.member.displayName,
			'ban',
			'', //will become the server
			JSON.stringify(Object.values(args)),
			'NULL' //this will get assigned the users steamid once processed
		], msg);
	}
};