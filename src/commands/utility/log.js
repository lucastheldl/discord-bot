const { SlashCommandBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;
const { Character, Item } = require("../../models");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("entrar")
		.setDescription("Realiza login como um de seus personagens")
		.addStringOption((option) =>
			option
				.setName("name")
				.setDescription("Nome do seu personagem")
				.setRequired(true),
		),

	async execute(interaction) {
		const userId = interaction.user.id;
		const characterName = interaction.options.getString("name");

		try {
			const character = await Character.findOne({
				where: { name: characterName, userId: userId },
			});

			if (!character) {
				return interaction.reply("Este usuário não possui este personagem.");
			}

			return interaction.reply(`Entrou como persoangem: ${character.name}.`);
		} catch (error) {
			if (error.name === "SequelizeUniqueConstraintError") {
				return interaction.reply("Character dont exists");
			}
			throw new Error(error);
			//return interaction.reply("Something went wrong with creating character");
		}
	},
};
