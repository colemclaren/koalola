const {RichEmbed} = require('discord.js');
let helper = require('../classes/CommandHelper');
helper = new helper();

module.exports = {
	processGiveaways: async function (client) {
		const giveaways = await client.easyQuery('SELECT id, guild, channel, message, winner_num, time, winners FROM discord.bad_giveaway WHERE time < UNIX_TIMESTAMP() AND winners IS NULL;');

		for (const i in giveaways) {
			const giveaway = giveaways[i];
			const gid = giveaway.id,
				guild = giveaway.guild,
				channel = giveaway.channel,
				message = giveaway.message,
				winnersCount = giveaway.winner_num,
				time = new Date(giveaway.time).getTime() / 1000,
				over = giveaway.winners;

			console.log(gid, guild, channel, message, winnersCount, time, over);

			if(over) continue;

			let messageFetched = await client.guilds.get(guild).channels.get(channel).fetchMessage(message).catch(e => {
				giveaways.splice(i, 1)
			});
			if(!giveaways[i]) continue;
			let react = await messageFetched.reactions.first();

			let users = [],
				lastID,
				res = '',
				mentions = '';

			for (let i = 0; i < Math.ceil(react.count / 100); i++) {
				let fetch = await react.fetchUsers(100, {
					after: lastID
				});

				fetch.map(user => {
					if(user.id != '462414378352771123' && !users.includes(user)) { //make sure not lola and user doesn't alread yexist in array
						users.push(user);
						lastID = user.id;
					}
				});
			}


			const embed = new RichEmbed()
				.setTitle(`${messageFetched.embeds[0].title} Results`)
				.setColor('3399FF');


			let winners = shuffle(users);
			for (let j = 0; j < winnersCount && j < winners.length; j++) {
				res += `${winners[j].username}\n`;
				mentions += `${j != 0 ? ', ' : ''}${winners[j].toString()}`
			}

			client.db.query("UPDATE discord.bad_giveaway SET winners = ? WHERE id = ?", [JSON.stringify(mentions), gid]);

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
};