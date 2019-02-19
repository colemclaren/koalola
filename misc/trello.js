const Trello = require('trello-events');
const {RichEmbed} = require('discord.js');
let helper = require('../classes/CommandHelper');
helper = new helper();

const fs = require('fs');
var conf = {
	boardIDs       : [
		'1eBZEHiD',	// TTT
		'Pg5byB1z',
		'XhpQwq09',
		'hpyL48lx',	// Discord
		'sRIkRiSz',	// Website
		'GjiRF3Wi', // New Website
		'o95fH7pC', // Bug Reports
		'UGAmdMGU', // Design
		'NdWBjAeh',
		'zZH0kasu' // Rules & Punishments
	],
	boardIcons     : {
		  '1eBZEHiD'  : ['TTT', 16724787, 'https://cdn.moat.gg/f/0d607.png'], // TTT General
		  'Pg5byB1z'  : ['Inventory', 16724787, 'https://cdn.moat.gg/f/0d607.png'], // TTT Inventory
		  'XhpQwq09'  : ['Items', 16724787, 'https://cdn.moat.gg/f/0d607.png'], // TTT Items
		  'hpyL48lx'  : ['Website', 29183, 'https://cdn.moat.gg/f/c8046.png'], // Website
		  'GjiRF3Wi'  : ['New Site', 4363775, 'https://cdn.moat.gg/f/91096.png'], // New Website
		  'sRIkRiSz'  : ['Discord', 7506394, 'https://cdn.moat.gg/f/a0238.png'], // Discord
		  'o95fH7pC'  : ['Bug Reports', 16312092, 'https://cdn.moat.gg/f/c748b.png'], // Bug Reports
		  'UGAmdMGU'  : ['Media Team', 3669831, 'https://cdn.moat.gg/f/10555.png', '507738089385492480'], // Creative Team
		  'NdWBjAeh'  : ['Model Team', 3669831, 'https://cdn.moat.gg/f/10555.png', '507675669224882176'], // Model Team
		  'zZH0kasu'  : ['Rules & Punishments', 29183, 'https://cdn.moat.gg/f/c8046.png', '511723298271264778'] // Rules & Punishments
	},
	serverID       : '474464006548094976',
	channelID      : '505665439289049089',
	pollInterval   : 10000,
	enabledEvents	 : [],
	userIDs : { // https://api.trello.com/1/members/UserNameHere
		  '591b37fc0c88e0bab9918c98' : ['207612500450082816', 'Motato'], // motato
		  '56f034a2c8f5522f3cde24a3' : ['411323213910376449', 'Footises'], // footsies
		  '576b317b8c194b63d03eb3fc' : ['150809682318065664', 'Meepen'], // meepen
		  '55d1411a30b9185623bbfa6f' : ['135912347389788160', 'Velkon'], // velkongmod
		  '5bd4302ffc28df1d2e2e255e' : ['133727774371217408', 'Eaglecorn'], // eaglecorn
		  '5ac7fbdd8ad87f98bd1f8f02' : ['89602995162984448', 'Lovely'], // codywiedenbein
		  '59bac4e05af7f46ce23dde3d' : ['260143315414941697', 'Sterling'], // sterlingpierce1
		  '5bea2e8135f922563f6153c1' : ['411400633560596490', 'Leo'], // d1_king_leo
		  '5950918ec68429cdb9787fff' : ['222188163790143489', 'Crossboy'], // crossboy
		  '5bea2ca215922236d6a826da' : ['195789025351696384', 'Jam'], // jam
		  '5a70e66b11ef109545bb8693' : ['151709321284026368', 'Ling']
	}
};

let latestActivityID = fs.existsSync('.latestActivityID') ? fs.readFileSync('.latestActivityID') : 0;
const events = new Trello({
	pollFrequency: conf.pollInterval,
	minId: latestActivityID, // auto-created and auto-updated
	start: false,
	trello: {
		boards: conf.boardIDs,
		key: 'b272637f1ba0c2ddf31f3e7268f84b00',
		token:	'8d3074ceddc8af512a59d20f3ffbf8bc2cd66bdefe24e65b4dcf0a4a13eb52b2'
	}
});

var bot;
module.exports = {
	init: function(lola) {
		bot = lola;
		bot.guilds.get(conf.serverID);
		bot.on('ready', () => {
			conf.guild = bot.guilds.get(conf.serverID);
			conf.channel = bot.channels.get(conf.channelID);

			events.start();
		});
	}
};

const send = (embed, event, content = ``) => {
	bot.channels.get(conf.boardIcons[event.data.board.shortLink][3] || conf.channelID).send(`${content}`, {embed:embed}).catch(err => console.error(err))
}

const eventEnabled = (type) => conf.enabledEvents.length > 0 ? conf.enabledEvents.includes(type) : true

const logEventFire = (event) => console.log(`${new Date(event.date).toUTCString()} - ${event.type} fired`)

const getEmbedBase = (event, title) => {
	let e = new RichEmbed()
		.setColor(conf.boardIcons[event.data.board.shortLink][1])
		.setTimestamp(event.hasOwnProperty(`date`) ? event.date : Date.now())
		.setAuthor(`${conf.boardIcons[event.data.board.shortLink][0]} | ${title || 'moat.gg'}`, conf.boardIcons[event.data.board.shortLink][2], `https://trello.com/${event.data.board.shortLink}`)

	let guy = event.memberCreator ? getDiscordMember(event.memberCreator) : {Name: 'Moat Gaming', ava: 'https://cdn.moat.gg/f/ca6e7.png'}
	if (guy)
		e.setFooter(guy.Name, guy.ava);

	return e;
}

const cardLink = (event) => {return `[${event.data.card.name/*.replace(/\[/g, '\\\[').replace(/\]/g, '\\\]')*/}](https://trello.com/c/${event.data.card.shortLink})`};

//  Converts Trello @username mentions in titles to Discord mentions, finds channel and role mentions, and mirros Discord user mentions outside the embed
const convertMentions = (embed, event) => {
	
}
		
// adds thumbanil and appends user mention to the end of the description, if possible
const getDiscordMember = (trelloMember) => {
	let info = {name: trelloMember.fullName, ava: `${trelloMember.avatarUrl}/50.png`, member: trelloMember};
	info.mention = `@[${trelloMember.fullName}](https://trello.com/${trelloMember.id})`
	info.Name = trelloMember.fullName

	if (conf.userIDs[trelloMember.id] == null)
		return info;

	let guildMember = conf.guild.members.get(conf.userIDs[trelloMember.id][0]);
	if (guildMember)
		return {
			Name: conf.userIDs[trelloMember.id][1],
			name: guildMember.displayName,
			ava: guildMember.user.displayAvatarURL,
			mention: `<@${guildMember.id}>`,
			member: trelloMember,
			user: guildMember,
		};

	return info;
}

/*
** ====================================
** Trello event handlers and functions.
** ====================================
*/

// Fired when a card is created
events.on('createCard', (event, board) => {
	let embed = getEmbedBase(event, '🐣 New Card')
		.setDescription(`${getDiscordMember(event.memberCreator).mention} added ${cardLink(event)} to **${event.data.list.name}**`)

	send(embed, event);
})

// Fired when a card is updated (description, due date, position, associated list, name, and archive status)
events.on('updateCard', (event, board) => {
	if (event.data.old.hasOwnProperty("desc")) {
		let embed = getEmbedBase(event, '📝 Edited Description')
			.setDescription(`${getDiscordMember(event.memberCreator).mention} set ${cardLink(event)} to\n\`\`\`${typeof event.data.card.desc === "string" && event.data.card.desc.trim().length > 0 ? (event.data.card.desc.length > 1024 ? `${event.data.card.desc.trim().slice(0, 1020)}...` : event.data.card.desc) : `nothing`}\`\`\``)

		send(embed, event);
	} else if (event.data.old.hasOwnProperty("due")) {
		let embed = getEmbedBase(event, event.data.card.due ? '⏰ Due Date' : '🛀 Not Due');
		if (event.data.card.due) {
			embed.setDescription(`${getDiscordMember(event.memberCreator).mention} set ${cardLink(event)} to be due \`\`${event.data.card.due ? new Date(event.data.card.due).toUTCString() : `whenever`}\`\``)
		} else {
			embed.setDescription(`${getDiscordMember(event.memberCreator).mention} removed the due date from ${cardLink(event)}`)
		}

		send(embed, event);
	} else if (event.data.old.hasOwnProperty("idList")) {
		let embed = getEmbedBase(event, '👉 Moved Card')
		.setDescription(`${getDiscordMember(event.memberCreator).mention} moved ${cardLink(event)} to **${event.data.listAfter.name}** from ~~${event.data.listBefore.name}~~`)

		send(embed, event);
	} else if (event.data.old.hasOwnProperty("name")) {
		let embed = getEmbedBase(event, '✍ Edited Title')
			.setDescription(`${getDiscordMember(event.memberCreator).mention} updated ${cardLink(event)} from ~~${event.data.old.name}~~`)

		send(embed, event);
	} else if (event.data.old.hasOwnProperty("closed")) {
		if (event.data.old.closed) {
			let embed = getEmbedBase(event, '🚨 Unfinished Card')
				.setDescription(`${getDiscordMember(event.memberCreator).mention} sent ${cardLink(event)} back to **${event.data.list.name}**`)

			send(embed, event);
		} else {
			let embed = getEmbedBase(event, '🎉 Finished Card')
				.setDescription(`${getDiscordMember(event.memberCreator).mention} archived ${cardLink(event)} from **${event.data.list.name}**`)

			send(embed, event);
		}
	}
})

// Fired when a comment is posted, or edited
events.on('commentCard', (event, board) => {
	if (event.data.hasOwnProperty("textData")) {
		// edit comment
	} else {
		let embed = getEmbedBase(event, '💭‍ New Comment')
			.setDescription(`${getDiscordMember(event.memberCreator).mention} on ${cardLink(event)}\n\`\`\`${event.data.text.length > 1024 ? `${event.data.text.trim().slice(0, 1020)}...` : event.data.text}\`\`\``)

		send(embed, event);
	}
})

// Fired when a member is added to a card
events.on('addMemberToCard', (event, board) => {
	let embed = getEmbedBase(event, '👋 Joined Card')

	if (event.member.id === event.memberCreator.id) {
		embed.setDescription(`${getDiscordMember(event.member).mention} joined ${cardLink(event)}`)
	} else {
		embed.setDescription(`${getDiscordMember(event.memberCreator).mention} added ${getDiscordMember(event.member).mention} to ${cardLink(event)}`)
	}

	send(embed, event);
})

// Fired when a member is removed from a card
events.on('removeMemberFromCard', (event, board) => {
	let embed = getEmbedBase(event, '🏃‍️ Left Card')

	if (event.member.id === event.memberCreator.id) {
		embed.setDescription(`${getDiscordMember(event.member).mention} left ${cardLink(event)}`)
	} else {
		embed.setDescription(`${getDiscordMember(event.memberCreator).mention} removed ${getDiscordMember(event.member).mention} from ${cardLink(event)}`)
	}

	send(embed, event);
})

// Fired when a list is created
events.on('createList', (event, board) => {
	let embed = getEmbedBase(event, '📖 New List')
		.setDescription(`${getDiscordMember(event.memberCreator).mention} added **${event.data.list.name}** to this board`)

	send(embed, event);
})

// Fired when an attachment is added to a card
events.on('addAttachmentToCard', (event, board) => {
	let embed = getEmbedBase(event, '🛰 File Uploaded')
		.setDescription(`${getDiscordMember(event.memberCreator).mention} attached __${event.data.attachment.name}__ to ${cardLink(event)}`)
		.setImage(event.data.attachment.url)

	send(embed, event);
})

// Fired when an attachment is removed from a card
events.on('deleteAttachmentFromCard', (event, board) => {
	let embed = getEmbedBase(event, '💣 File Deleted')
		.setDescription(`${getDiscordMember(event.memberCreator).mention} removed ~~__${event.data.attachment.name}__~~ from ${cardLink(event)}`)

	send(embed, event);
})

// Fired when a checklist is added to a card (same thing as created)
events.on('addChecklistToCard', (event, board) => {
	let embed = getEmbedBase(event, '📑 Added Checklist')
		.setDescription(`${getDiscordMember(event.memberCreator).mention} added **${event.data.checklist.name}** to ${cardLink(event)}`)

	send(embed, event);
})

// Fired when a checklist is removed from a card (same thing as deleted)
events.on('removeChecklistFromCard', (event, board) => {
	let embed = getEmbedBase(event, '💣 Removed Checklist')
		.setDescription(`${getDiscordMember(event.memberCreator).mention} removed ~~${event.data.checklist.name}~~ from ${cardLink(event)}`)

	send(embed, event);
})

// Fired when a checklist item's completion status is toggled
events.on('updateCheckItemStateOnCard', (event, board) => {
	if (event.data.checkItem.state === "complete") {
		let embed = getEmbedBase(event, '✅ Finished Item')
		.setDescription(`${getDiscordMember(event.memberCreator).mention} completed \`\`${event.data.checkItem.name.length > 1024 ? `${event.data.checkItem.name.trim().slice(0, 1020)}...` : event.data.checkItem.name}\`\` on [${event.data.checklist.name/*.replace(/\[/g, '\\\[').replace(/\]/g, '\\\]')*/}](https://trello.com/c/${event.data.card.shortLink})`)

		send(embed, event);
	} else if (event.data.checkItem.state === "incomplete") {
		let embed = getEmbedBase(event, '🅾 Unfinished Item')
		.setDescription(`${getDiscordMember(event.memberCreator).mention} marked \`\`${event.data.checkItem.name.length > 1024 ? `${event.data.checkItem.name.trim().slice(0, 1020)}...` : event.data.checkItem.name}\`\` incomplete on [${event.data.checklist.name/*.replace(/\[/g, '\\\[').replace(/\]/g, '\\\]')*/}](https://trello.com/c/${event.data.card.shortLink})`)

		send(embed, event);
	}
})

/*
** =======================
** Miscellaneous functions
** =======================
*/
events.on('maxId', (id) => {
	if (latestActivityID == id) return
	latestActivityID = id
	fs.writeFileSync('.latestActivityID', id)
})