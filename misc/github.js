let crypto = require('crypto');
let helper = require('../classes/CommandHelper');
helper = new helper();

const fs = require('fs');
const exec = require('child_process').exec;
const performance = require('perf_hooks').performance;
const reactions = ['🔥', '🎉', '🚀', '❤', '😩', '👌', '😚', '🤔', '👀'];
let ftp = require('ftp-deploy');
ftp = new ftp();

async function addReactions(m) {
	for(const reaction of reactions) {
		await m.react(reaction);
	}
}

var user = "moatato";
var token = "d0168e37455d9f7cca30c5b433be7662a2930edc";
var secret = "tMJ^MgHV6IcEq@YRx93@V3b%*w%qRJ2h";
var repos = {
	"123634081": ["TTT", 3447003, 'https://cdn.moat.gg/f/c8046.png'],
	"123657807": ["Website", 29183, 'https://cdn.moat.gg/f/c8046.png'],
	"138541243": ["Lola Bot", 7506394, 'https://cdn.moat.gg/f/a0238.png'],
};

module.exports = {
	deploy: function (req, res, client) {
		/*let sig = "sha1=" + crypto.createHmac('sha1', secret).update(JSON.stringify(req.body)).digest('hex');
		let data = req.body;

		if (req.headers['x-hub-signature'] == sig && repos[data.repository.id]) {
			var embedcol = 3447003

			if(bod.head_commit.message.startsWith("Merge")) {
				return res.sendStatus(200);
			}

			if(bod.ref.split("/")[2] == "dev") {
				bod.ref = "(for the next TTT update)"
			}

			if(bod.head_commit.message.trim().startsWith(":")) {
				bod.head_commit.message = "This change has been marked as private, so it's hidden."

				client.channels.get("419270052710449162").send({
					embed: {
						color: embedcol,
						author: {
							name: bod.head_commit.committer.name,
							icon_url: bod.sender.avatar_url
						},
						title: helper.randomValue(helper.emojis.good) + " TTT: " + bod.head_commit.message,
						timestamp: new Date()
					}
				}).then(addReactions);
				return res.sendStatus(200);
			}

			client.channels.get("419270052710449162").send({
				embed: {
					color: embedcol,
					author: {
						name: bod.head_commit.committer.name,
						icon_url: bod.sender.avatar_url
					},
					title: helper.randomValue(helper.emojis.good) + " TTT: " + bod.head_commit.message,
					//description: bod.ref,
					timestamp: new Date(),
					footer: {
						icon_url: "https://cdn.moat.gg/f/zvqLUlUIwexJDQ25wgBH4AIfQdr5.png",
						text: "via " + bran + " branch"
					}
				}
			}).then(addReactions);

			let t0 = performance.now();

			let checkout = data.repository.clone_url.replace('github.com', `${user}:${token}@github.com`);
			let repo = repos[data.repository.id];
			let branch = data.ref.split('/')[2];
			let dir = repo.local// + '/' + branch;

			for (let commit of data.commits) {
				let files = [];
				for (let path of commit.removed) {
					if (path) files.push(path);
				}

				for (let path of commit.added) {
					if (path) files.push(path);
				}

				for (let path of commit.modified) {
					if (path) files.push(path);
				}

				if (commit.message.trim().startsWith(":")) {
					commit.message = "This change has been marked as private, so it's hidden.";
				}

				commit.message = commit.message.replace(/^\w/, c => c.toUpperCase());
				client.channels.get("474516361469755404").send({
					embed: {
						color: 3447003,
						author: {
							name: commit.author.username,
							icon_url: data.sender.avatar_url
						},
						title: helper.randomValue(helper.emojis.good) + " TTT: " + bod.head_commit.message,
						description: bod.,
						timestamp: new Date(),
						footer: {
							icon_url: data.sender.avatar_url,
							text: commit.author.username
						}
					}
				}).then(addReactions);

			}

			client.channels.get("474516361469755404").send({
				embed: {
					color: 3447003,
					author: {
						name: bod.head_commit.committer.name,
						icon_url: bod.sender.avatar_url
					},
					title: helper.randomValue(helper.emojis.good) + " TTT: " + bod.head_commit.message,
					//description: bod.ref,
					timestamp: new Date(),
					footer: {
						icon_url: "https://cdn.moat.gg/f/zvqLUlUIwexJDQ25wgBH4AIfQdr5.png",
						text: "via " + bran + " branch"
					}
				}
			}).then(addReactions);

			/*
			client.channels.get("474516361469755404").send(`Initiating auto deployment for ${data.repository.name}/${data.ref.split('/')[2]} with ${files.length} file change${files.length == 1 ? "" : "s"}...`);
			exec('sudo bash /var/www/discord-bot/repos/deploy.sh', (err, stdout, stderr) => {
				let t1 = performance.now();
				if (err) {
					console.log({err});
					//client.channels.get("474516361469755404").send(`deployment error: \`\`\`\n${err}\n\`\`\``);
					return;
				}

				console.log({stdout}); //client.channels.get("474516361469755404").send(`\`\`\`\n${stdout}\n\`\`\``);
				console.log({stderr});

				client.channels.get("474516361469755404").send(`Full deployment for ${data.repository.name}/${data.ref.split('/')[2]} took ${Number((t1 - t0) * 0.001).toFixed(2)} secs..\n(${data.compare})`);
			});

			exec('cd ' + dir + ' && sudo git checkout ' + branch + ' && sudo git pull ' + checkout, (err, stdout, stderr) => {
				let t1 = performance.now();

				if (err) {
					client.channels.get("474516361469755404").send(`local update error: \`\`\`\n${err}\n\`\`\``);
					return;
				}

				client.channels.get("474516361469755404").send(`\`\`\`\n${stdout}\n\`\`\``);
				client.channels.get("474516361469755404").send(`local update for ${data.repository.name}/${data.ref.split('/')[2]} took ${Number((t1 - t0) * 0.001).toFixed(2)} secs..\n(${data.compare})`);

				let t2 = performance.now();
				let remove = [];
				let files = [];

				for (let commit of data.commits) {
					for (let path of commit.removed) {
						if (path) remove.push(path);
					}

					for (let path of commit.added) {
						if (path) files.push(path);
					}

					for (let path of commit.modified) {
						if (path) files.push(path);
					}
				}

				for (let sid in repo.servers) {
					let t3 = performance.now();
					let server = repo.servers[sid];
					server.localRoot = dir;
					server.exclude = [];
					server.include = files;

					console.log(files);
					console.log(remove);
					console.log(dir);
					console.log(server);

					exec('cd ' + dir + ' && sudo git ftp push -u "' + server.user + '" -p "' + server.password + '" ftp://' + server.host + ':' + server.port + '/' + server.remoteRoot + ' -vv', (err2, stdout2, stderr2) => {
						let t4 = performance.now();
						if (err2) {
							client.channels.get("474516361469755404").send(`${sid} deploy error: \`\`\`\n${err2}\n\`\`\``);
							return;
						}

						client.channels.get("474516361469755404").send(`remote deploy for ${sid} on ${data.repository.name}/${data.ref.split('/')[2]} took ${Number((t4 - t3) * 0.001).toFixed(2)} secs..`);
					});

					/*
					ftp.deploy(server, function(err, res) {
						let t4 = performance.now();
						if (err) {
							client.channels.get("474516361469755404").send(`${sid} deploy error: \`\`\`\n${JSON.stringify(err, null, 4)}\n\`\`\``);
							return;
						}

						client.channels.get("474516361469755404").send(`remote deploy for ${sid} on ${data.repository.name}/${data.ref.split('/')[2]} took ${Number((t4 - t3) * 0.001).toFixed(2)} secs..\`\`\`\n${res}\n\`\`\``);
					});

					ftp.on('uploading', function(d) {
						console.log('Upload Queue: ' + d.totalFilesCount);
						console.log('Upload Done: ' + d.transferredFileCount);
						console.log('Upload File: ' + d.filename);
					});
					ftp.on('uploaded', function(d) {
						console.log(d);
					});
					ftp.on('log', function(d) {
						console.log(d);
					});
					ftp.on('upload-error', function(d) {
						console.log(JSON.stringify(d, null, 4));
					});
					ftp.on("log", d => console.log("[log]", d));
					ftp.on("uploading", d => console.log("[uploading]", d));
					ftp.on("uploaded", d => console.log("[uploaded]", d));
					ftp.on("upload-error", d => console.log("[upload-error]", d));
				}

			});
		}*/

		return res.sendStatus(200);
	},
	handle: function (bod, res, client) {
		var bran = bod.ref.split("/")[2]
		var embedcol = 3447003

		if(bod.ref.split("/")[2] == "inv2") {
			embedcol = 16312092
			bran = "MoatInventory-2.0"
		}

		if(bod.head_commit.message.startsWith("Merge")) {
			return res.sendStatus(200);
		}

		if(bod.ref.split("/")[2] == "dev") {
			bod.ref = "(for the next TTT update)"
		}

		if(bod.head_commit.message.startsWith(":")) {
			bod.head_commit.message = "This change has been marked as private, so it's hidden."

			client.channels.get("419270052710449162").send({
				embed: {
					color: embedcol,
					author: {
						name: bod.head_commit.committer.name,
						icon_url: bod.sender.avatar_url
					},
					title: helper.randomValue(helper.emojis.good) + " TTT: " + bod.head_commit.message,
					timestamp: new Date()
				}
			}).then(addReactions);
			return res.sendStatus(200);
		}

		client.channels.get("419270052710449162").send({
			embed: {
				color: embedcol,
				author: {
					name: bod.head_commit.committer.name,
					icon_url: bod.sender.avatar_url
				},
				title: helper.randomValue(helper.emojis.good) + " TTT: " + bod.head_commit.message,
				//description: bod.ref,
				timestamp: new Date(),
				footer: {
					icon_url: "https://cdn.moat.gg/f/zvqLUlUIwexJDQ25wgBH4AIfQdr5.png",
					text: "via " + bran + " branch"
				}
			}
		}).then(addReactions);
		return res.sendStatus(200);
	},

	handle2: function (bod, res, client) {
		let bran = bod.ref.split("/")[2]
		bod.ref = "(for moat.gg web)"

		if(bod.head_commit.message.startsWith("Merge"))
			return res.sendStatus(200);

		if(bod.head_commit.message.startsWith(":")) {
			bod.head_commit.message = "This change has been marked as private, so it's hidden."

			client.channels.get("419270052710449162").send({
				embed: {
					color: 3447003,
					author: {
						name: bod.head_commit.committer.name,
						icon_url: bod.sender.avatar_url
					},
					title: helper.randomValue(helper.emojis.good) + " Web: " + bod.head_commit.message,
					timestamp: new Date()
				}
			}).then(addReactions);
			return res.sendStatus(200);
		}

		client.channels.get("419270052710449162").send({
			embed: {
				color: 3447003,
				author: {
					name: bod.head_commit.committer.name,
					icon_url: bod.sender.avatar_url
				},
				title: helper.randomValue(helper.emojis.good) + " Web: " + bod.head_commit.message,
				timestamp: new Date(),
				footer: {
					icon_url: "https://cdn.moat.gg/f/zvqLUlUIwexJDQ25wgBH4AIfQdr5.png",
					text: "via " + bran + " branch"
				}
			}
		}).then(addReactions);

		return res.sendStatus(200);
	},
	/*
	-- old handle3 value, was for the resources repo (which is decomissioned now)
	handle3: function (bod, res, client) {
		let bran = bod.ref.split("/")[2]

		client.channels.get("419270052710449162").send({
			embed: {
				color: 16711813,
				author: {
					name: bod.head_commit.committer.name,
					icon_url: bod.sender.avatar_url
				},
				title: ":art: Resources: " + bod.head_commit.message,
				description: "Please [click here](https://github.com/MoatGaming/moat-resources/archive/master.zip) if you wish to download the latest resources pack. To apply it, extract the .zip file into your Garry's Mod `/addons` folder and restart your game.\nIn-depth instructions can be found in the [repository here](https://github.com/MoatGaming/moat-resources).\n\n(you are not required to download this to play)",
				timestamp: new Date(),
				footer: {
					icon_url: "https://cdn.moat.gg/f/zvqLUlUIwexJDQ25wgBH4AIfQdr5.png",
					text: "via " + bran + " branch"
				}
			}
		}).then(addReactions);

		return res.sendStatus(200);
	}
	*/
	handle3: function (bod, res, client) {
		let bran = bod.ref.split("/")[2]
		if(bod.head_commit.message.startsWith("Merge"))
			return res.sendStatus(200);

		if(bod.head_commit.message.startsWith(":")) {
			bod.head_commit.message = "This change has been marked as private, so it's hidden."

			client.channels.get("419270052710449162").send({
				embed: {
					color: 16711813,
					author: {
						name: bod.head_commit.committer.name,
						icon_url: bod.sender.avatar_url
					},
					title: helper.randomValue(helper.emojis.good) + " Lola: " + bod.head_commit.message,
					timestamp: new Date()
				}
			}).then(addReactions);
			return res.sendStatus(200);
		}

		client.channels.get("419270052710449162").send({
			embed: {
				color: 16711813,
				author: {
					name: bod.head_commit.committer.name,
					icon_url: bod.sender.avatar_url
				},
				title: helper.randomValue(helper.emojis.good) + " Lola: " + bod.head_commit.message,
				timestamp: new Date(),
				footer: {
					icon_url: "https://cdn.moat.gg/f/zvqLUlUIwexJDQ25wgBH4AIfQdr5.png",
					text: "via " + bran + " branch"
				}
			}
		}).then(addReactions);
		return res.sendStatus(200);
	}
};