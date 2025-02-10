const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageFlags,
	SlashCommandBuilder,
} = require("discord.js");
const options = [
	{ id: "1", name: "Tentar roubar" },
	{ id: "2", name: "Atacar" },
];
async function interactWithFoundVehicle(buttonInteraction, veicles) {
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

		// Discord allows max 5 buttons per row
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

	await buttonInteraction.reply({
		embeds: [resultEmbed],
		components: rows,
	});
}

module.exports = { interactWithFoundVehicle };
