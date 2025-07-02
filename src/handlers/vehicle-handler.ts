import {
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { Vehicle } from "../models/vehicle";
import { Character } from "../models/character";
import { battleManager, battleFlow, BattleParticipant } from "./battle-handler";

interface VehicleOption {
  id: string;
  name: string;
}

const options: VehicleOption[] = [
  { id: "1", name: "Tentar roubar" },
  { id: "2", name: "Atacar" },
];

async function interactWithFoundVehicle(
  buttonInteraction: ButtonInteraction,
  vehicles: Vehicle[],
  character: Character
): Promise<void> {
  const vehicleId = buttonInteraction.customId.split("_")[1];
  const vehicle = vehicles.find((p) => p.id === Number.parseInt(vehicleId));

  if (!vehicle) return;

  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  let currentRow = new ActionRowBuilder<ButtonBuilder>();

  options.forEach((opt, index) => {
    const button = new ButtonBuilder()
      .setCustomId(opt.id)
      .setLabel(opt.name)
      .setStyle(ButtonStyle.Primary);

    currentRow.addComponents(button);

    if (currentRow.components.length === 5 || index === options.length - 1) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder<ButtonBuilder>();
    }
  });

  const resultEmbed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle(vehicle.name)
    .setDescription(vehicle.description)
    .setImage(vehicle.img || null);

  await buttonInteraction.reply({
    embeds: [resultEmbed],
    components: rows,
  });

  const replyMessage = await buttonInteraction.fetchReply();
  const collector = replyMessage.createMessageComponentCollector({
    time: 10000,
  });

  collector.on("collect", async (interaction: ButtonInteraction) => {
    if (interaction.customId === "1") {
      await character.update({
        vehicleId: vehicle.id,
      });
      await interaction.reply("Você rouba o veículo com sucesso!");
      collector.stop();
      return;
    }

    if (interaction.customId === "2") {
      const starId = 1;
      const planetId = 1;
      const locationId = 1;

      // Convert character to BattleParticipant
      const characterParticipant: BattleParticipant = {
        id: character.id,
        name: character.name,
        img: character.img,
        health: character.current_health,
        maxHealth: character.max_health,
        energy: character.current_energy,
        maxEnergy: character.max_energy,
        damage: character.damage,
        armor: character.armor,
        class: character.class,
      };

      // Convert vehicle to BattleParticipant
      const vehicleParticipant: BattleParticipant = {
        id: vehicle.id,
        name: vehicle.name,
        img: vehicle.img,
        isBot: true,
        health: vehicle.armor * 10, // Example calculation
        maxHealth: vehicle.armor * 10,
        energy: vehicle.maxFuel,
        maxEnergy: vehicle.maxFuel,
        damage: vehicle.damage,
        armor: vehicle.armor,
        class: vehicle.class,
      };

      const battle = battleManager.createBattle(
        starId,
        planetId,
        locationId,
        characterParticipant,
        vehicleParticipant
      );

      if (!battle) {
        await interaction.reply(
          "A battle is already in progress in this location!"
        );
        return;
      }

      await interaction.reply("Você se prepara para atacar!");
      await battleFlow(interaction, battle);
      collector.stop();
      return;
    }
  });

  collector.on("end", async () => {
    rows.forEach((row) => {
      row.components.forEach((button) => {
        button.setDisabled(true);
      });
    });

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

export { interactWithFoundVehicle };
