import {
  SlashCommandBuilder,
  type CommandInteraction,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { battleManager } from "../../handlers/battle-handler";

export default {
  data: new SlashCommandBuilder()
    .setName("juntarbatalha")
    .setDescription("Se une a uma batalha em andamento no local")
    .addStringOption((option) =>
      option
        .setName("time")
        .setDescription("Selecione de que lado você está")
        .setRequired(true)
        .addChoices(
          { name: "Red Team", value: "red" },
          { name: "Blue Team", value: "blue" }
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const team = interaction.options.get("time")?.value as "red" | "blue";

    // These would need to come from player data or be parameters
    const starId = 1;
    const planetId = 1;
    const locationId = 1;

    const battle = battleManager.getBattle(starId, planetId, locationId);

    if (!battle) {
      return interaction.reply("No active battle in this location!");
    }

    const characterId = Number.parseInt(interaction.user.id); // This might need adjustment based on your character system

    if (battle.isPlayerInBattle(characterId)) {
      return interaction.reply("You are already in this battle!");
    }

    // You'd need to get the actual character data here
    const playerParticipant = {
      id: characterId,
      name: interaction.user.username,
      health: 100,
      maxHealth: 100,
      energy: 100,
      maxEnergy: 100,
      damage: 50,
      armor: 25,
      class: "B",
    };

    const success = battle.addCharacter(playerParticipant, team);

    if (!success) {
      return interaction.reply("Could not join the battle.");
    }

    const embed = new EmbedBuilder()
      .setTitle("Joined Battle!")
      .setDescription(`You have joined the ${team} team!`)
      .addFields({
        name: "Current Turn",
        value: `Player ${battle.currentTurn}`,
      });

    await interaction.reply({ embeds: [embed] });
  },
};
