let helper = require('../classes/CommandHelper');
helper = new helper();

module.exports = {
	handle: async function (body, res, client) {
		if(!body.id) return res.sendStatus(500);
		const member      = client.guilds.get('256324969842081793').members.get(body.id);
		const member_corp = client.guilds.get('474464006548094976').members.get(body.id);
		const groups      = helper.forumGroup;

		if(/^[a-zA-Z0-9!@#$%^&*()_+=[:"\]|,<>.?\s]*$/g.test(member.username) == false)
			return member.user.send('Please remove the unusual characters from your username before verifying.');

		let groupID = await client.easyQuery('SELECT member_group_id FROM core_members WHERE discord_id = ?', member.id);
		if(groupID[0]) {
			if(groups.hasOwnProperty(groupID[0].member_group_id)) { // Will validate that the forum group is in the groups object instantiated above
				const group     = groups[groupID[0].member_group_id];
				const role      = client.guilds.get('256324969842081793').roles.find('name', group);
				const role_corp = client.guilds.get('474464006548094976').roles.find('name', group);
				let staffRole = (group === 'Trial Staff' || group === 'Moderator' || group === 'Administrator' || group === 'Senior Administrator');

				if (member && member.id) {
					await member.removeRoles(helper.mainStaffIDs.filter(function(val, idx, arr){return role.id != val;}))
						.then(async function() {member.addRole(role).then(async function() {
							if (staffRole)
								member.addRole(client.guilds.get('256324969842081793').roles.find('name', 'Staff'));
						})
					});
				}

				if (member_corp && member_corp.id) {
					await member_corp.removeRoles(helper.corpStaffIDs.filter(function(val, idx, arr){return role_corp.id != val;}))
						.then(async function() {member_corp.addRole(role_corp).then(async function() {
							if (staffRole && !(member_corp.roles.some(r => helper.corpTimeZones.includes(r.id))))
								member_corp.addRole(helper.corpReqTimeZone);
						})
					});
				}
			}
			else member.user.send('I can\'t verify your role, please ask management.');
		}

		return res.sendStatus(200);
	}
};