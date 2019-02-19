const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class BetaCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'beta',
			group: 'user',
			memberName: 'beta',
			description: 'Get the beta tester role..',
			guildOnly: true,
			weightPermissions: 0,
			examples: [
				/* Command Emoji */ ':construction_worker:',
				/* Command Image */ ''
			]
		});
	}

	async hasPermission(msg) {
		return await helper.canRunCommand(msg, 'MEMBER_VERIFIED');
	}

	run(msg) {
		const member = msg.member;
		const role = msg.guild.roles.get('495107327507038218');

		if(member.roles.has(role.id)) {
			member.removeRole(role)
				.then(msg.basicEmbed(':see_no_evil: Removed beta tester role.'))
		}
		else {
			member.addRole(role)
				.then(msg.basicEmbed(':hear_no_evil: Added beta tester role.'))
		}
	}
};