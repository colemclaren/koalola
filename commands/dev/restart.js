const commando = require('discord.js-commando');
const fetch = require('node-fetch');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class Restart extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'restart',
			group: 'dev',
			memberName: 'restart',
			description: 'Restart a TTT server like a boss.',
			weightPermissions: 100,
			examples: [
				/* Command Emoji */ ':recycle:',
				/* Command Image */ ''
			]
		});
	}

	async hasPermission(msg) {
		return await helper.canRunCommand(msg, 'reload');
	}

	async run(msg, args) {
		let info = await msg.chooseServer(),
			response = info[0];

		if(info === null) return msg.basicEmbed('Please try again with the correct server id.', true);

		await helper.runCommand(this.client, [
			await this.client.getSteamID(msg.author.id),
			[helper.discordRank(msg.member.highestRole.name)],
			msg.member.displayName,
			'reload',
			response.first().content == '*' ? '*' : (await this.client.easyQuery('SELECT CONCAT(ip, \':\', port) as ip FROM player_servers WHERE custom_ip = ?', info[1][response.first().content - 1].sv))[0].ip,
			args ? JSON.stringify(Object.values(args)) : 'NULL',
			'NULL'
		], msg);
	}
};