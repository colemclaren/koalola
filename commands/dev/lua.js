const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class lua extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'lua',
			group: 'dev',
			memberName: 'lua',
			description: 'Send Lua code into outer space.',
			ownerOnly: true,
			args: [{
				key: 'lua',
				label: 'Lua String',
				prompt: 'Your next words will be processed as Lua.',
				type: 'string',
			}],
			weightPermissions: 100,
			examples: [
				/* Command Emoji */ ':nerd:',
				/* Command Image */ ''
			]
		});
	}

	async hasPermission(msg) {
		return await helper.canRunCommand(msg, 'lua');
	}

	async run(msg, args) {
		let info = await msg.chooseServer(),
			response = info[0];

		if(info === null) return msg.basicEmbed('Please try again with the correct server id.', true);

		await helper.runCommand(this.client, [
			await this.client.getSteamID(msg.author.id),
			[helper.discordRank(msg.member.highestRole.name)],
			msg.member.displayName,
			'lua',
			response.first().content == '*' ? '*' : (await this.client.easyQuery('SELECT CONCAT(ip, \':\', port) as ip FROM player_servers WHERE custom_ip = ?', info[1][response.first().content - 1].sv))[0].ip,
			args ? JSON.stringify(Object.values(args)) : 'NULL',
			'NULL'
		], msg);
	}
};