const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class map extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'map',
			group: 'staff',
			memberName: 'map',
			description: 'Set the map of a server.',
			args: [
				{
					key: 'map',
					label: 'Map',
					prompt: 'Whats the map name?',
					max: 32,
					type: 'string'
				}],
			weightPermissions: 70,
			examples: [
				/* Command Emoji */ ':cop:',
				/* Command Image */ ''
			]
		});
	}

	async hasPermission(msg) {
		return await helper.canRunCommand(msg, 'map');
	}

	async run(msg, args) {
		let info = await msg.chooseServer(),
		response = info[0];

		if(info === null) return msg.basicEmbed('Please try again with the correct server id.', true);

		await helper.runCommand(this.client, [
			await this.client.getSteamID(msg.author.id),
			[helper.discordRank(msg.member.highestRole.name)],
			msg.member.displayName,
			'map',
			response.first().content == '*' ? '*' : (await this.client.easyQuery('SELECT CONCAT(ip, \':\', port) as ip FROM player_servers WHERE custom_ip = ?', info[1][response.first().content - 1].sv))[0].ip,
			args ? JSON.stringify(Object.values(args)) : 'NULL',
			'NULL'
		], msg);
	}
};