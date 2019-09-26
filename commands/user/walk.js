const fs = require('fs');
const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class Walk extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'walk',
			group: 'user',
			memberName: 'walk',
			guildOnly: true,
			description: 'Toggle lola\'s attention when you say lola.',
			args: [{
				key: 'member',
				label: '@User',
				prompt: 'Mention the human being in this Discord that I shall homework with a movie review daddy uwu 🍑🍆',
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

		let quotes = fs.readFileSync('/var/www/lola/root-moviereviews.txt').toString().split("\n");
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