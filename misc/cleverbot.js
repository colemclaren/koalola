let convos = [];

module.exports = {
	respond: function (msg) {
		msg.channel.startTyping();

		const cleverbotAsPromised = require('cleverbot-as-promised');
		const cleverbot = new cleverbotAsPromised('CC2py1x7USMvycwPdHk9ee5owBw');
		const id = msg.author.id;
		const date = new Date();

		convos[id] = {
			last: date,
			cid: 0
		};

		let newMsg = msg.content.toLowerCase().replace('lola', 'cleverbot').replace('<@!462414378352771123>', 'cleverbot');
		let input = {input: newMsg, tweak1: 0, tweak2: 0, tweak3: 0};
		convos[id].last = date;

		input.cd = convos[id].cs;
		cleverbot.getReply(input).then(res => {

			msg.reply(res.output.replace('cleverbot', 'lola').replace('Cleverbot', 'Lola'));
			convos[id].cid = res.cs;
		});

		msg.channel.stopTyping(true);
	},
	
	shouldRespond: function (msg, client) {
		//return false; //todo remove
		if(msg.author.bot) return false;

		let content = msg.content.toLowerCase();
		if (content.includes('update') || content.includes('when')) return false;

		if((content.includes('lola') || content.includes('<@!322373455632662530>') || content.includes('<@!462414378352771123>')) ||
			(client.provider.get('global', 'cleverbot') && client.provider.get('global', 'cleverbot').includes(msg.author.id))) return true;
		return false;
	}
};