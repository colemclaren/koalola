const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class Verify extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'verify',
			group: 'user',
			memberName: 'verify',
			description: 'Click this link to verify:\n\n👉 <https://moat.gg/verify>\n👉 <https://moat.gg/verify>\n👉 <https://moat.gg/verify>',
			weightPermissions: 0,
			examples: [
				/* Command Emoji */ ':sunglasses:',
				/* Command Image */ ''
			]
		});
	}

	async run(msg) {
		const client = this.client;
		const groups = helper.forumGroup;

		let groupID = await client.easyQuery('SELECT member_group_id FROM core_members WHERE discord_id = ?', msg.author.id);
		if(groupID[0]) {
			if(groups.hasOwnProperty(groupID[0].member_group_id)) { // Will validate that the forum group is in the groups object instantiated above
				const group = groups[groupID[0].member_group_id];
				const role = msg.guild.roles.find('name', group);
				const role_corp = client.guilds.get('474464006548094976').roles.find('name', group);

				let otherRoles = msg.guild.id === '256324969842081793' ? helper.mainStaffIDs : helper.corpStaffIDs;
				let staffRole = (group === 'Trial Staff' || group === 'Moderator' || group === 'Administrator' || group === 'Senior Administrator');

				await msg.member.removeRoles(otherRoles.filter(function (val, idx, arr) {
					return role_corp.id != val;
				}))
					.then(async function () {
						msg.member.addRole(role).then(async function () {
							if(staffRole) {
								if(msg.guild.id === '256324969842081793')
									msg.member.addRole(msg.guild.roles.find('name', 'Staff'));
								else if(msg.guild.id === '474464006548094976' && !(msg.member.roles.some(r => helper.corpTimeZones.includes(r.id))))
									msg.member.addRole(helper.corpReqTimeZone);
							}
							;

							msg.basicEmbed(`I've assigned you the **${group}** role!`);
						})
					});
			}
			else msg.basicEmbed('I can\'t verify your role, please ask management.', true);
		}
		else msg.basicEmbed(this.description);
	}
};