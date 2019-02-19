const {Client} = require('discord.js-commando');
const path = require('path');
const sqlite = require('sqlite');

Client.prototype.init = function () {
	this.on('error', console.error)
		.on('warn', console.warn)
		.on('debug', console.log)
		.on('disconnect', () => {
			console.warn('Disconnected!')
		})
		.on('reconnect', () => {
			console.warn('Reconnecting...')
		})
		.on('commandError', (cmd, err) => {
			console.log(err)
		})
		.on('guildMemberAdd', member => {
			if(this.provider.get('global', 'badplace', []).some(group => group[0] == member.id)) {
				member.addRole(this.guilds.get('256324969842081793').roles.find('name', 'Bad Place Enthusiast'));
			}
		});

	this.registry
		.registerDefaultTypes()
		.registerDefaultGroups()
		.registerDefaultCommands({
			help: false
		})
		.registerGroups([
			['dev', 'Developer'],
			['info', 'Information'],
			['staff', 'TTT Staff'],
			['user', 'User']
		])
		.registerCommandsIn(path.join(__dirname, '../commands'));

	this.storage();
	this.inhibitors();
	this.initializeWeb();
};

Client.prototype.storage = function () {
	const Commando = require('discord.js-commando');

	this.setProvider(
		sqlite.open(path.join(__dirname, '../settings.sqlite3')).then(db => new Commando.SQLiteProvider(db))
	).catch(console.error);
};

Client.prototype.inhibitors = function () {
	this.dispatcher.addInhibitor(msg => {
		return this.provider.get('global', 'blacklist', []).includes(msg.author.id) ? 'Blacklisted' 
			/*: (!(msg.guild && msg.guild.id) || msg.guild.id !== '474464006548094976') ? 'Not the Staff Discord' */
				: false;
	});
};

Client.prototype.initializeWeb = function () {
	const express = require('express');
	const bodyParser = require('body-parser');
	const error = require('../misc/error');
	const command = require('../misc/command');
	const github = require('../misc/github');
	const rank = require('../misc/rank');
	const web = express();


	web.listen(5069);
	web.use(bodyParser.json());//DO NOT REMOVE OR CAN NOT PARSE SERVER RESPONSES
	web.use(bodyParser.urlencoded({extended: true}));//DO NOT REMOVE OR CAN NOT PARSE SERVER RESPONSES
	web.use(express.json());//DO NOT REMOVE OR CAN NOT PARSE SERVER RESPONSES
	web.use(express.urlencoded());//DO NOT REMOVE OR CAN NOT PARSE SERVER RESPONSES

	web.post('/servererrorsmoon', (req, res) => error.handle(req.body, res, this));
	web.post('/serverrconmoon', (req, res) => command.handle(req.body, res, this));
	web.post('/discord/rank', (req, res) => rank.handle(req.body, res, this));
	web.post('/gitweb', (req, res) => github.handle(req.body, res, this));
	web.post('/gitweb2', (req, res) => github.handle2(req.body, res, this));
	web.post('/gitweb3', (req, res) => github.handle3(req.body, res, this));
	web.post('/deploy', (req, res) => github.deploy(req, res, this));
};

Client.prototype.storedCommands = [];

module.exports = Client;
