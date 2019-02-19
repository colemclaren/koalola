let helper = require('../classes/CommandHelper');
helper = new helper();
var client;

module.exports = class discordGiveaways {
	constructor(client) {
		this.lola = client;
		this.handle = [];
	}

	// fetch active from shorter table, since this is called a lot
	fetchActive(client) {
		this.lola = client;

		client.db.query("SELECT ga.id, title, msg, winners, guild_id, channel_id, message_id, winner_amount, gi.ending FROM discord.lola_giveaway as ga INNER JOIN discord.lola_giveaway_info as gi on gi.id = ga.id WHERE gi.ending < NOW();", function (err, res) {
			if(err) return console.log(err);

			for (let i = 0; i < res.length; i++) {
				this.fetchInfo(res[i])
			}
		});
	}

	// fetch the active giveaway's main info
	fetchInfo(id) {
		client.db.query('SELECT id, title, msg, winners, guild_id, channel_id, message_id, winner_amount, ending FROM discord.lola_giveaway_info WHERE id = ?;', [id], function (err, res) {
			if(err) return console.log(err);

			for (let i = 0; i < res.length; i++) {
				const server = await this.getServerName(client, data[4]);
				this.chooseWinners(res[i])
			}
		});
	}

	verifyInfo(info) {

	}

	chooseWinners(info) {
		client.db.query('SELECT id, title, msg, winners, guild_id, channel_id, message_id, winner_amount, ending FROM discord.lola_giveaway_info WHERE id = ?;', [id], function (err, res) {
			if(err) return console.log(err);

			for (let i = 0; i < res.length; i++) {
				this.chooseWinners(res[i])
			}
		});
	}

	endGiveaway(id, client) {
		client.db.query("DELETE FROM discord.lola_giveaway WHERE id = ?;", [id], function (err) {
			if(err) return console.error(err);
		});
	}

	insertInfo(client) {

	}
};

/*
let giveaways = client.provider.get('global', 'giveaways', []);

	for (const i in giveaways) {
		const giveaway = giveaways[i];
		const guild = giveaway[0],
			channel = giveaway[1],
			message = giveaway[2],
			winnersCount = giveaway[3],
			time = new Date(giveaway[4]).getTime() / 1000;

		if(time - (new Date().getTime() / 1000) <= 60) {

			let messageFetched = await client.guilds.get(guild).channels.get(channel).fetchMessage(message).catch(e => {
				console.log(e)
				giveaways.splice(i, 1)
			});
			if(!giveaways[i]) continue;
			let react = await messageFetched.reactions.first();

			let users = [],
				lastID,
				res = '',
				mentions = '';

			while (true) {
				let fetch = await react.fetchUsers(100, {
					after: lastID
				});

				fetch.map(user => {
					if(user.id != '462414378352771123') { //make sure not lola
						users.push(user);
						lastID = user.id;
					}
				});

				if(fetch.size < 100) break;
			}
			const embed = new RichEmbed()
				.setTitle(`${messageFetched.embeds[0].title} Results`)
				.setColor('3399FF');


			let winners = shuffle(users);
			for (let j = 0; j < winnersCount && j < winners.length; j++) {
				res += `${winners[j].username}\n`;
				mentions += `${j != 0 ? ', ' : ''}${winners[j].toString()}`
			}
			giveaways.splice(i, 1);

			embed.addField('Winners', res || 'No Winners');
			messageFetched.channel.send({embed});
			messageFetched.channel.send(`Congratulations: ${mentions}`);

			function shuffle(array) {
				let currentIndex = array.length, temporaryValue, randomIndex;
				while (0 !== currentIndex) {
					randomIndex = Math.floor(Math.random() * currentIndex);
					currentIndex -= 1;
					temporaryValue = array[currentIndex];
					array[currentIndex] = array[randomIndex];
					array[randomIndex] = temporaryValue;
				}
				return array;
			}
		}
	}
	client.provider.set('global', 'giveaways', giveaways);
*/