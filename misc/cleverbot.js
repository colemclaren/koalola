module.exports = {
	respond: function (msg) {
		msg.channel.startTyping();

		fs.readFile('/var/www/lola/root-moviereviews.txt', {'flag': 'r'}, function(err, data) {
			if (err) throw err;

			if (data) {
				let quotes = data.split('\n');
				let rng = Math.floor(math.random() * quotes.length);

				msg.channel.send(quotes[rng]);
				msg.channel.stopTyping(true);
			}
		});
	},
	
	shouldRespond: function (msg, client) {
		if(msg.author.bot) return false;

		let content = msg.content.toLowerCase();
		if (content.includes('update') || content.includes('when')) return false;

		if((content.includes('lola') || content.includes('<@!322373455632662530>') || content.includes('<@!462414378352771123>')) ||
			(client.provider.get('global', 'cleverbot') && client.provider.get('global', 'cleverbot').includes(msg.author.id))) return true;
		return false;
	}
};