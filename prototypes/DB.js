const {Client} = require('discord.js-commando');
const cfg = require('./../config').sql;
const mysql = require('mysql');
const connection = mysql.createConnection({
	host: cfg.host,
	user: cfg.user,
	password: cfg.password,
	database: cfg.database,
	charset: 'utf8mb4',
	supportBigNumbers: true,
	typeCast: function castField(field, next) {
		return field.type === "BIT" && field.length === 1 ? field.buffer()[0] === 1 : next();
	}
});

connection.connect();

Client.prototype.db = connection;

Client.prototype.easyQuery = function (query, args = []) {
	return new Promise((resolve, reject) => {
		this.db.query(query, args, function (err, res) {
			if(err) return reject(err);

			resolve(res);
		});
	});
};

Client.prototype.getSteamID = async function (id) {
	const steamid = await this.easyQuery('SELECT steamid FROM core_members WHERE discord_id = ?', id);
	return !steamid || !steamid[0] || !steamid[0].steamid ? null : steamid[0].steamid;
};