const steam = require('steamid');
const fetch = require('node-fetch');
var moment = require('moment');

class CommandHelper {
	constructor() {
		this.forumGroup = {
			23: 'NBA',
			3: 'Member',
			11: 'Administrator',
			8: 'Cool Cuties',
			10: 'Moderator',
			9: 'Trial Staff',
			12: 'Senior Administrator',
			/*
			13: 'Head Administrator',
			20: 'Operations Lead',
			14: 'Community Lead',
			16: 'Web Developer',
			19: 'Tech Lead'
			*/
		};

		// List of roles ID's to remove when members verify, are promoted, etc (so they dont stack roles)
		this.mainStaffIDs = [
			'256328950857334784', // Cool Cuties
			'256328853763522560', // Trial Staff
			'256328730115309568', // Moderator
			'256328565979742209', // Administrator
			'256328248340774912' // Senior Administrator
		];

		// List of roles ID's to remove when members verify, are promoted, etc (so they dont stack roles)
		this.corpStaffIDs = [
			'485826602970644500', // Cool Cuties
			'474476050362138625', // Trial Staff
			'474475922284871683', // Moderator
			'474475874759213076', // Administrator
			'474475743867568128' // Senior Administrator
		];

		this.corpReqTimeZone = '490085702571261952';
		this.corpTimeZones = [
			'482828169741598720',
			'482828160661192704',
			'482775481398067201',
			'482822137045057555',
			'482825792141787147',
			'482822183190790144',
			'482823049033416705',
			'482823378504515595',
			'482826237866147840',
			'482826613311143937',
			'482826704348381184',
			'490085702571261952'
		];

		this.prettyRank = {
			user: 'User',
			member: 'Member',
			nba: 'NBA',
			starplayer: 'Star Player',
			hoodninja: 'Hood Ninja',
			trialstaff: 'Trial Staff',
			moderator: 'Moderator',
			admin: 'Administrator',
			senioradmin: 'Senior Administrator',
			headadmin: 'Head Administrator',
			communitylead: 'Community Lead',
		};

		this.discordRanks = {
			'@everyone': 'user',
			'Member': 'member',
			'NBA': 'nba',
			'Star Player': 'starplayer',
			'Hood Ninja': 'hoodninja',
			'Trial Staff': 'trialstaff',
			'Moderator': 'moderator',
			'Administrator': 'admin',
			'Senior Administrator': 'senioradmin',
			'Head Administrator': 'headadmin',
			'Operations Lead': 'headadmin',
			'Tech Lead': 'communitylead',
			'Community Lead': 'communitylead',
			'TTT Developer': 'communitylead',

			'Chief Boss': 'communitylead',
			'Help Boss': 'headadmin',
			'Staff Boss': 'headadmin',
		};

		this.rankWeight = {
			'@everyone': 0,
			'Bad Place Enthusiast': 0,
			'User': 0,
			'Member': 1,
			'NBA': 10,
			'Star Player': 20,
			'Hood Ninja': 30,
			'Trial Staff': 40,
			'Moderator': 50,
			'Administrator': 60,
			'Senior Administrator': 70,
			'Head Administrator': 80,
			'Operations Lead': 90,
			'Community Lead': 100
		}

		this.units = {
			s: 'second',
			m: 'minute',
			h: 'hour',
			d: 'day',
			w: 'week',
			mo: 'month',
			y: 'year'
		};

		this.units2 = {
			second: 's',
			minute: 'm',
			hour: 'h',
			day: 'd',
			week: 'w',
			month: 'mo',
			year: 'y'
		};
		this.length = {
			'seconds': 1,
			'minutes': 60,
			'hours': 3600,
			'days': 86400,
			'weeks': 604800,
			'months': 2419200,
			'years': 29030400
		}
		this.emojis = {
			skins: [':skin-tone-1:', ':skin-tone-2:', ':skin-tone-3:', ':skin-tone-4:', ':skin-tone-5:'],
			gamers: [':baby:', ':boy:', ':boy:', ':boy:', ':boy:', ':man:', ':boy:', ':baby:', ':boy:', ':boy:', ':boy:', ':boy:', ':girl:', ':man:', ':boy:', ':boy:', ':boy:'],
			bad: [':flushed:', ':slight_frown:', ':cop:', ':frowning2:', ':persevere:', ':confounded:', ':tired_face:', ':weary:', ':pensive:', ':sweat:', ':cry:', ':disappointed_relieved:', ':sleepy:', ':thermometer_face:', ':sob:', ':sneeze:', ':raised_hand:'],
			good: [':wink:', ':blush:', ':slight_smile:', ':upside_down:', ':relaxed:', ':relieved:', ':yum:', ':heart_eyes:', ':kissing_heart:', ':kissing:', ':kissing_smiling_eyes:', ':kissing_closed_eyes:', ':stuck_out_tongue_winking_eye:', ':stuck_out_tongue_closed_eyes:', ':stuck_out_tongue:', ':nerd:', ':sunglasses:', ':smirk:', ':triumph:', ':clap:', ':raised_hands:', ':information_desk_person:', ':no_good:', ':ok_woman:', ':raising_hand:', ':cop:', ':construction_worker:', ':spy:', ':angel:', ':call_me:'],
			animals: [':cat:', ':frog:', ':pig:', ':dog:', ':bear:', ':octopus:', ':lion_face:', ':fish:', ':bird:', ':snake:']
		};

		this.now = ['NOW!!!', 'now', 'here and now', 'HERE AND NOW!', 'forthwith', 'FORTHWITH!!?',
			'immediately', 'IMMEDIATELY!', 'instantly', 'INSTANTLY!!', 'AT ONCE.', 'IN **5** SECONDS',
			'after dinner', 'like now', 'like totally now', 'like right now', 'pronto', 'right away', 'right now',
			'soon', 'boss', 'just now', 'asap', 'ASAP'];

	};

	randomValue(array) {
		return array[Math.floor(Math.random() * array.length)];
	}

	getRanks() {
		return this.prettyRank;
	}

	toManyUsers(users) {
		let ret = 'There is more than one user that matches the search: \n\n';
		for (let user of users) {
			ret += `| **${user['name']}** [(${user['steamid64']})](https://steamcommunity.com/profiles/${user.steamid64}) [${this.prettyRank[user.rank] || 'User'}]\n`
		}

		return ret;
	}

	tooManyUsers(users, msg, search) {
		let count = users.length,
			pages = [],
			page = 0,
			limit = 0;

		for (let user of users) {
			if(limit === 10) {
				page++;
				limit = 0;
			}

			if(!pages[page]) pages[page] = {
				header: `🤷‍ Unknown Target | Matched ${count} Different Players`,
				text: `Try using a SteamID \`\`(STEAM_0:0:012345678)\`\` to specify the player.\nYour search term: \`\`${search}\`\``,
				fields: []
			};

			pages[page].fields.push({
				name: `${user.serverid || 'Offline'} |`
				+ (user.rank ? ((user.rank === 'user') ? '' : ' [' + this.prettyRank[user.rank] + ']') : '')
				+ ' ' + this.randomValue(this.emojis.gamers) + this.randomValue(this.emojis.skins) + ` ${user.name}`,
				value: (user.level ? (`Level ${user.level}`) : `Hours: ${user.playtime ? (Math.round((user.playtime / 3600) * 100) / 100) : 0.1}`)
				+ ` - [View Profile](https://steamcommunity.com/profiles/${user.steamid64})`
				+ ' - ``' + this.convertToText(user.steamid64) + '``'
			})

			limit++;
		}

		return msg.pageEmbed(pages);
	}

	validateUnit(unit) {
		if(unit.length > 1) unit = unit.replace(/s\s*$/, '');
		unit = unit.toLowerCase();
		unit = this.units2.hasOwnProperty(unit) ? this.units2[unit] : unit;

		return this.units.hasOwnProperty(unit) ? true : 'Say the unit of time now (seconds, minutes, hours, days, etc.)'
	}

	parseUnit(unit) {
		if(unit.length > 1) unit = unit.replace(/s\s*$/, '');
		unit = unit.toLowerCase();
		unit = this.units2.hasOwnProperty(unit) ? this.units2[unit] : unit;

		return this.units[unit];
	}

	parsePlayer(str) {
		let pl = str.replace('👍', ':1:') //mobile edge case for android
			.replace(/[^\x00-\x7F]/g, "")
			.replace(/^STEAM_[0-5]/, 'STEAM_0')
			.replace('\\', ''); //mobile edge case for when they try to escape the thumbs up

		return str.match(/^STEAM_[0-5]:[01]:\d+$/) ? this.convertTo64(pl) : str;
	}

	parseWorkshop(str) {
		return str.match(/([0-9]{8,})/);
	}

	parseTime(unix) {
		return moment.unix(unix).format('MMM DD, YYYY @ h:mmA'); 
	}
 
	//this whole thing seems like a bad implementation of async programming but idk how to make it better
	async canRunCommand(msg, commandName) {
		const rank = this.discordRank(msg.member.highestRole.name);
		const client = msg.client;

		if(!rank) return false;

		let staffID = await client.getSteamID(msg.member.id);
		if(!staffID || staffID == '0')
			return 'Please verify your account to use commands: <https://moat.gg/verify>';

		if(commandName === 'MEMBER_VERIFIED')
			return true;

		let command = await client.easyQuery('SELECT flag, weight, args FROM player_cmds WHERE name = ?', commandName);
		if(!command || !command[0]) return 'An error occurred.';

		let perms = await client.easyQuery('SELECT * FROM player_ranks WHERE name LIKE ? AND (flags LIKE ? OR flags = "*")', [rank, `%${command[0].flag}%`]);
		if(!perms || !perms[0]) return 'You do not have the required permissions.';

		return true;
	}

	discordRank(rank) {
		return this.discordRanks[rank] || null;
	}

	canRunOnUser(rank1, rank2, resolve = false) {
		if(resolve) {
			rank1 = this.prettyRank[rank1];
			rank2 = this.prettyRank[rank2];
		}

		return this.rankWeight[rank1] == 100 || this.rankWeight[rank1] > this.rankWeight[rank2];
	}

	async getServerName(client, ip) {
		const name = await client.easyQuery(`SELECT name FROM player_servers WHERE CONCAT(ip, ':', port) LIKE ? LIMIT 1`, [ip]);

		return name[0] && name[0].name ? name[0].name : 'N/A';
	}

	async findUserAndRunCommand(user, client, data, msg) {
		const foundUser = await client.easyQuery('SELECT * FROM player_sessions WHERE steamid64 = ? OR name LIKE ? LIMIT 5', [user, `%${user}%`]);

		if(!foundUser[0]) return msg.basicEmbed('That user is not currently online.', true);
		if(foundUser.length > 1) return msg.basicEmbed(this.toManyUsers(foundUser));

		data[1][1] = foundUser[0].rank;
		data[4] = foundUser[0].server;
		data[6] = this.convertToText(foundUser[0].steamid64);

		this.runCommand(client, data, msg, foundUser[0]);
	}


	async checkTargetAndRunCommand(user, client, data, msg) {
		const Users = await client.easyQuery(`
			SELECT pl.steamid64, pl.name, pl.rank, pl.level, pl.server, sv.name AS serverid
			FROM  player_sessions AS pl INNER JOIN player_servers AS sv 
			ON CONCAT(sv.ip, ':', sv.port) = pl.server 
			WHERE pl.steamid64 = ? OR pl.name LIKE ? 
			ORDER BY pl.level`, [user, `%${user}%`]);

		if(!Users[0]) return this.buildCommandInfo(client, data, msg, user);
		if(Users.length > 1) return this.tooManyUsers(Users, msg, user);

		data[1][1] = Users[0].rank || 'user';
		data[4] = Users[0].server;
		data[6] = this.convertToText(Users[0].steamid64);

		this.runCommand(client, data, msg, Users[0]);
	}

	async buildCommandInfo(client, data, msg, user) {
		const targ = await client.easyQuery('SELECT steam_id as steamid64, name, rank, playtime FROM player WHERE steam_id LIKE ? OR name LIKE ? LIMIT 50', [user, `%${user}%`]);

		if(!targ[0]) return msg.basicEmbed(`I couldn't find any players matching \`${user}\`.`, true);
		if(targ.length > 1) return this.tooManyUsers(targ, msg, user);

		data[1][1] = targ[0].rank || 'user';
		data[4] = '208.103.169.30:27015'; // TTT #1
		data[6] = this.convertToText(targ[0].steamid64);

		this.runCommand(client, data, msg, targ[0]);
	}

	convertToText(steam64) {
		let sid = new steam(steam64.trim());

		return sid.getSteam2RenderedID();
	}

	convertTo64(steam32) {
		let sid = new steam(steam32.trim());

		return sid.getSteamID64();
	}

	async reactPage(msg) {
		await msg.react('◀');
		await msg.react('▶');
		await msg.react('⛔');
	}

	async getResponse(msg, length) {
		let res = await msg.channel.awaitMessages(m => m.content == '*' || (m.content > 0 && m.content <= length), {
			maxMatches: 1,
			time: 30000,
		});

		return !res.first() || (res.first().content != '*' && isNaN(res.first().content)) ? false : res;
	}

	async getServersAPI(client) {
		const servers = await fetch('https://moat.gg/api/servers/current');
		const serverData = await servers.json();

		const serverNames = await client.easyQuery('SELECT custom_ip, name FROM player_servers');

		let names = [];
		for (let server of serverNames) names[server['custom_ip']] = server['name'];
		delete serverData.servers.discord;

		return {data: serverData, labels: names, count: serverData.length};
	}

	async runCommand(client, data, msg, user = 0) {
		if(!isNaN(data[0])) data[0] = this.convertToText(data[0]);

		if(data[1][1] && user) { //if issued on another user make sure they are of lower weight
			if(data[0] == user.steamid64) return msg.basicEmbed(`I love you too much to let you commit seppuku. 🌼💕`, true);

			const canRunOnUser = this.canRunOnUser(data[1][0], data[1][1], true);
			if(!canRunOnUser) return msg.basicEmbed(`You can't target ${user.name}, silly goose!`, true);
		}

		const server = await this.getServerName(client, data[4]);
		data[1] = data[1][0];

		client.easyQuery(`call insertRconCommand(?, ?, ?, ?, ?, ?, ?)`, data).then(res => {
			if(!(res && res[0] && res[0][0] && res[0][0].cmd_id)) return msg.basicEmbed('Something went wrong.', true);
			const cmd_id = res[0][0].cmd_id;

			msg.basicEmbed(`Queued ${data[3]} on ${data[4] == '*' ? 'all servers' : server} (ID: ${cmd_id})`).then(msgq => {
				client.storedCommands[cmd_id] = {
					cmdmsg: msg,
					message: msgq,
					user: msg.author,
					server: data[4]
				};

				msg.guild.channels.get('487198112927055873').send({ //#staff-command-logs
					embed: {
						color: 4233412,
						description: `:cop: ${msg.author} ran command: \`${data[3]}\`
:name_badge: ${data[2]}
:id: ${data[0]}
:shield: ${data[1][0]}
:desktop: ${data[4] == "*" ? "**all servers**" : server}
\`\`\`Args: ${data[5]}
Target: ${data[6]}
\`\`\``
					}
				})
			})
		}).catch(console.error);
	}
}

module.exports = CommandHelper;