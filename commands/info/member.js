const commando = require('discord.js-commando');

module.exports = class MemberInfoCommand extends commando.Command {
	constructor(client) {
		 super(client,     {
			name       : 'members',
			aliases    : ['member'],
			group      : 'info',
			memberName : 'member',
			description: 'Check up on our live Discord member stats.',
			guildOnly  : true,
			weightPermissions: 0,
			examples: [
				/* Command Emoji */ ':tada:',
				/* Command Image */ ''
			]
		 });
	}

	run(msg) {
		const members = msg.guild.presences;
		const online = members.findAll('status', 'online').length;
		const dnd = members.findAll('status', 'dnd').length;
		const idle = members.findAll('status', 'idle').length;

		msg.basicEmbed(`:tada: There are **${msg.guild.memberCount.toLocaleString()}** members in our discord!
		
:blush: **${online.toLocaleString()}** Online
:no_mouth: **${dnd.toLocaleString()}** DND
:hourglass: **${idle.toLocaleString()}** Idle
:sleeping: **${(msg.guild.memberCount - online - dnd - idle).toLocaleString()}** Offline`);
	}
};