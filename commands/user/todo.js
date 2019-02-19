const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class ToDoCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'todo',
			group: 'user',
			memberName: 'todo',
			description: 'Gain access to the developer to-do list channels.',
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
		const role = msg.guild.roles.find('name', 'Developers To-Do List Access');

		if(member.roles.has(role.id)) {
			member.removeRole(role)
				.then(msg.basicEmbed(':see_no_evil: Removed role to view the developers to-do lists.'))
		}
		else {
			member.addRole(role)
				.then(msg.basicEmbed(':hear_no_evil: Assigned role to view the developers to-do lists.'))
		}
	}
};