const { Events } = require("discord.js");
const { Character } = require("../models/character");
module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		Character.sync();
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};
