const { SlashCommandBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;
const { Character, Item } = require("../../models");
const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("chalenge")
		.setDescription("Desafie um personagem para batalha")
		.addStringOption((option) =>
			option
				.setName("name")
				.setDescription("Nome do usuário")
				.setRequired(true),
		),
	async execute(interaction) {
		const username = interaction.user.username;

		try {
			const character = await Character.findOne({
				where: { username: username },
				/* include: [
					{
						model: Item,
						through: { attributes: ["quantity", "equipped"] },
					},
					//incluir poderes tbm
				], */
			});
			const powers = [
				{ name: "fire ball", id: 1, accuracy: 2, damage: 100 },
				{ name: "water attack", id: 2, accuracy: 2, damage: 100 },
			];

			const rows = [];
			let currentRow = new ActionRowBuilder();

			powers.forEach((power, index) => {
				const button = new ButtonBuilder()
					.setCustomId(`power_${power.id}`)
					.setLabel(power.name)
					.setStyle(ButtonStyle.Primary);

				currentRow.addComponents(button);

				// Discord allows max 5 buttons per row
				if (currentRow.components.length === 5 || index === powers.length - 1) {
					rows.push(currentRow);
					currentRow = new ActionRowBuilder();
				}
			});

			const battleEmbed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle("Batalha!")
				.setDescription("Selecione seu melhor ataque e vença seu oponente")
				.addFields(
					powers.map((power) => ({
						name: power.name,
						value: `Damage: ${power.damage}\nAccuracy: ${power.accuracy}%`,
						inline: true,
					})),
				)
				.setThumbnail("https://i.imgur.com/m8pGaD3.jpeg");

			return await interaction.reply({
				embeds: [battleEmbed],
				components: rows,
			});
		} catch (error) {
			console.error("Chalenge command error:", error);
			return interaction.reply("Ocorreu um erro ao desafiar personagem.");
			/* return interaction.reply(
            "Something went wrong with getting character inventory",
        ); */
		}
	},
};
