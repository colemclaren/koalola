var client;

module.exports = {
	// for shorter code in bot.js
	init: function(lola) {
		client = lola;
	},

	// returns member count for guild object
	memberCount: function(g) {
		if (!g) return;
		g.fetchMembers();
	
		let online = g.members.filter(m => m.presence.status == "online").size,
			idle = g.members.filter(m => m.presence.status == "idle").size,
			dnd = g.members.filter(m => m.presence.status == "dnd").size,
			total = g.memberCount
	
		return [total, online, dnd, idle];
	},

	// updates server api in mysql
	updateServers: function (gid) {
		if (!gid) return;

		let g = client.guilds.get(gid),
			m = module.exports.memberCount(g);
		
		if (!g || !m) return;

		client.db.query(
			'UPDATE discord.info SET members_total = ?, members_online = ?,  members_dnd = ?, members_away = ?, server_name = ?, server_icon = ? WHERE server_id = ?;', 
			[m[0], m[1], m[2], m[3], g.name, g.iconURL, gid], 
			function (err) {if(err) return console.error(err)}
		);
	}
}