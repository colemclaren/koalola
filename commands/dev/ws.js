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
let checklist = [
	[/item_ammo_pistol_ttt/gi, "pistol ammo"],
	[/item_ammo_357_ttt/gi, "sniper ammo"],
	[/item_box_buckshot_ttt/gi, "shotgun ammo"],
	[/item_ammo_smg1_ttt/gi, "rifle ammo"],
	[/info_player_deathmatch/gi, "spawn points"],
	[/ttt_traitor_button/gi, "ttt_traitor_button"],
	[/info_player_terrorist/gi, "spawn points"],
	[/info_player_counterterrorist/gi, "spawn points"],
	[/info_player_start/gi, "spawn points"],
	[/ttt_playerspawn/gi, "spawn points"]
];

module.exports = class MapCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'ws',
			group: 'dev',
			memberName: 'ws',
			description: 'Check a workshop map addon.',
			weightPermissions: 100,
			args: [{
				key: 'addon',
				label: 'Workshop Link or File ID',
				prompt: 'Link or id of the workshop addon?',
				type: 'string',
				parse: str => {
					let id = str.match(/([0-9]{8,})/);

					return id[0] || str;
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
		let theid = args.addon;
		let msgs = [];
		
		if (CurrentlyWorking) {
			msg.reply('Please try again later, I\'m currently busy.');

			return;
		}

		CurrentlyWorking = true;

		steamworkshop.downloadFile(Array.isArray(theid)?theid[0]:theid, function (err, files, stop) {
			console.log("Download file " + theid, err, files, stop);
			if (files == null || files[0].publishedfileid == null || files[0].result != 1) {
				if (CurrentlyWorking != true) {
					return;
				}

				console.log("unable to find gma " + theid)

				msg.reply("I'm not able to find a single workshop gma under the ID: \"" + theid + "\", sorry.")

				CurrentlyWorking = false;

				return;
			}

			if (err != null) {
				if (!stop) {
					CurrentlyWorking = false;
				}

				console.log(err);
				return msg.channel.send(err).then(function(rm) {
					msgs.push(rm);
				});
			}

			let info = files[0]
			let gmapath = path.resolve(process.cwd(), 'addons') + '/' + info.publishedfileid + '.gma';
			console.log(gmapath);

			gma.parseAddon(gmapath).then(function (gmaFile) {
				console.log(gmaFile);
				let files = gmaFile.fileList;
				let fileid;

				let f;
				let fc = 0;

				for (f = 0; f < files.length; f++) {
					let n = path.basename(files[f].title);
					if (n.match(/\.bsp$/) && n.match(/^ttt_/)) fc++;
				};

				if (fc == 0) {
					msg.reply(info.title + " contains no TTT map files.");

					fs.unlink(gmapath, function (err) {
						console.log("deleted", gmapath);
						CurrentlyWorking = false;
					});

					return;
				}

				let entlist = {};
				let mapname = info.title;

				for (fileid = 0; fileid < files.length; fileid++) {
					let n = path.basename(files[fileid].title);
					if (!n.match(/\.bsp$/) || !n.match(/^ttt_/) || mapname != info.title) continue;

					let fileshort = files[fileid].title

					mapname = path.basename(fileshort, '.bsp');
					gma.extractFileFromAddon(gmapath, gmaFile, fileid).then(function (extractionStatus) {
						let dafile = extractionStatus.destination;
						console.log(dafile);

						new filereader(dafile, {
								encoding: "utf8"
							})
							.on("error", function (error) {
								console.log("Error: " + error);
							})
							.on("line", function (line) {
								var i = 0;
								while (i < checklist.length) {
									let reg = checklist[i];
									let det = line.search(reg[0]);
									if (det != -1) {
										if (!entlist[reg[1]]) {
											entlist[reg[1]] = 0;
										}

										entlist[reg[1]]++;

										i++;
									}

									i++;
								}
							})
							.on("end", function () {
								console.log('Finished reading ' + fileshort);

								var embed = new RichEmbed()
									.setTitle("Click here to open " + info.title)
									.setAuthor("React with 🚀 to deploy " + mapname + " to regular serveres, or the race car for only minecraft servers.")
									.setURL("http://steamcommunity.com/sharedfiles/filedetails/?id=" + info.publishedfileid)
									.setColor(3447003)
									.addField("Subscriptions", info.subscriptions, true)
									.addField("File Size", filesize(info.file_size, {
										round: 3
									}), true)
									.addField("Last Updated", helper.parseTime(info.time_updated), true)
									.addField("Date Uploaded", helper.parseTime(info.time_created), true)
									.setThumbnail(info.preview_url);

								embed.addField("Spawn Locations", `👼 ${entlist["spawn points"] || 0}`, true);
								embed.addField("Traitor Buttons", `🎯 ${entlist["ttt_traitor_button"] || 0}`, true);
								embed.addField("Sniper Ammo", `🍆 ${entlist["sniper ammo"] || 0}`, true);
								embed.addField("Rifle Ammo", `🍑 ${entlist["rifle ammo"] || 0}`, true);
								embed.addField("Shotgun Ammo", `🥔 ${entlist["shotgun ammo"] || 0}`, true);
								embed.addField("Pistol Ammo", `🍅 ${entlist['pistol ammo'] || 0}`, true);

								embed.setFooter(msg.member.displayName, msg.author.avatarURL);
								embed.setTimestamp();

								console.log("Addon", info);
								fs.unlink(gmapath, function (err) {
									CurrentlyWorking = false;
								});

								if (msgs.length > 0)
									msgs.forEach(function(val, indx, arr) {
										val.delete();
									});

								msg.channel.send(embed).then(function (emsg) {
									let reg = '🚀';
									let mc = '🏎';

									emsg.react(reg).then(function () {
										emsg.react(mc).then(function () {
											let act = emsg.createReactionCollector((r, u) => (r.emoji.name === reg || r.emoji.name === mc) && u.id === msg.author.id, {
												time: 900000
											});

											act.on('collect', r => {
												let btn = r.emoji.name;
												if (btn !== mc && btn !== reg)
													return;

												let type = (btn === mc)?'mc':'reg';
												let dir = `/var/www/lola/repos/moat-gg-maps-${type}/`;
												fs.ensureDirSync(`${dir}lua/autorun/server/`);
						
												shell.cp('-R', `/var/www/lola/addons/${info.publishedfileid}/maps/`, dir);

												let luafile = `lua/autorun/server/${info.publishedfileid}.lua`;
												let dlfile = `if (game.GetMap() == '${mapname}') then resource.AddWorkshop(${info.publishedfileid}) end`;

												fs.outputFile(dir + luafile, dlfile, function(err) {
													shell.rm('-rf', `/var/www/lola/addons/${info.publishedfileid}/`);

													msg.reply(`Okay, deploying ${mapname} to all ${(btn === mc)?'minecraft':'regular'} map servers now.`)

													var deploy_start = new Date();
													shell.exec(`sh ${dir}../${type}.sh 'maps/${mapname}.bsp' '${luafile}'`, function(code, stdout, stderr) {
														if (stdout.match('Deployment Finished done')) {
															var deploy_end = new Date() - deploy_start;
															msg.reply(`Finished deploying to ${(btn === mc)?'all 7 mc':'all 17 regular'} servers. (Took ${Math.floor(deploy_end/1000)} secs)`)
														}
													});
												});
											});
										});
									})
								})
							})
							.read();
					});
				};
			}, function (err) {
				console.log(err)
			});
		});

	}
};
