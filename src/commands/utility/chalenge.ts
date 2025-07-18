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
import { Character, User } from "../../models";
import type { Power } from "../../types";

export default {
  data: new SlashCommandBuilder()
    .setName("chalenge")
    .setDescription("Desafie um personagem para batalha")
    .addStringOption((option) =>
      option.setName("name").setDescription("Nome do usuário").setRequired(true)
    ),

  async execute(interaction: CommandInteraction) {
    const userId = interaction.user.id;
    const enemyUserName = interaction.options.get("name")?.value as string;

    try {
      const user = await User.findByPk(userId, {
        include: ["currentCharacter"],
      });

      if (!user) {
        return interaction.reply("Você não possui personagens");
      }

      if (!user.currentCharacter) {
        return interaction.reply("Você não possui um personagem selecionado.");
      }

      const character = user.currentCharacter;

      const enemyCharacter = await Character.findOne({
        where: { username: enemyUserName },
      });

      if (!enemyCharacter) {
        return interaction.reply("Personagem inimigo não encontrado.");
      }

      const powers: Power[] = [
        { name: "fire ball", id: "1", accuracy: 80, damage: 100 },
        { name: "water attack", id: "2", accuracy: 75, damage: 90 },
      ];

      const rows: ActionRowBuilder<ButtonBuilder>[] = [];
      let currentRow = new ActionRowBuilder<ButtonBuilder>();

      powers.forEach((power, index) => {
        const button = new ButtonBuilder()
          .setCustomId(`power_${power.id}`)
          .setLabel(power.name)
          .setStyle(ButtonStyle.Primary);

        currentRow.addComponents(button);

        if (currentRow.components.length === 5 || index === powers.length - 1) {
          rows.push(currentRow);
          currentRow = new ActionRowBuilder<ButtonBuilder>();
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
          }))
        )
        .setThumbnail("https://i.imgur.com/m8pGaD3.jpeg");

      // Store the message returned by interaction.reply()
      const replyMessage = await interaction.reply({
        embeds: [battleEmbed],
        components: rows.map((row) => row.toJSON()),
        fetchReply: true, // This is crucial for getting the Message object back
      });

      // Use the replyMessage to create the collector
      const collector = replyMessage.createMessageComponentCollector({
        time: 30000,
      });

      collector.on("collect", async (collectedInteraction) => {
        // Type guard: Ensure it's a button interaction
        if (collectedInteraction.componentType !== ComponentType.Button) {
          return;
        }

        if (!collectedInteraction.customId.startsWith("power_")) return;

        const powerId = collectedInteraction.customId.split("_")[1];
        const power = powers.find((p) => p.id === powerId);

        if (!power) return;

        const hit = Math.random() * 100 <= (power.accuracy || 100);

        const resultEmbed = new EmbedBuilder()
          .setColor(hit ? 0x00ff00 : 0xff0000)
          .setTitle(`${character.name} used ${power.name}!`)
          .setDescription(
            hit
              ? `✨ The attack hit! Dealing ${power.damage} damage!`
              : "❌ The attack missed!"
          );

        await collectedInteraction.reply({
          // Use collectedInteraction.reply for ephemeral replies
          embeds: [resultEmbed],
          ephemeral: true, // Typically, button interactions should reply ephemerally
        });

        // Optionally, stop the collector after a power is used, or let it timeout
        // collector.stop();
      });

      collector.on("end", async () => {
        // Make this async if you're using await inside
        rows.forEach((row) => {
          row.components.forEach((button) => button.setDisabled(true));
        });

        await replyMessage // Use replyMessage to edit the original message
          .edit({
            components: rows.map((row) => row.toJSON()),
          })
          .catch(console.error);
      });
    } catch (error) {
      console.error("Challenge command error:", error);
      return interaction.reply("Ocorreu um erro ao desafiar personagem.");
    }
  },
};
