const { SlashCommandBuilder } = require("discord.js");
const { battleManager } = require("../../handlers/battle-handler");
const wait = require("node:timers/promises").setTimeout;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("juntarbatalha")
		.setDescription("Se une a uma batlha em andamento no local")
		.addStringOption((option) =>
			option
				.setName("time")
				.setDescription("Selecione de que lado você esta")
				.setRequired(true),
		),
	async execute(interaction) {
		const team = interaction.options.getString("team");
		const locationType = playerData.locationType;
		const locationId = playerData.locationId;

		// Get battle at player's current location
		const battle = battleManager.getBattle(locationType, locationId);

		if (!battle) {
			return interaction.reply("No active battle in this location!");
		}

		if (battle.isPlayerInBattle(interaction.user.id)) {
			return interaction.reply("You are already in this battle!");
		}

		const success = battle.addCharacter(interaction.user, team);
		if (!success) {
			return interaction.reply("Could not join the battle.");
		}

		// Update battle status
		const status = await battle.getBattleStatus(sequelize);
		const embed = new EmbedBuilder()
			.setTitle("Battle Status")
			.addFields(
				{ name: "Red Team", value: status.red },
				{ name: "Blue Team", value: status.blue },
				{ name: "Current Turn", value: `<@${status.currentTurn}>` },
			);

		await interaction.reply({ embeds: [embed] });
	},
};
