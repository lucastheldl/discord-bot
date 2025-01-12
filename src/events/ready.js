const { Events } = require("discord.js");
const { Player } = require("../models/player");
module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		Player.sync();
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};
