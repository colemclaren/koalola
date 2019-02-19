const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class Help extends commando.Command {
	constructor(client)   {
		  super(client,      {
			 name             : 'help',
			 group            : 'info',
			 memberName       : 'help',
			 description      : 'Displays a list of available commands, or detailed information for a specified command.',
			 guarded          : true,
			 args             : [{
				key              : 'Command',
				label			 : 'Command?',
				prompt           : 'What command can I help you with?',
				type             : 'string',
				default          : ''
			 }],
			 weightPermissions: 0,
			 examples: [
				/* Command Emoji */ ':information_desk_person:',
				/* Command Image */ ''
			]
		  });
	}

	async run(msg, args) {
		const cmdPrefix = this.client.commandPrefix;
		const groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(args.Command, false, msg);
		const showAll = args.Command && args.Command.toLowerCase() === 'all';

		let userRole = msg.member.highestRole.name || '@everyone';
		let userWeight = helper.rankWeight[userRole] || 0;
		let bigGun = this.client.isOwner(msg.author);

		if(args.Command && !showAll) {
			if(commands.length === 1) {
				let cmd = commands[0];
				let embed = new RichEmbed()
					.setAuthor('💁‍ ' + cmd.name.charAt(0).toUpperCase() + cmd.name.slice(1) + ' Command', 'https://cdn.moat.gg/f/dark_blue.png')
					.setColor(3447003)
					.setDescription(cmd.description);

				if(cmd.format) embed.addField('Usage', `${cmdPrefix + cmd.name} ${cmd.format}`);
				if(cmd.aliases.length > 0) embed.addField('Aliases', cmd.aliases.join(', '), true);
				if(cmd.details) embed.addField('Details', cmd.details, true);
				//if(cmd.examples) embed.addField('Examples', cmd.examples.join('\n'), true);
				
				msg.reactRemovable(embed);
			}
			else if(commands.length > 1) {
				return msg.basicEmbed(disambiguation(commands, 'commands'));
			}
			else {
				return msg.basicEmbed('Unable to identify command.', true)
			}
		}
		else {
			const hide = [
				'groups',
				'enable',
				'disable',
				'reload',
				'load',
				'unload',
			];

			let cmds = {
				'user'  : [],
				'info'  : [],
				'staff' : [],
				'dev'   : []
			};

			function canRunCommand(name, format, description, weight, group, custom = [':pencil2:']) {
				if (hide.includes(name)) return false;
				if (userWeight < weight && !bigGun) return false;
				if (!cmds[group]) return false;

				if (!custom || !custom[0])
					custom = [':pencil2:'];

				cmds[group].push({
					name: `${custom[0]} ${cmdPrefix + name} ${format || ''}`,
					value: description
				})
			}

			let message = `Use ${this.usage('[command]', null, null)} to view detailed information about a specific command.\n`

			for (let group of groups.array()) {
				for (let cmd of group.commands.array()) {
					if(!cmd.isUsable(msg)) continue;
					canRunCommand(cmd.name, cmd.format, cmd.description, cmd.weightPermissions, cmd.group.id, cmd.examples)
				}
			}

			let staff = cmds['staff'].length > 1,
				dev = cmds['dev'].length > 1;

			let navAll = staff ? ` | Staff Commands${dev ? ' | More':''}`:'',
				navStaff = dev ? ' | More':'';

			let view = [
				{text: message, header: '-> Info Commands <- | User Commands' + navAll, fields: cmds['info']},
				{text: message, header: 'Info Commands | -> User Commands <-' + navAll, fields: cmds['user']}
			];

			if (cmds['staff'].length > 0) view.push({text: message, header: 'Info Commands | User Commands | -> Staff Commands <-' + navStaff, fields: cmds['staff']});
			if (cmds['dev'].length > 0) view.push({text: message, header: 'Info Commands | User Commands | Staff Commands | -> More <- ', fields: cmds['dev']});

			msg.pageEmbed(view);
		}
	}
};