process.on('unhandledRejection', (reason, promise) => {
	console.warn('Unhandled promise rejection:', promise, 'reason:', reason);
});

const requireDir = require('require-dir');
requireDir('./prototypes');

const Commando = require('discord.js-commando');
const cleverbot = require('./misc/cleverbot');
const comp = require('./misc/comp');
const math = require('./misc/math');
const giveaway = require('./misc/giveaway');
const moatServers = require('./config').discordServers;
const MysqlAPI = require('./misc/api_mysql');
const trello = require('./misc/trello');

const client = new Commando.Client({
	commandPrefix: '!',
	owner: ['448587723952095242'],
	unknownCommandResponse: false,
	disableEveryone: true
});

MysqlAPI.init(client); //Update the MySQL database for API usage
trello.init(client);

/*
 * Initializes the commands/groups/command types
 * Initializes the sqlite storage system
 * Initializes the command inhibitors - blacklist
 * Initializes the web endpoints - rcon & error
 */
client.init();

client.on('message', async msg => {
	if(msg.author.bot) return;
	if(comp.canHandleTicket(msg, client))
		return comp.handleTicket(msg, client);

	const discord = msg.content.match(/discord(?:app\.com|\.gg)[\/invite\/](?!moatgaming)(?:(?!.*[Ii10OolL]).[a-zA-Z0-9]{5,6}|[a-zA-Z0-9\-]{2,32})?/gi);
	if(discord && discord[0] && !msg.member.hasPermission('ADMINISTRATOR')) {
		try { //invite might not be valid
			for (const match in discord) {
				try {
					console.log(discord[match]);
					const invite = await client.fetchInvite(discord[match]);
					if (!['474464006548094976', '256324969842081793'].includes(invite.guild.id)) {
						try {
							msg.delete();
							break;
						} catch(e) {
							console.log(e);
						}
					}
				} catch (e) {
					console.log(e);
				}
			}
		} catch (e) {
			console.log(e);
		}
	}

	// if(cleverbot.shouldRespond(msg, client))
	// 	return cleverbot.respond(msg);

	try {
		if(math.shouldRespond(msg))
			return math.respond(msg)
	}
	catch (e) {
	}
});

let commandMessages = [];
client.on('commandRun', (command, promise, message) => {
	commandMessages[message.id] = message;
});

client.on('messageDelete', msg => {
	if(commandMessages[msg.id] && commandMessages[msg.id].responses) {
		for(var test in commandMessages[msg.id].responses) {
			try {
				commandMessages[msg.id].responses[test][0].delete();
			} catch(e) {
				console.log('error deleting');
			}
		}
	}
});

//fix because uncached messages dont trigger the messageReactionAdd event
client.on('raw', async event => {
	if(event.t != 'MESSAGE_REACTION_ADD') return;
	const {d: data} = event;
	const user = client.users.get(data.user_id);
	const channel = client.channels.get(data.channel_id) || await user.createDM();
	if(channel.messages.has(data.message_id)) return;
	const message = await channel.fetchMessage(data.message_id);
	const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
	const reaction = message.reactions.get(emojiKey);
	client.emit('messageReactionAdd', reaction, user);
});

//remove error on emoji react
client.on('messageReactionAdd', (msgReaction, user) => {
	if(msgReaction.message.channel.id == '449680380774055937' && !user.bot && msgReaction.emoji.name == '❌')
		msgReaction.message.delete();
});

//Process giveaways and update servers
setInterval(function () {
	giveaway.processGiveaways(client);
	moatServers.forEach(MysqlAPI.updateServers);
}, 5000);


// Show new compensation tickets
setInterval(function () {
	comp.getTickets(client, client.channels.get('474504845416464405')); //#comp-tickets
}, 30000);

client.login(require('./config').discordToken).catch(console.error);
