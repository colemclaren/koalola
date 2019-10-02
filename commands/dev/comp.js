const commando = require('discord.js-commando');

module.exports = class Comp extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'comp',
			group: 'dev',
			aliases: ['compensate', 'c'],
			memberName: 'comp',
			description: 'Respond to a compensation ticket.',
			ownerOnly: true,
			args: [{
				key: 'id',
				label: 'CompID',
				prompt: 'What\'s the ID of the compensation ticket?',
				type: 'integer'
			},
			{
				key: 'status',
				label: 'Y/N',
				prompt: 'Is this ticket a `Yes` or a `No`?',
				type: 'string',
				validate: str => {
					return str.toLowerCase().match(/no|n|nope|nu|ne|yes|ya|y|ye|yup|sure/gm) ? true : 'Is this ticket a `Yes` or a `No`?'
				},
				parse: str => {
					return str.toLowerCase().match(/yes|ya|y|ye|yup|sure/gm) ? 2 : 3;
				}
			}],
			weightPermissions: 100,
			examples: [
				/* Command Emoji */ ':gift_heart:',
				/* Command Image */ ''
			]
		});
	}

	run(msg, args) {
		this.client.db.query("UPDATE moat_comps SET approved = ? WHERE ID = ?", [args.status, args.id], function (err, result) {
			if(err) return msg.genericError();

			if(result.changedRows === 1) {
				if(args.status == 2) msg.basicEmbed('Successfully updated compensation ticket. (Approved)');
				else msg.basicEmbed("Successfully updated compensation ticket. (Denied)");

			} else msg.basicEmbed('Unable to update compensation ticket.', true);
		});
	}
};