import {
  SlashCommandBuilder,
  type CommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  APIActionRowComponent,
  ComponentType,
} from "discord.js";
import { setTimeout as wait } from "node:timers/promises";
import { Character, User, Vehicle } from "../../models";
import { interactWithFoundVehicle } from "../../handlers/vehicle-handler";

export default {
  data: new SlashCommandBuilder()
    .setName("buscar")
    .setDescription("Anda pelos arredores"),

  async execute(interaction: CommandInteraction) {
    const userId = interaction.user.id;

    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Character,
            as: "currentCharacter",
            attributes: ["id", "name", "currentLocationId", "currentPlanetId"],
          },
        ],
      });

      if (!user) {
        return interaction.reply("Você não possui personagens");
      }

      if (!user.currentCharacter) {
        return interaction.reply("Você não possui um personagem selecionado.");
      }

      const vehicles = await Vehicle.findAll({
        where: { currentLocationId: user.currentCharacter.currentLocationId },
      });

      const rows: ActionRowBuilder<ButtonBuilder>[] = [];
      let currentRow = new ActionRowBuilder<ButtonBuilder>();

      vehicles.forEach((vehicle, index) => {
        const button = new ButtonBuilder()
          .setCustomId(`veicle_${vehicle.id}`)
          .setLabel(`${vehicle.type}-${vehicle.name}`)
          .setStyle(ButtonStyle.Primary);

        currentRow.addComponents(button);

        if (
          currentRow.components.length === 5 ||
          index === vehicles.length - 1
        ) {
          rows.push(currentRow);
          currentRow = new ActionRowBuilder<ButtonBuilder>();
        }
      });

      await interaction.reply("Andando e inspecionando os arredores...");
      await wait(3000);

      const findingsEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Achados:")
        .setDescription(
          "Após andar e olhar os arredores você encontra:\nSelecione algo para interagir "
        );

      const followUpMessage = await interaction.followUp({
        embeds: [findingsEmbed],
        components: rows.map((row) => row.toJSON()),
      });

      const collector = followUpMessage.createMessageComponentCollector({
        time: 10000,
      });

      collector.on("collect", async (buttonInteraction) => {
        if (buttonInteraction.componentType !== ComponentType.Button) {
          // If it's not a button, you might want to log an error or just return
          // This ensures that 'collectedInteraction' is now treated as a ButtonInteraction
          return;
        }

        // Now, 'collectedInteraction' is correctly inferred as ButtonInteraction
        if (!buttonInteraction.customId.startsWith("veicle_")) return;

        await interactWithFoundVehicle(
          buttonInteraction,
          vehicles,
          user.currentCharacter!
        );
      });

      collector.on("end", () => {
        rows.forEach((row) => {
          row.components.forEach((button) => button.setDisabled(true));
        });

        followUpMessage
          .edit({
            components: rows.map((row) => row.toJSON()),
            embeds: [findingsEmbed],
          })
          .catch(console.error);
      });
    } catch (error) {
      console.error("Look command error:", error);
      return interaction.reply("Ocorreu um erro ao buscar.");
    }
  },
};
