const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageFlags,
	SlashCommandBuilder,
} = require("discord.js");
const { battleManager } = require("./battle-handler");

const options = [
	{ id: "1", name: "Tentar roubar" },
	{ id: "2", name: "Atacar" },
];

async function interactWithFoundVehicle(buttonInteraction, veicles, character) {
	const veiclesId = buttonInteraction.customId.split("_")[1];
	const veicle = veicles.find((p) => p.id === Number.parseInt(veiclesId));

	if (!veicle) return;

	const rows = [];
	let currentRow = new ActionRowBuilder();

	options.forEach((opt, index) => {
		const button = new ButtonBuilder()
			.setCustomId(opt.id)
			.setLabel(opt.name)
			.setStyle(ButtonStyle.Primary);

		currentRow.addComponents(button);

		if (currentRow.components.length === 5 || index === options.length - 1) {
			rows.push(currentRow);
			currentRow = new ActionRowBuilder();
		}
	});

	const resultEmbed = new EmbedBuilder()
		.setColor(0x00ff00)
		.setTitle(`${veicle.name}`)
		.setDescription(veicle.description)
		.setImage(veicle.img);

	// Reply first
	await buttonInteraction.reply({
		embeds: [resultEmbed],
		components: rows,
	});

	// Then fetch the reply message
	const replyMessage = await buttonInteraction.fetchReply();

	// Create collector on the fetched message
	const collector = replyMessage.createMessageComponentCollector({
		time: 10000,
	});

	collector.on("collect", async (interaction) => {
		if (interaction.customId === "1") {
			//set vehicle as player current vehicle
			await character.update({
				vehicleId: veicle.id,
			});
			await interaction.reply("Você rouba o veículo com sucesso!");

			collector.stop();
			return;
		}
		if (interaction.customId === "2") {
			//handle attack
			/* const opponent = interaction.options.getUser("opponent");
			const battle = battleManager.createBattle(
				interaction.channelId,
				interaction.user,
				opponent,
			);

			if (!battle) {
				return interaction.reply(
					"A battle is already in progress in this channel!",
				);
			} */
			collector.stop();
			return;
		}
	});

	collector.on("end", async () => {
		// Disable all buttons
		// biome-ignore lint/complexity/noForEach: <explanation>
		rows.forEach((row) => {
			// biome-ignore lint/complexity/noForEach: <explanation>
			row.components.forEach((button) => {
				button.setDisabled(true);
			});
		});

		// Update the message with disabled buttons
		try {
			await replyMessage.edit({
				embeds: [resultEmbed],
				components: rows,
			});
		} catch (error) {
			console.error("Failed to update message:", error);
		}
	});
}

module.exports = { interactWithFoundVehicle };
