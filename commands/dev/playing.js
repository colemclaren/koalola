const commando = require('discord.js-commando');

module.exports = class Playing extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'playing',
			group: 'dev',
			aliases: ['status'],
			memberName: 'playing',
			description: 'Set the playing status of me.',
			ownerOnly: true,
			args: [{
				key: 'status',
				label: 'Game/Status',
				prompt: 'Say the status now',
				type: 'string'
			}]
		});
	}

	run(msg, args) {
		this.client.user.setActivity(args.status, {
			type: 'PLAYING'
		}).then(
			msg.basicEmbed(`brb, I need to start playing \`${args.status}\``)
		);
	}
};