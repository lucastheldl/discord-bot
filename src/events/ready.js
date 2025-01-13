const { Events } = require("discord.js");
const { Character, CharacterItem, Vehicle, Item } = require("../models");

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		await Promise.all([
			Character.sync(),
			Vehicle.sync(),
			Item.sync(),
			CharacterItem.sync(),
		]);
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};
