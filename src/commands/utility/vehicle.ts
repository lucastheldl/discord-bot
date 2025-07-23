import { SlashCommandBuilder } from "@discordjs/builders";
import {
  type CommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from "discord.js";
import { setTimeout as wait } from "node:timers/promises";
import { User, Character, Vehicle } from "../../models";
import type { Command } from "../../types";

interface VehicleOption {
  id: string;
  name: string;
}

const options: VehicleOption[] = [
  { id: "1", name: "Sair" },
  { id: "2", name: "Pilotar" },
  { id: "3", name: "Inventário" },
  { id: "4", name: "Modificar" },
];

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("veiculo")
    .setDescription("Entra ou sai de seu veículo selecionado"),

  execute: async (interaction: CommandInteraction): Promise<void> => {
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
        await interaction.reply("Você não possui personagens");
        return;
      }

      // Check if there's a character
      if (!user.currentCharacter) {
        await interaction.reply("Você não possui um personagem selecionado.");
        return;
      }

      if (!user.currentCharacter.vehicleId) {
        await interaction.reply(
          "Seu personagem não possui um veículo selecionado."
        );
        return;
      }

      const vehicle = await Vehicle.findOne({
        where: { id: user.currentCharacter.vehicleId },
      });

      if (!vehicle) {
        await interaction.reply("Veículo não encontrado.");
        return;
      }

      const rows: ActionRowBuilder<ButtonBuilder>[] = [];
      let currentRow = new ActionRowBuilder<ButtonBuilder>();

      options.forEach((opt, index) => {
        const button = new ButtonBuilder()
          .setCustomId(opt.id)
          .setLabel(opt.name)
          .setStyle(ButtonStyle.Primary);

        currentRow.addComponents(button);

        if (
          currentRow.components.length === 5 ||
          index === options.length - 1
        ) {
          rows.push(currentRow);
          currentRow = new ActionRowBuilder<ButtonBuilder>();
        }
      });

      await interaction.reply("Entrando no veículo");
      await wait(1000);

      const findingsEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`${vehicle.type} ${vehicle.name}`)
        .setDescription(
          `Você entra na sua ${vehicle.type} pronto para pilotar...`
        )
        .setThumbnail(vehicle.img);

      const followUpMessage = await interaction.followUp({
        embeds: [findingsEmbed],
        components: rows,
      });

      const collector = followUpMessage.createMessageComponentCollector({
        time: 30000,
      });

      collector.on("collect", async (buttonInteraction) => {
        switch (buttonInteraction.customId) {
          case "1": // Sair
            await buttonInteraction.reply({
              content: "Você saiu do veículo!",
              flags: MessageFlags.Ephemeral,
            });
            break;
          case "2": // Pilotar
            await buttonInteraction.update({
              content: "Pilotando o veículo...",
            });
            break;
          case "3": // Inventário
            await buttonInteraction.update({
              content: "Abrindo inventário...",
            });
            break;
          case "4": // Modificar
            await buttonInteraction.update({
              content: "Abrindo menu de modificações...",
            });
            break;
        }
      });

      // Disable all buttons when collector expires
      collector.on("end", () => {
        rows.forEach((row) => {
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
      console.error("Vehicle command error:", error);
      await interaction.reply("Ocorreu um erro ao acessar o veículo.");
    }
  },
};

export = command;
