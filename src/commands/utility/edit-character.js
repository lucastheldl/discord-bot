const { SlashCommandBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;
const { Character } = require("../../models/character");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("edit")
		.setDescription("Edit a character")
		.addStringOption((option) =>
			option
				.setName("name")
				.setDescription("Nome do seu personagem")
				.setRequired(false),
		)
		.addStringOption((option) =>
			option
				.setName("description")
				.setDescription("Descrição do seu personagem")
				.setRequired(false),
		),
	async execute(interaction) {
		const characterName = interaction.options.getString("name");
		const characterDescription = interaction.options.getString("description");

		try {
			const affectedRows = await Character.update(
				{ description: characterDescription },
				{ where: { name: characterName } },
			);

			if (affectedRows > 0) {
				return interaction.reply(`Personagem ${tagName} foi editado`);
			}

			return interaction.reply(`Este personagem não existe ${characterName}.`);
		} catch (error) {
			return interaction.reply("Something went wrong with edit character");
		}
	},
};
