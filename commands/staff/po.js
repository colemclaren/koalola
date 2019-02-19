const commando = require('discord.js-commando');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class Po extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'po',
			group: 'staff',
			memberName: 'po',
			description: 'View a player\'s TTT past offenses.',
			args: [{
				key: 'user',
				label: 'Name/SteamID',
				prompt: 'Give me the Player\'s SteamID or Name to look up in the po po database.',
				max: 32,
				type: 'string',
				parse: str => {
					return helper.parsePlayer(str);
				}
			}],
			weightPermissions: 40,
			examples: [
				/* Command Emoji */ ':snake:',
				/* Command Image */ ''
			]
		});
	}

	async hasPermission(msg) {
		return await helper.canRunCommand(msg, 'po');
	}

	async run(msg, args) {
		if(!args.user) return;

		const foundUser = await this.client.easyQuery('SELECT pl.steam_id AS steamid64, pl.name, pl.rank, pl.playtime, pl.avatar_url, sv.name as serverid FROM player as pl\n' +
			'LEFT JOIN player_sessions AS sess ON pl.steam_id = sess.steamid64\n' +
			'LEFT JOIN player_servers AS sv ON CONCAT(sv.ip, \':\', sv.port) = sess.server\n' +
			'WHERE pl.steam_id = ? OR ' +
			'pl.name LIKE ?\n' + //very important not to use like so the fulltext index is used
			'LIMIT 25', [args.user, `%${args.user}%`]);

		if(!foundUser[0]) return msg.basicEmbed('That user was not found.', true);
		if(foundUser.length > 1) return helper.tooManyUsers(foundUser, msg, args.user);

		const bans = await this.client.easyQuery('SELECT ban.*, pl.rank FROM player_bans AS ban LEFT JOIN player AS pl ON pl.steam_id = ban.staff_steam_id WHERE ban.steam_id = ? ORDER BY time DESC', foundUser[0].steamid64);

		if(!bans[0]) return msg.basicEmbed('This user has no past ban history.');


		let pages = [],
			page = 0,
			limit = 0;

		for (let ban of bans) {
			if(limit === 5) {
				page++;
				limit = 0;
			}

			if(!pages[page]) pages[page] = {
				header: `🔨 Ban Information | ${foundUser[0].name} - ${foundUser[0].steamid64}`,
				text: `View the **${bans.length} ban${bans.length > 1 ? 's' : ''}** ${foundUser[0].name} has received`,
				fields: []
			};

			const date = new Date(ban.time * 1000);

			pages[page].fields.push({
				name: `${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}-${date.getFullYear()} || `
				+ `${ban.staff_name} • ${secLength(ban.length)}`,
				value: `Reason: ${ban.reason}
				${ban.unban_reason ? `Unbanned: ${ban.unban_reason || 'N/A'}` : ''}`
			});

			limit++;
		}

		return msg.pageEmbed(pages, {thumbnail: {url: foundUser[0].avatar_url}});

		function secLength(sec, long = 'Permanent') {
			let seconds = Math.round(sec),
				minutes = Math.round((sec / 60)),
				hours = Math.round((sec / (60 * 60))),
				days = Math.round((sec / (60 * 60 * 24)));

			if(seconds <= 0) return long;
			else if(seconds < 60) return seconds + ((seconds > 1) ? ' Seconds' : ' Second');
			else if(minutes < 60) return minutes + ((seconds > 1) ? ' Minutes' : ' Minute');
			else if(hours < 24) return hours + ((hours > 1) ? ' Hours' : ' Hour');
			else return days + ((days > 1) ? ' Days' : ' Day');
		}

	}

};