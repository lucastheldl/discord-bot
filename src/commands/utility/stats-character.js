const { SlashCommandBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;
const { Character } = require("../../models/character");
const { EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("stats")
		.setDescription("Edit a character")
		.addStringOption((option) =>
			option
				.setName("name")
				.setDescription("Nome do personagem")
				.setRequired(true),
		),
	async execute(interaction) {
		const characterName = interaction.options.getString("name");

		try {
			const character = await Character.findOne({
				where: { name: characterName },
			});

			if (!character) {
				return interaction.reply(
					`Este personagem não existe ${characterName}.`,
				);
			}

			const statsEmbed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(`Perfil de ${character.name}`)
				.setDescription(character.description)
				.addFields(
					{ name: "🔹 Class", value: "A", inline: true },
					{ name: "🔸 Level", value: "677", inline: true },
					{ name: "🔸 Level", value: "677", inline: true },
					{ name: "🔸 Level", value: "677", inline: true },
					{ name: "\u200B", value: "\u200B", inline: true }, // Empty field for spacing
					/* { name: "Class", value: character.class, inline: true },
					{ name: "Level", value: character.level.toString(), inline: true }, */
					/* { name: "Health", value: `${character.health}/100`, inline: true },
					{ name: "Mana", value: `${character.mana}/50`, inline: true }, */

					{
						name: "🏆 Achievements",
						value:
							"• Defeated the Dragon\n• Saved the Kingdom\n• Found the Lost Artifact",
						inline: false,
					},
				)
				.setImage("https://via.placeholder.com/400x200");

			return await interaction.reply({ embeds: [statsEmbed] });
		} catch (error) {
			return interaction.reply("Something went wrong with edit character");
		}
	},
};
