const { SlashCommandBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;
const { Character, User } = require("../../models");

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

		const userId = interaction.user.id;

		try {
			//gets by user
			const user = await User.findByPk(userId, {
				include: ["currentCharacter"],
			});
			if (!user) {
				return interaction.reply("Você não possui personagens");
			}
			if (!user.currentCharacter) {
				return interaction.reply("Você não possui um personagem selecionado");
			}

			// Updates character
			//TODO: description reseting if not provided during edit
			const affectedRows = await Character.update(
				{ name: characterName },
				{ description: characterDescription },
				{
					where: {
						id: user.currentCharacterId,
						userId: userId,
					},
				},
			);

			if (affectedRows > 0) {
				return interaction.reply(`Personagem ${characterName} foi editado`);
			}

			return interaction.reply(`Este personagem não existe ${characterName}.`);
		} catch (error) {
			return interaction.reply("Something went wrong with edit character");
		}
	},
};
