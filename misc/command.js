module.exports = {
	handle: function (body, res, client) {
		let str = '';
		for (let part of body.msg)
			str += (part == '[object Object]') ? '**' : part;


		client.storedCommands[body.player.ID].message.edit({
			embed: {
				color: 3447003,
				description: str
			}
		});

		delete client.storedCommands[body.player.ID];

		return res.sendStatus(200);
	}
};