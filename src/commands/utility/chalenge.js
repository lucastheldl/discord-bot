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
		const enemyUserName = interaction.options.getString("name");

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
			const enemyCharacter = await Character.findOne({
				where: { username: enemyUserName },
				/* include: [
					{
						model: Item,
						through: { attributes: ["quantity", "equipped"] },
					},
					//incluir poderes tbm
				], */
			});
			//todo:Check if they are in the same place to fight otherwise return

			//todo:pegar poderes do personagem
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

			await interaction.reply({
				embeds: [battleEmbed],
				components: rows,
			});

			// Create a button collector
			const collector = interaction.channel.createMessageComponentCollector({
				time: 30000, // Button expires after 30 seconds
			});

			collector.on("collect", async (buttonInteraction) => {
				if (!buttonInteraction.customId.startsWith("power_")) return;

				const powerId = buttonInteraction.customId.split("_")[1];
				const power = powers.find((p) => p.id === Number.parseInt(powerId));

				if (!power) return;

				// Calculate hit or miss based on power accuracy
				const hit = Math.random() * 100 <= power.accuracy;

				const resultEmbed = new EmbedBuilder()
					.setColor(hit ? 0x00ff00 : 0xff0000)
					.setTitle(`${character.name} used ${power.name}!`)
					.setDescription(
						hit
							? `✨ The attack hit! Dealing ${power.damage} damage!`
							: "❌ The attack missed!",
					);

				await buttonInteraction.reply({
					embeds: [resultEmbed],
				});
			});

			// Disable all buttons when collector expires
			collector.on("end", () => {
				// biome-ignore lint/complexity/noForEach: <explanation>
				rows.forEach((row) => {
					// biome-ignore lint/complexity/noForEach: <explanation>
					row.components.forEach((button) => button.setDisabled(true));
				});

				interaction
					.editReply({
						components: rows,
					})
					.catch(console.error);
			});
		} catch (error) {
			console.error("Chalenge command error:", error);
			return interaction.reply("Ocorreu um erro ao desafiar personagem.");
			/* return interaction.reply(
            "Something went wrong with chalenging a character",
        ); */
		}
	},
};
