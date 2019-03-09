const commando = require('discord.js-commando');
const {RichEmbed} = require('discord.js');

module.exports = class TestCmd extends commando.Command {
	constructor(client) {
		 super(client,     {
			name       : 'test',
			group      : 'info',
			memberName : 'test',
			description: 'qwertyuiopp',
			ownerOnly  : true
		 });
	}

	async run(msg) {
		msg.chooseServer();
	}
};

