const wait = require("node:timers/promises").setTimeout;
const { where } = require("sequelize");
const { Character, Item, User, Vehicle } = require("../../models");
const { interactWithFoundVehicle } = require("../../handlers/vehicle-handler");
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
		.setName("veiculo")
		.setDescription("Entra ou sai de seu veículo selecionado"),
	async execute(interaction) {
		const userId = interaction.user.id;
		try {
			const user = await User.findByPk(userId, {
				include: [
					{
						model: Character,
						as: "currentCharacter",
						attributes: [
							"id",
							"name",
							"currentLocationId",
							"currentPlanetId",
							"vehicleId",
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

			if (!user.currentCharacter.vehicleId) {
				return interaction.reply(
					"Seu personagem não possui um veículo selecionado.",
				);
			}
			const veicle = await Vehicle.findOne({
				where: { id: user.currentCharacter.vehicleId },
			});
			//toggle if char is or not inside vehicle
			await interaction.reply("Entrando no veículo");
			await wait(1000);
			const findingsEmbed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(`${veicle.type} ${veicle.name}`)
				.setDescription(
					`Você entra na sua ${veicle.type} pronto para pilotar...`,
				)
				.setThumbnail(veicle.img);

			const followUpMessage = await interaction.followUp({
				embeds: [findingsEmbed],
				//components: rows,
			});

			/* const rows = [];
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

				await interactWithFoundVehicle(
					buttonInteraction,
					veicles,
					user.currentCharacter,
				);
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
			}); */
		} catch (error) {
			console.error("Look command error:", error);
			return interaction.reply("Ocorreu um erro ao buscar.");
		}
	},
};
