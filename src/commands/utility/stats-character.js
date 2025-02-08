const { SlashCommandBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;
const { User, Planet, Character, Location } = require("../../models");
const { EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("stats")
		.setDescription("Editar um personagem"),
	async execute(interaction) {
		const userId = interaction.user.id;

		try {
			//gets by user
			const user = await User.findByPk(userId, {
				include: [
					{
						model: Character,
						as: "currentCharacter",
						include: [
							{ model: Planet, as: "currentPlanet" },
							{ model: Location, as: "currentLocation" },
						],
					},
				],
			});
			if (!user) {
				return interaction.reply("Você não possui personagens");
			}
			//check if theres a character
			if (!user.currentCharacter) {
				return interaction.reply("Você não possui um personagem selecionado.");
			}

			const statsEmbed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(`Perfil de ${user.currentCharacter.name}`)
				.setDescription(user.currentCharacter.description)
				.addFields(
					{
						name: "🔹 Classe",
						value: user.currentCharacter.class,
						inline: false,
					},
					{
						name: "❤ Vida",
						value: `${user.currentCharacter.current_health}/${user.currentCharacter.max_health}`,
						inline: false,
					},
					{
						name: "✨ Energia",
						value: `${user.currentCharacter.current_energy}/${user.currentCharacter.max_energy}`,
						inline: false,
					},
					{ name: "\u200B", value: "\u200B", inline: false }, // Empty field for spacing
					{
						name: "🏆 Achievements",
						value:
							"• Defeated the Dragon\n• Saved the Kingdom\n• Found the Lost Artifact",
						inline: false,
					},
					{
						name: "🗺 Local",
						value: `• Planeta ${user.currentCharacter.currentPlanet.name}\n• ${user.currentCharacter.currentLocation.name}\n`,
						inline: false,
					},
				)
				.setThumbnail("https://i.imgur.com/AfFp7pu.png");

			return await interaction.reply({ embeds: [statsEmbed] });
		} catch (error) {
			throw new Error(error);
			//return interaction.reply("Something went wrong with edit character");
		}
	},
};
