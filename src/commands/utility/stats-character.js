const { SlashCommandBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;
const { Character } = require("../../models/character");
const { EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("stats")
		.setDescription("Editar um personagem"),
	/* .addStringOption((option) =>
			option
				.setName("name")
				.setDescription("Nome do personagem")
				.setRequired(true),
		), */
	async execute(interaction) {
		const username = interaction.user.username;

		try {
			const character = await Character.findOne({
				where: { username: username },
			});

			if (!character) {
				return interaction.reply("Este personagem não existe.");
			}

			const statsEmbed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(`Perfil de ${character.name}`)
				.setDescription(character.description)
				.addFields(
					{ name: "🔹 Classe", value: character.class, inline: false },
					{
						name: "❤ Vida",
						value: `${character.current_health}/${character.max_health}`,
						inline: false,
					},
					{
						name: "✨ Energia",
						value: `${character.current_energy}/${character.max_energy}`,
						inline: false,
					},
					{ name: "\u200B", value: "\u200B", inline: false }, // Empty field for spacing
					{
						name: "🏆 Achievements",
						value:
							"• Defeated the Dragon\n• Saved the Kingdom\n• Found the Lost Artifact",
						inline: false,
					},
				)
				.setThumbnail("https://i.imgur.com/AfFp7pu.png");

			return await interaction.reply({ embeds: [statsEmbed] });
		} catch (error) {
			return interaction.reply("Something went wrong with edit character");
		}
	},
};
