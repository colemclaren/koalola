const {RichEmbed} = require('discord.js');
const math = require('mathjs');

module.exports = {
	shouldRespond: function (msg) {
		return !/process|return|{|}|:|constructor|eval|parse|createUnit|simplify|derivative|import|hm|_|true|=/.test(msg.content);
	},

	respond: function (msg) {
		let res = math.eval(msg.content);

		if(module.exports.shouldSendResponse(msg, res)) msg.channel.send(math.format(res, {precision: 14}));
	},

	shouldSendResponse: function (msg, res) {
		return res && (typeof res === 'string' || typeof res === 'number') && /\d/.test(res) && msg.content != res;
	}
};