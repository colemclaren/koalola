const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');
let helper = require('../../classes/CommandHelper');
helper = new helper();

module.exports = class Giveaway extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'giveaway',
			group: 'dev',
			memberName: 'giveaway',
			description: 'Start a giveaway.',
			args: [
				{
					key: 'channel',
					label: 'Channel',
					prompt: 'What\'s the channel to host the giveaway in?',
					type: 'channel'
				},
				{
					key: 'title',
					label: 'Title',
					prompt: 'What\'s the title of the giveaway?',
					type: 'string'
				},
				{
					key: 'desc',
					label: 'Description',
					prompt: 'What\'s the description of the giveaway?',
					type: 'string',
				}, {
					key: 'num',
					label: 'Winners',
					prompt: 'What\'s the number of winners for the giveaway?',
					type: 'integer',
				},{
					key: 'length',
					label: 'Length',
					prompt: 'Enter the __number__ before the time unit for giveaway length. (time unit is next)',
					type: 'integer',
					parse: int => {
						return int.toString();
					}
				}, {
					key: 'unit',
					label: 'TimeUnit',
					prompt: 'Now the __time unit__ for the number you just entered.  \n```\nseconds, minutes, hours, days, weeks, etc\n```',
					type: 'string',
					validate: str => {
						return helper.validateUnit(str);
					},
					parse: str => {
						return helper.parseUnit(str);
					}
				}],
			weightPermissions: 100,
			examples: [
				/* Command Emoji */ ':cop:',
				/* Command Image */ ''
			]
		});
	}

	async hasPermission(msg) {
		return await helper.canRunCommand(msg, 'lua');
	}

	async run(msg, args) {
		const time = args.length * (helper.length[args.unit + 's'] || helper.length[args.unit]),
			futureTime = new Date((Math.round(new Date().getTime() / 1000) + time) * 1000);

		const embed = new RichEmbed()
			.setTitle(args.title)
			.setDescription(`${args.desc}\nReact with 🎉 to enter!`)
			.setFooter(`Giveaway ends on ${futureTime.getUTCMonth() + 1}/${futureTime.getUTCDate()}/${futureTime.getUTCFullYear()} at ${futureTime.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })} UTC`)
			.setColor('3399FF');

		msg.guild.channels.get(args.channel.id).send({embed}).then(m => {
			m.react('🎉');

			this.client.db.query("INSERT INTO discord.bad_giveaway (guild, channel, message, winner_num, time) VALUES (?, ?, ?, ?, UNIX_TIMESTAMP() + ?);", [m.guild.id, m.channel.id, m.id, args.num, time], function (err) {
				if(err) return console.error(err);
			});

			/*let giveaways = this.client.provider.get('global', 'giveaways', []);
			giveaways.push([m.guild.id, m.channel.id, m.id, args.num, futureTime, false]);

			this.client.provider.set('global', 'giveaways', giveaways);*/
		});
	}
};