const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageFlags,
	SlashCommandBuilder,
} = require("discord.js");
async function interactWithFoundVehicle(buttonInteraction, veicles) {
	const veiclesId = buttonInteraction.customId.split("_")[1];
	const veicle = veicles.find((p) => p.id === Number.parseInt(veiclesId));

	if (!veicle) return;

	const resultEmbed = new EmbedBuilder()
		.setColor(0x00ff00)
		.setTitle(`${veicle.name}`)
		.setDescription(veicle.description)
		.setImage(veicle.img);

	await buttonInteraction.reply({
		embeds: [resultEmbed],
	});
}

module.exports = { interactWithFoundVehicle };
