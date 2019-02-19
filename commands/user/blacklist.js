const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class Blacklist extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'blacklist',
			group: 'user',
			memberName: 'blacklist',
			guildOnly: true,
			description: 'Blacklist a user from using the bot.',
			args: [{
				key: 'member',
				label: '@User',
				prompt: 'Mention the user in this Discord that I shall completely ignore.',
				type: 'member',
				default: ''
			}],
			weightPermissions: 80,
			examples: [
				/* Command Emoji */ ':see_no_evil:',
				/* Command Image */ ''
			]
		});
	}

	async hasPermission(msg) {
		return await helper.canRunCommand(msg, 'setgroup');
	}

	run(msg, args) {
		if(args.member && args.member.id == msg.author.id) return msg.basicEmbed('You can\'t blacklist yourself', true);

		let blacklist = this.client.provider.get('global', 'blacklist', []);

		if(!args.member) {
			let desc = '';

			for (let i = 0; i < blacklist.length; i++) {
				let user = this.client.users.get(blacklist[i]);
				desc += `${i + 1} - ${user.toString()}\n`;
			}

			return msg.channel.send({
				embed: {
					title: 'Blacklisted Users',
					color: 3447003,
					description: desc || ':tada: No users are blacklisted.'
				}
			});
		}

		if(blacklist.includes(args.member.id)) {
			this.client.provider.set('global', 'blacklist', blacklist.filter(i => i != args.member.id));

			return msg.basicEmbed(`:raising_hand: Hey ${args.member.toString()}!! How are you?`)
		}

		blacklist.push(args.member.id);
		this.client.provider.set('global', 'blacklist', blacklist);
		msg.basicEmbed(`Who's ${args.member.toString()}? I've never heard of them before. :thinking::thinking::thinking:`)

	}
};