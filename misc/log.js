const { RichEmbed } = require('discord.js');

module.exports = {
	//the channel passed in this function is where the output goes to
	getTickets: function (db, channel) {
		db.query("SELECT * FROM moat_comps WHERE approved = '0'", function (err, res) {
			if (err) return console.log(err);

			for (let i = 0; i < res.length; i++) {
				module.exports.printTicket(res[i], db, channel)
			}
		});
	},

	printTicket: function (res, db, channel) {
		const embed = new RichEmbed()
			.setTitle(`Compensation ID: ${res.ID}`)
			.setURL(res.link)
			.setColor('3399FF')
			.setDescription(res.steamid)
			.setTimestamp(new Date(res.time * 1000))
			.setThumbnail("https://cdn.moat.gg/f/579e883ca47f898ce530b7e49c29921e.jpg")
			.setFooter(res.admin, "https://cdn.moat.gg/f/579e883ca47f898ce530b7e49c29921e.jpg");

		if (res.ic) embed.addField("Inventory Credits", res.ic, true);
		if (res.ec) embed.addField("Event Credits", res.ec, true);
		if (res.item) embed.addField("Item", res.item, true);
		if (res.class) embed.addField("Class", res.class, true);
		if (res.talent1) embed.addField("Talent #1", res.talent1, true);
		if (res.talent2) embed.addField("Talent #2", res.talent2, true);
		if (res.talent3) embed.addField("Talent #3", res.talent3, true);
		if (res.talent4) embed.addField("Talent #4", res.talent4, true);
		if (res.comment) embed.addField("Additional Comments", res.comment);

		channel.send({ embed });

		db.query("UPDATE moat_comps SET approved = '1' WHERE ID = ?", [res.ID], function (err) {
			if (err) return console.error(err);
		});
	}
};