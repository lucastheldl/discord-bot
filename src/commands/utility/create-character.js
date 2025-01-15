const { SlashCommandBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;
const { Character, Item } = require("../../models");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("character")
		.setDescription("Create a character")
		.addStringOption((option) =>
			option
				.setName("name")
				.setDescription("Nome do seu personagem")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("description")
				.setDescription("Descrição do seu personagem")
				.setRequired(true),
		),
	async execute(interaction) {
		const characterName = interaction.options.getString("name");
		const characterDescription = interaction.options.getString("description");

		try {
			const character = await Character.create({
				name: characterName,
				description: characterDescription,
				username: interaction.user.username,
				max_health: 100,
				max_energy: 100,
				current_health: 100,
				current_energy: 100,
				class: "B",
			});
			const item = await Item.create({
				name: "Sword",
				type: "weapon",
				damage: 10,
				class: "B",
			});

			await character.addItem(item, {
				through: { quantity: 1, equipped: false },
			});

			return interaction.reply(`Character ${character.name} created.`);
		} catch (error) {
			if (error.name === "SequelizeUniqueConstraintError") {
				return interaction.reply("Character already exists");
			}
			throw new Error(error);
			//return interaction.reply("Something went wrong with creating character");
		}
	},
};
