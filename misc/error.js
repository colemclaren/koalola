let serverName = '';

module.exports = {
	handle: async function (body, res, client) {
		if(!body.err || !body.ip || !body.errid) return res.sendStatus(500);
		const serverName = await client.easyQuery('SELECT name FROM player_servers WHERE ip = ? LIMIT 1', body.ip);

		let description = `ID: **${body.errid}** `;
		description += `reported by ${body.rlm == 1 ? (body.pl ? `[Client](${body.pl}) ` : 'Client ') : '[Server]'} `;
		description += `on **${serverName[0].name}** - ${body.ip}`;
		description += `\`\`\`[ERROR] ${body.err}\`\`\``;

		client.channels.get('449680380774055937').send({
			embed:
				{
					color: 3447003,
					description: description
				}
		}).then(msg => {
			msg.react('❌');
			client.easyQuery("INSERT INTO lola_error_reports (id, messageid) VALUES (?, ?)", [body.errid, msg.id]);
		});

		return res.sendStatus(200);
	}
};