const wait = require("node:timers/promises").setTimeout;
const { Character, Item, User } = require("../../models");
const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageFlags,
	SlashCommandBuilder,
} = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("buscar")
		.setDescription("Anda pelos arredores"),
	async execute(interaction) {
		const userId = interaction.user.id;
		try {
			//TODO:cheks if theres a selected character
			const veicles = [
				{
					name: "Xll-40",
					id: 1,
					type: "Spaceship",
					armor: 100,
					damage: 70,
					class: "B",
				},
				{
					name: "Zex-pro",
					id: 2,
					type: "Spaceship",
					armor: 80,
					damage: 40,
					class: "C",
				},
			];

			const rows = [];
			let currentRow = new ActionRowBuilder();

			veicles.forEach((veicle, index) => {
				const button = new ButtonBuilder()
					.setCustomId(`veicle_${veicle.id}`)
					.setLabel(`${veicle.type}-${veicle.name}`)
					.setStyle(ButtonStyle.Primary);

				currentRow.addComponents(button);

				// Discord allows max 5 buttons per row
				if (
					currentRow.components.length === 5 ||
					index === veicles.length - 1
				) {
					rows.push(currentRow);
					currentRow = new ActionRowBuilder();
				}
			});
			await interaction.reply("Andando e inspecionando os arredores...");
			await wait(3000);

			const findingsEmbed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle("Achados:")
				.setDescription(
					"Após andar e olhar os arredores você encontra:\nSelecione algo para interagir ",
				);

			const followUpMessage = await interaction.followUp({
				embeds: [findingsEmbed],
				components: rows,
			});

			// Create a button collector
			const collector = followUpMessage.createMessageComponentCollector({
				time: 10000, // Button expires after 10 seconds
			});

			collector.on("collect", async (buttonInteraction) => {
				if (!buttonInteraction.customId.startsWith("veicle_")) return;

				const veiclesId = buttonInteraction.customId.split("_")[1];
				const veicle = veicles.find((p) => p.id === Number.parseInt(veiclesId));

				if (!veicle) return;

				await buttonInteraction.reply({
					content: `show`,
					flags: MessageFlags.Ephemeral,
				});
			});

			// Disable all buttons when collector expires
			collector.on("end", () => {
				// biome-ignore lint/complexity/noForEach: <explanation>
				rows.forEach((row) => {
					// biome-ignore lint/complexity/noForEach: <explanation>
					row.components.forEach((button) => button.setDisabled(true));
				});

				followUpMessage
					.edit({
						components: rows,
						embeds: [findingsEmbed],
					})
					.catch(console.error);
			});
		} catch (error) {
			console.error("Look command error:", error);
			return interaction.reply("Ocorreu um erro ao buscar.");
			/* return interaction.reply(
            "Something went wrong with chalenging a character",
        ); */
		}
	},
};
