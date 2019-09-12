const fs = require('fs');
const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class Talk extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'talk',
			group: 'user',
			memberName: 'talk',
			guildOnly: true,
			description: 'Toggle lola\'s attention when you say lola.',
			args: [{
				key: 'member',
				label: '@User',
				prompt: 'Mention the user member in this Discord that I shall completely ignore, pretty pls w a cherry on top 🌸🍒',
				type: 'member',
				default: ''
			}],
			weightPermissions: 0,
			examples: [
				/* Command Emoji */ ':see_no_evil:',
				/* Command Image */ ''
			]
		});
	}

	async hasPermission(msg) {
		return await helper.canRunCommand(msg, 'MEMBER_VERIFIED');
	}

	run(msg, args) {
		msg.channel.startTyping();

		let quotes = fs.readFileSync('/var/www/lola/root-stopwords.txt').toString().split("\n");
		let rng = Math.floor(Math.random() * quotes.length);

		setTimeout(function() {
			msg.delete();

			msg.channel.send(quotes[rng]);

			setTimeout(function() {
				msg.channel.stopTyping(true);
			}, 1000, 'die');
		}, Math.random() * 15000, 'walk');
	}
};