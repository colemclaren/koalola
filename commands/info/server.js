const commando = require('discord.js-commando');
const fetch = require('node-fetch');

module.exports = class ServerInfoCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'server',
			aliases: ['servers'],
			group: 'info',
			memberName: 'server',
			description: 'View a live roster of our hot TTT servers.',
			guildOnly: true,
			weightPermissions: 0,
			examples: [
				/* Command Emoji */ ':dart:',
				/* Command Image */ ''
			]
		});
	}

	async run(msg) {
		const servers = await fetch('https://moat.gg/api/servers/current');
		const serverData = await servers.json();

		const serverNames = await this.client.easyQuery('SELECT custom_ip, name FROM player_servers');

		let names = [];
		for (let server of serverNames) names[server['custom_ip']] = server['name'];

		let ret = '';
		let total = 0;

		delete serverData.servers.discord;
		for (let server in serverData.servers) {
			const info = serverData.servers[server];

			if (info.online) {
				ret += `:green_apple: ${names[server]} - ${info.players}/${info.maxPlayers} on ${info.map}`
				total += info.players
			} else {
				ret += `:tomato: **${names[server]}** is offline`
			}
			ret += '\n';
		}

		msg.channel.send({
			embed: {
				title: `Moat Gaming TTT Servers - ${total} Players Online`,
				description: ret,
				color: 3447003
			}
		});
	}
};