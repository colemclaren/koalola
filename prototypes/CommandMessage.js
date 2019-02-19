const {CommandMessage} = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
let helper = require('../classes/CommandHelper');
helper = new helper();

CommandMessage.prototype.basicEmbed = function (desc, error = false) {
	desc = error ? (helper.randomValue(helper.emojis.bad) + ' ' + desc) : (helper.randomValue(helper.emojis.good) + ' ' + desc);
	desc = desc.replace(' now', ' ' + helper.randomValue(helper.now));
	if(desc.match(/[^!.?><:;'"`{\[}\]]$/g)) desc += '.';

	return this.channel.send({
		embed: {
			color: error ? 14495300 : 3447003,
			description: desc.length > (2048 - 3) ? desc.substring(0, 2048 - 3) + '...' : desc
		}
	});
};

CommandMessage.prototype.genericError = function (code = 0) {
	let desc = 'An error was encountered.';
	if(code) desc += ` Code: ${code}`;

	return this.basicEmbed(desc, true);
};

CommandMessage.prototype.pageEmbed = async function (pages, info) {
	let base = Object.assign(pages[0], info);

	let page = 1,
		avatar = 'https://cdn.moat.gg/f/dark_blue.png',
		userID = this.author.id,
		userAvatar = this.author.avatarURL,
		embedTime = new Date().toISOString();
	controls = [
		'◀', // Prev
		'▶', // Next
		'⛔'  // Exit
	];

	if(!base.color) base.color = 3447003;
	if(base.header) base.author = {name: base.header, icon_url: avatar};
	base.description = pages[page - 1].text || pages[page - 1].description || '...';
	base.footer = {text: `Page ${page} of ${pages.length}`, icon_url: userAvatar};
	base.timestamp = embedTime;

	var embed = new RichEmbed(base);
	let _ = this;
	return await this.channel.send(embed).then(async function (msg) {
		for (var i = 0; i < controls.length; i++) {
			let btn = controls[i];
			await msg.react(btn)

			let act = msg.createReactionCollector((r, u) => r.emoji.name === btn && u.id === userID, {time: 900000});

			act.on('collect', r => {
				if(btn === controls[2]) {
					msg.delete();
					return _.delete();
				} else if(btn === controls[0]) {
					if(page === 1) return;
					page--;
				} else if(btn === controls[1]) {
					if(page === pages.length) return;
					page++;
				}

				let view = pages[page - 1] || {},
					info = Array.prototype.slice.call(base);

				if(!view.color) info.color = 3447003;
				if(view.author) info.author = view.author;
				if(view.header) info.author = {name: view.header, icon_url: avatar};
				if(view.title) info.title = view.title;
				if(view.url) info.url = view.url;
				if(view.color) info.color = view.color;
				if(view.timestamp) info.timestamp = view.timestamp;
				if(view.thumbnail) info.thumbnail = view.thumbnail;
				if(view.image) info.image = view.image;
				if(view.fields) info.fields = view.fields;

				info.description = view.desc || view.text || view.description || info.description || '...';
				info.footer = {text: `Page ${page} of ${pages.length}`, icon_url: userAvatar};
				info.timestamp = embedTime;

				embed = new RichEmbed(info);
				msg.edit(embed)
			})
		}
		;
	})
}

CommandMessage.prototype.reactRemovable = async function (thing, btn = '⛔') {
	let userID = this.author.id,
		userAvatar = this.author.avatarURL,
		userName = this.member.displayName;

	if(thing && (typeof thing.footer === 'undefined' || !thing.footer))
		thing.footer = {text: userName, icon_url: userAvatar};

	if(thing && thing && (typeof thing.timestamp === 'undefined' || !thing.timestamp))
		thing.timestamp = new Date().toISOString();
	let _ = this;
	return await this.channel.send(thing).then(async function (msg) {
		await msg.react(btn);

		let act = msg.createReactionCollector((r, u) =>
			r.emoji.name === btn && u.id === userID, {time: 900000});

		act.on('collect', r => {
			msg.delete();
			_.delete();
		})
	})
}

CommandMessage.prototype.chooseServer = async function (func) {
	const api = await helper.getServersAPI(this.client);

	let avatar = 'https://cdn.moat.gg/f/dark_blue.png',
		userID = this.author.id,
		userAvatar = this.author.avatarURL,
		embedTime = new Date().toISOString(),
		curview = 0,
		pages = [],
		page = 0,
		list = [],
		limit = 0,
		controls = [
			'◀', // Prev
			'▶', // Next
			'⛔', // Exit
		];

	let embed = new RichEmbed()
		.setColor(3447003)
		.setAuthor(`🚀 Choose a TTT Server || Say the # or *`, 'https://cdn.moat.gg/f/dark_blue.png')

	let i = 1;
	for (let server in api.data.servers) {
		if(limit === 10) {
			page++;
			limit = 0;
		}

		if(!pages[page]) pages[page] = {
			text: `Yes no yes no yes no yes no yes no yes no yes no yes no.`,
			fields: []
		};

		if(!list[page]) list[page] = [];
		list[page][i] = {data: api.data.servers[server], sv: server};
		let info = api.data.servers[server],
			svname = `${i} - ${api.labels[server]} || ${info.online ? (`${info.players} ${info.players > 1 ? 'Players' : 'Player' }  •  ${info.map}`) : 'No Response'}`,
			svdesc = `  •  Join Link: steam://connect/${server}:${info.port}`;

		pages[page].fields.push({
			name: svname,
			value: svdesc
		})

		limit++;
		i++;
		if(page === 0) embed.addField(svname, svdesc);
	}

	embed.timestamp = embedTime;
	embed.setFooter(`Page ${curview + 1} of ${pages.length}`, userAvatar);

	let servers = [];
	for (let group of list) {
		for (let item of group) {
			if(item) servers.push(item); //hacky fix do not remove unless you fix what is inserting undefined into the list object
		}
	}

	let msg = await this.channel.send(embed)

	let _ = this;
	let act = msg.createReactionCollector((r, u) => u.id === userID, {time: 900000});
	act.on('collect', r => {
		let btn = r.emoji.name;

		if(btn === controls[2]) {
			msg.delete();
			return _.delete();
		} else if(btn === controls[0]) {
			if(curview === 0) return;
			curview--;
		} else if(btn === controls[1]) {
			if(curview === (pages.length - 1)) return;
			curview++;
		} else {
			console.log(list[curview][btn]);
		}

		embed.fields = pages[curview].fields;

		embed.setFooter(`Page ${curview + 1} of ${pages.length}`, userAvatar);

		msg.edit(embed);
	});

	helper.reactPage(msg); //don't await this or we will have to wait for reacts before we can accept the users input

	let response = await helper.getResponse(msg, servers.length);

	if(!response) return null;

	return [response, servers]
}

module.exports = CommandMessage;
