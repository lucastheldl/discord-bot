const { SlashCommandBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;
const { Planet, Location } = require("../../models");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("gerar")
		.setDescription("Create a character"),
	async execute(interaction) {
		try {
			// Use a transaction to ensure data consistency

			const planet = await Planet.create({
				name: "L4",
				description: "Primeiro planeta do universo",
				class: "B",
				type: "rock",
			});

			await Location.create({
				name: "L4 location 1",
				description: "Um local inexplorado",
				type: "city",
				population: 4,
				capital: 3,
				planetId: planet.id,
			});
			await Location.create({
				name: "L4 location 2",
				description: "Um local inexplorado",
				type: "natural",
				population: 0,
				capital: 0,
				planetId: planet.id,
			});

			return interaction.reply(`Objetos gerados`);
		} catch (error) {
			throw new Error(error);
			//return interaction.reply("Something went wrong with creating character");
		}
	},
};
