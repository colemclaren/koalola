const commando = require('discord.js-commando');
const {
	RichEmbed
} = require('discord.js');
var shell = require('shelljs');
var reader = require("buffered-reader");
var filereader = reader.DataReader;
var filesize = require('filesize');
var path = require('path');
var fs = require('fs-extra');

require('events').EventEmitter.defaultMaxListeners = 100000;

let helper = require('../../classes/CommandHelper');
helper = new helper();

let SteamWorkshop = require('../../classes/SteamWorkshop');
let steamworkshop = new SteamWorkshop('addons');

let gma = require('node-gmad');
let CurrentlyWorking = false;

module.exports = class MapCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'rm',
			group: 'dev',
			memberName: 'rm',
			description: 'Remove a map from the servers.',
			weightPermissions: 100,
			args: [{
				key: 'map',
				label: 'Map name to remove',
				prompt: 'Which map would you like to remove?',
				type: 'string',
				parse: str => {
					return str;
				}
			}],
			examples: [
				/* Command Emoji */
				':construction:',
				/* Command Image */
				''
			]
		});
	}

	async hasPermission(msg) {
		return await helper.canRunCommand(msg, 'lua');
	}

	run(msg, args) {
		let map = Array.isArray(args.map)?args.map[0]:args.map;
		map.toString().replace(/\.bsp$/, "");

		let dir = `/var/www/lola/repos/moat-gg-maps-`;

		fs.pathExists(`${dir}reg/maps/${map}.bsp`, (err, exists) => {
			if (exists) {
				shell.rm('-f',`${dir}reg/maps/${map}.bsp`);

				msg.reply(`Okay, removing ${map} from all regular map servers now.`);

				var deploy_start = new Date();
				shell.exec(`sh ${dir}reg/../reg_rm.sh 'maps/${map}.bsp'`, function (code, stdout, stderr) {
					if (stdout.match('Deployment Finished done')) {
						var deploy_end = new Date() - deploy_start;
						msg.reply(`Finished removing from all 17 regular servers. (Took ${Math.floor(deploy_end/1000)} secs)`)
					}
				});
			}
		});

		fs.pathExists(`${dir}mc/maps/${map}.bsp`, (err, exists) => {
			if (exists) {
				shell.rm('-f',`${dir}mc/maps/${map}.bsp`);

				msg.reply(`Okay, removing ${map} from all minecraft map servers now.`);

				var deploy_start = new Date();
				shell.exec(`sh ${dir}mc/../mc_rm.sh 'maps/${map}.bsp'`, function (code, stdout, stderr) {
					if (stdout.match('Deployment Finished done')) {
						var deploy_end = new Date() - deploy_start;
						msg.reply(`Finished removing from all 7 mc servers. (Took ${Math.floor(deploy_end/1000)} secs)`)
					}
				});
			}
		});
	};
};