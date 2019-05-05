const {RichEmbed} = require('discord.js');
let helper = require('../classes/CommandHelper');
helper = new helper();

module.exports = {
	//the channel passed in this function is where the output goes to
	getTickets: function (client, channel) {
		client.db.query("SELECT * FROM moat_comps WHERE approved = '0'", function (err, res) {
			if(err) return console.log(err);

			for (let i = 0; i < res.length; i++) {
				module.exports.printTicket(res[i], client, channel)
			}
		});
	},

	printTicket: async function (res, client, channel) {
		const avatarStaff = await client.easyQuery('SELECT avatar_url FROM player WHERE steam_id = ?', helper.convertTo64(res.admin.match(/STEAM_[0-5]:[01]:\d+/)[0]));
		const user = await client.easyQuery('SELECT avatar_url, name FROM player WHERE steam_id = ?', helper.convertTo64(res.steamid.replace(/[^\x00-\x7F]/g, '')));

		const embed = new RichEmbed()
			.setTitle(`Compensation ID: ${res.ID}`)
			.setURL(res.link)
			.setColor('3399FF')
			.setDescription(`${helper.randomValue(helper.emojis.gamers) + helper.randomValue(helper.emojis.skins)} ${user[0].name || "Invalid Player"} \`${res.steamid}\``)
			.setTimestamp(new Date(res.time * 1000))
			.setThumbnail(user[0].avatar_url || "https://cdn.moat.gg/f/579e883ca47f898ce530b7e49c29921e.jpg")
			.setFooter(res.admin, avatarStaff[0].avatar_url || "https://cdn.moat.gg/f/579e883ca47f898ce530b7e49c29921e.jpg");

		if(res.ic) embed.addField("Inventory Credits", res.ic, true);
		if(res.ec) embed.addField("Event Credits", res.ec, true);
		if(res.item) embed.addField("Item", res.item, true);
		if(res.class) embed.addField("Class", res.class, true);
		if(res.talent1) embed.addField("Talent #1", res.talent1, true);
		if(res.talent2) embed.addField("Talent #2", res.talent2, true);
		if(res.talent3) embed.addField("Talent #3", res.talent3, true);
		if(res.talent4) embed.addField("Talent #4", res.talent4, true);
		if(res.comment) embed.addField("Additional Comments", res.comment);

		channel.send({embed});

		client.db.query("UPDATE moat_comps SET approved = '1' WHERE ID = ?", [res.ID], function (err) {
			if(err) return console.error(err);
		});
	},
	canHandleTicket: function(msg, client) {
		return msg.channel.id == '474504845416464405' && client.isOwner(msg.author);
	},

	handleTicket: function(msg, client) {
		let split = msg.content.split(" ");
		if(isNaN(split[1])) return; //id is not a number

		if(split[0].toLowerCase().match(/no|n|nope|nu|ne|yes|ya|y|ye|yup|sure/gm))
			var status = split[0].toLowerCase().match(/yes|ya|y|ye|yup|sure/gm) ? 2 : 3;
		else return;

		client.db.query("UPDATE moat_comps SET approved = ? WHERE ID = ?", [status, split[1]], function (err, result) {
			if(err) return msg.genericError();

			if(result.changedRows === 1) {
				if(status == 2) msg.basicEmbed('Successfully updated compensation ticket. (Approved)');
				else msg.basicEmbed("Successfully updated compensation ticket. (Denied)");

			} else msg.basicEmbed('Unable to update compensation ticket.', true);
		});
	}
};