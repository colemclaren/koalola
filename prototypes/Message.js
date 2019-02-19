const {Message} = require('discord.js');
let helper = require('../classes/CommandHelper');
helper = new helper();

Message.prototype.basicEmbed = function (desc, error = false) {
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

Message.prototype.genericError = function (code = 0) {
	let desc = 'An error was encountered.';
	if(code) desc += ` Code: ${code}`;

	return this.basicEmbed(desc, true);
};
module.exports = Message;
