const { Events } = require("discord.js");
const { Character } = require("../models/character");
const { Vehicle } = require("../models/vehicle");
module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		await Promise.all([Character.sync(), Vehicle.sync()]);
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};
