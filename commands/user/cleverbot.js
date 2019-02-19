const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class Cleverbot extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'ignore',
			aliases: ['ai'],
			group: 'user',
			memberName: 'cleverbot',
			description: 'Toggle lola\'s attention when you say lola.',
			weightPermissions: 0,
			examples: [
				/* Command Emoji */ ':robot:',
				/* Command Image */ ''
			]
		});
	}

	async hasPermission(msg) {
		return await helper.canRunCommand(msg, 'MEMBER_VERIFIED');
	}

	run(msg, args) {
		const member = msg.member;

		let cleverbot = this.client.provider.get('global', 'cleverbot', []);

		if(cleverbot.includes(member.id)) {
			this.client.provider.set('global', 'cleverbot', cleverbot.filter(i => i != member.id));

			return msg.basicEmbed(`${member.toString()} Goodbye human. Beep. Bop. Boop. :robot:`, true);
		}

		cleverbot.push(member.id);
		this.client.provider.set('global', 'cleverbot', cleverbot);
		msg.basicEmbed(`${member.toString()} Processing Anthropomorphic Memory... :triumph:`);
	}
};