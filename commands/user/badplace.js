const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class Badplace extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'badplace',
			group: 'user',
			memberName: 'badplace',
			guildOnly: true,
			aliases: ['goodplace', 'bad', 'good'],
			description: 'Assign the badplace label for a timeout.',
			args: [{
				key: 'member',
				label: '@User',
				prompt: 'Mention the user in this Discord you\'d like to poke into the bad place.',
				type: 'member',
				default: ''
			}],
			weightPermissions: 50,
			examples: [
				/* Command Emoji */ ':smiling_imp:',
				/* Command Image */ ''
			]
		});
	}

	async hasPermission(msg) {
		return await helper.canRunCommand(msg, 'perma');
	}

	async run(msg, args) {
		let badplace = this.client.provider.get('global', 'badplace', []);

		if(args.member && args.member.id == msg.author.id && !badplace.some(group => group[0] == msg.author.id)) return msg.basicEmbed('You can\'t badplace yourself', true);

		if(!args.member) {
			let desc = '';

			let currentBadplace = badplace.filter(i => this.client.users.get(i[0]) != undefined);
			for (let i = 0; i < currentBadplace.length; i++) {
				let users = this.client.users;
				desc += `${i + 1} - ${users.get(currentBadplace[i][0]).toString() || 'N/A'} by ${users.get(currentBadplace[i][1])}\n`;
			}

			return msg.channel.send({
				embed: {
					title: 'Badplaced Users',
					color: 3447003,
					description: desc || ':tada: No users are badplaced'
				}
			});
		}

		if(!helper.canRunOnUser(msg.member.highestRole.name, args.member.highestRole.name))
			return msg.basicEmbed('You can\'t badplace that user.', true);

		const unban = await helper.canRunCommand(msg, 'unban');
		const role = msg.guild.roles.find('name', 'Bad Place Enthusiast');

		if(badplace.some(group => group[0] == args.member.id)) {
			if(unban === true) { //only admins can unbadplace
				this.client.provider.set('global', 'badplace', badplace.filter(i => i[0] != args.member.id));

				args.member.removeRole(role)
					.then(msg.basicEmbed(`:angel: ${args.member.toString()} has been brought back to the good place.`));
				return;
			} else if(unban !== true) {
				return msg.basicEmbed('Only Senior Administrator+ can rise users to the good place.');
			}
		}

		badplace.push([args.member.id, msg.author.id]);
		this.client.provider.set('global', 'badplace', badplace);
		args.member.addRole(role)
			.then(msg.basicEmbed(`:smiling_imp: ${args.member.toString()} is like really deep down in the bad place, do not worry.`));
	}
};