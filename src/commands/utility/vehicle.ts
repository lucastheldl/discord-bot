import {
  SlashCommandBuilder,
  type CommandInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  ComponentType,
  type Message,
  type ButtonInteraction,
} from "discord.js";
import { setTimeout as wait } from "node:timers/promises";
import { Character, User, Vehicle, Location, Planet } from "../../models";

const options = [
  { id: "1", name: "Sair" },
  { id: "2", name: "Pilotar" },
  { id: "3", name: "Inventário" },
  { id: "4", name: "Modificar" },
];

interface NavigationContext {
  currentLevel: "city" | "planet" | "space";
  currentPlanetId: number;
  currentLocationId?: number;
  character: Character;
  vehicle: Vehicle;
}

export default {
  data: new SlashCommandBuilder()
    .setName("veiculo")
    .setDescription("Entra ou sai de seu veículo selecionado"),

  async execute(interaction: CommandInteraction) {
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
            include: [
              { model: Planet, as: "currentPlanet" },
              { model: Location, as: "currentLocation" },
            ],
          },
        ],
      });

      if (!user) {
        return interaction.reply("Você não possui personagens");
      }

      if (!user.currentCharacter) {
        return interaction.reply("Você não possui um personagem selecionado.");
      }

      if (!user.currentCharacter.vehicleId) {
        return interaction.reply(
          "Seu personagem não possui um veículo selecionado."
        );
      }

      const vehicle = await Vehicle.findOne({
        where: { id: user.currentCharacter.vehicleId },
      });

      if (!vehicle) {
        return interaction.reply("Veículo não encontrado.");
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

      const followUpMessage = (await interaction.followUp({
        embeds: [findingsEmbed],
        components: rows,
        fetchReply: true,
      })) as Message;

      const collector = followUpMessage.createMessageComponentCollector({
        filter: (i) => i.componentType === ComponentType.Button,
        time: 30000,
      });

      collector.on("collect", async (buttonInteraction) => {
        if (!buttonInteraction.isButton()) return;

        switch (buttonInteraction.customId) {
          case "1": // Sair
            await buttonInteraction.reply({
              content: "Você saiu do veículo!",
              flags: MessageFlags.Ephemeral,
            });
            break;

          case "2": // Pilotar
            await handlePilotNavigation(
              buttonInteraction,
              user.currentCharacter!,
              vehicle
            );
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

      collector.on("end", () => {
        const disabledRows = rows.map((row) => {
          const newRow = new ActionRowBuilder<ButtonBuilder>();
          row.components.forEach((button) => {
            newRow.addComponents(ButtonBuilder.from(button).setDisabled(true));
          });
          return newRow;
        });

        followUpMessage
          .edit({
            components: disabledRows,
            embeds: [findingsEmbed],
          })
          .catch(console.error);
      });
    } catch (error) {
      console.error("Vehicle command error:", error);
      return interaction.reply("Ocorreu um erro ao acessar o veículo.");
    }
  },
};

async function handlePilotNavigation(
  interaction: ButtonInteraction,
  character: Character,
  vehicle: Vehicle
): Promise<void> {
  const context: NavigationContext = {
    currentLevel: "city",
    currentPlanetId: character.currentPlanetId!,
    currentLocationId: character.currentLocationId!,
    character,
    vehicle,
  };

  await showNavigationMenu(interaction, context);
}

async function showNavigationMenu(
  interaction: ButtonInteraction,
  context: NavigationContext
): Promise<void> {
  let embed: EmbedBuilder;
  let buttons: ActionRowBuilder<ButtonBuilder>[] = [];

  switch (context.currentLevel) {
    case "city":
      embed = await createCityNavigationEmbed(context);
      buttons = await createCityNavigationButtons(context);
      break;

    case "planet":
      embed = await createPlanetNavigationEmbed(context);
      buttons = await createPlanetNavigationButtons(context);
      break;

    case "space":
      embed = await createSpaceNavigationEmbed(context);
      buttons = await createSpaceNavigationButtons(context);
      break;

    default:
      embed = new EmbedBuilder()
        .setTitle("Erro de Navegação")
        .setColor(0xff0000);
      break;
  }

  const message = (await interaction.update({
    embeds: [embed],
    components: buttons,
    fetchReply: true,
  })) as Message;

  const collector = message.createMessageComponentCollector({
    filter: (i) => i.componentType === ComponentType.Button,
    time: 60000,
  });

  collector.on("collect", async (buttonInteraction) => {
    if (!buttonInteraction.isButton()) return;

    await handleNavigationAction(buttonInteraction, context);
  });

  collector.on("end", () => {
    const disabledButtons = buttons.map((row) => {
      const newRow = new ActionRowBuilder<ButtonBuilder>();
      row.components.forEach((button) => {
        newRow.addComponents(ButtonBuilder.from(button).setDisabled(true));
      });
      return newRow;
    });

    message
      .edit({
        components: disabledButtons,
      })
      .catch(console.error);
  });
}

async function createCityNavigationEmbed(
  context: NavigationContext
): Promise<EmbedBuilder> {
  const currentLocation = await Location.findByPk(context.currentLocationId!, {
    include: [{ model: Planet, as: "Planet" }],
  });

  const availableLocations = await Location.findAll({
    where: {
      planetId: context.currentPlanetId,
      id: { [require("sequelize").Op.ne]: context.currentLocationId },
    },
  });

  let description = `🚀 **Pilotando ${context.vehicle.name}**\n\n`;
  description += `📍 **Localização Atual:** ${currentLocation?.name}\n`;
  description += `🌍 **Planeta:** ${currentLocation?.Planet?.name}\n\n`;

  if (availableLocations.length > 0) {
    description += `**Destinos Disponíveis no Planeta:**\n`;
    availableLocations.forEach((loc, index) => {
      description += `${index + 1}. ${loc.name} (${loc.type})\n`;
    });
    description += `\n⬆️ **UP** - Deixar o planeta e ir para o espaço`;
  } else {
    description += `Nenhum outro local disponível neste planeta.\n`;
    description += `⬆️ **UP** - Deixar o planeta e ir para o espaço`;
  }

  return new EmbedBuilder()
    .setTitle("🛸 Sistema de Navegação")
    .setDescription(description)
    .setColor(0x00ff00)
    .setThumbnail(context.vehicle.img);
}

async function createCityNavigationButtons(
  context: NavigationContext
): Promise<ActionRowBuilder<ButtonBuilder>[]> {
  const availableLocations = await Location.findAll({
    where: {
      planetId: context.currentPlanetId,
      id: { [require("sequelize").Op.ne]: context.currentLocationId },
    },
  });

  const buttons: ActionRowBuilder<ButtonBuilder>[] = [];
  let currentRow = new ActionRowBuilder<ButtonBuilder>();

  // Add location buttons
  availableLocations.forEach((location, index) => {
    if (currentRow.components.length === 5) {
      buttons.push(currentRow);
      currentRow = new ActionRowBuilder<ButtonBuilder>();
    }

    const button = new ButtonBuilder()
      .setCustomId(`goto_location_${location.id}`)
      .setLabel(`${location.name}`)
      .setStyle(ButtonStyle.Secondary);

    currentRow.addComponents(button);
  });

  // Add UP button
  if (currentRow.components.length === 5) {
    buttons.push(currentRow);
    currentRow = new ActionRowBuilder<ButtonBuilder>();
  }

  const upButton = new ButtonBuilder()
    .setCustomId("nav_up")
    .setLabel("⬆️ UP - Espaço")
    .setStyle(ButtonStyle.Primary);

  currentRow.addComponents(upButton);
  buttons.push(currentRow);

  return buttons;
}

async function createPlanetNavigationEmbed(
  context: NavigationContext
): Promise<EmbedBuilder> {
  const currentPlanet = await Planet.findByPk(context.currentPlanetId);
  const nearbyPlanets = await Planet.findAll({
    where: {
      id: { [require("sequelize").Op.ne]: context.currentPlanetId },
    },
    limit: 2,
  });

  let description = `🚀 **Pilotando ${context.vehicle.name}**\n\n`;
  description += `🌍 **Planeta Atual:** ${currentPlanet?.name}\n`;
  description += `📍 **Status:** Orbitando o planeta\n\n`;

  if (nearbyPlanets.length > 0) {
    description += `**Planetas Próximos:**\n`;
    nearbyPlanets.forEach((planet, index) => {
      description += `${index + 1}. ${planet.name} (${planet.type})\n`;
    });
  }

  description += `\n⬇️ **DOWN** - Retornar para a superfície do planeta`;

  return new EmbedBuilder()
    .setTitle("🌌 Navegação Espacial")
    .setDescription(description)
    .setColor(0x0099ff)
    .setThumbnail(context.vehicle.img);
}

async function createPlanetNavigationButtons(
  context: NavigationContext
): Promise<ActionRowBuilder<ButtonBuilder>[]> {
  const nearbyPlanets = await Planet.findAll({
    where: {
      id: { [require("sequelize").Op.ne]: context.currentPlanetId },
    },
    limit: 2,
  });

  const buttons: ActionRowBuilder<ButtonBuilder>[] = [];
  const currentRow = new ActionRowBuilder<ButtonBuilder>();

  // Add planet buttons
  nearbyPlanets.forEach((planet) => {
    const button = new ButtonBuilder()
      .setCustomId(`goto_planet_${planet.id}`)
      .setLabel(`${planet.name}`)
      .setStyle(ButtonStyle.Success);

    currentRow.addComponents(button);
  });

  // Add DOWN button
  const downButton = new ButtonBuilder()
    .setCustomId("nav_down")
    .setLabel("⬇️ DOWN - Superfície")
    .setStyle(ButtonStyle.Primary);

  currentRow.addComponents(downButton);
  buttons.push(currentRow);

  return buttons;
}

async function createSpaceNavigationEmbed(
  context: NavigationContext
): Promise<EmbedBuilder> {
  return new EmbedBuilder()
    .setTitle("🌌 Espaço Profundo")
    .setDescription("Funcionalidade em desenvolvimento...")
    .setColor(0x000080);
}

async function createSpaceNavigationButtons(
  context: NavigationContext
): Promise<ActionRowBuilder<ButtonBuilder>[]> {
  return [];
}

async function handleNavigationAction(
  interaction: ButtonInteraction,
  context: NavigationContext
): Promise<void> {
  const [action, type, id] = interaction.customId.split("_");

  try {
    switch (action) {
      case "goto":
        if (type === "location") {
          await moveToLocation(interaction, context, Number.parseInt(id));
        } else if (type === "planet") {
          await moveToPlanet(interaction, context, Number.parseInt(id));
        }
        break;

      case "nav":
        if (type === "up") {
          context.currentLevel = "planet";
          await showNavigationMenu(interaction, context);
        } else if (type === "down") {
          context.currentLevel = "city";
          await showNavigationMenu(interaction, context);
        }
        break;
    }
  } catch (error) {
    console.error("Navigation action error:", error);
    await interaction.reply({
      content: "Erro durante a navegação. Tente novamente.",
      flags: MessageFlags.Ephemeral,
    });
  }
}

async function moveToLocation(
  interaction: ButtonInteraction,
  context: NavigationContext,
  locationId: number
): Promise<void> {
  const targetLocation = await Location.findByPk(locationId);

  if (!targetLocation) {
    await interaction.reply({
      content: "Local não encontrado!",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Update character location
  await context.character.update({
    currentLocationId: locationId,
  });

  // Update vehicle location
  await context.vehicle.update({
    currentLocationId: locationId,
  });

  // Update context
  context.currentLocationId = locationId;

  await interaction.reply({
    content: `🚀 Viajando para ${targetLocation.name}...`,
    flags: MessageFlags.Ephemeral,
  });

  // Show updated navigation menu
  setTimeout(async () => {
    await showNavigationMenu(interaction, context);
  }, 2000);
}

async function moveToPlanet(
  interaction: ButtonInteraction,
  context: NavigationContext,
  planetId: number
): Promise<void> {
  const targetPlanet = await Planet.findByPk(planetId);

  if (!targetPlanet) {
    await interaction.reply({
      content: "Planeta não encontrado!",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Find first location on the target planet
  const firstLocation = await Location.findOne({
    where: { planetId: planetId },
  });

  if (!firstLocation) {
    await interaction.reply({
      content: "Nenhum local disponível neste planeta!",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Update character and vehicle location
  await context.character.update({
    currentPlanetId: planetId,
    currentLocationId: firstLocation.id,
  });

  await context.vehicle.update({
    currentPlanetId: planetId,
    currentLocationId: firstLocation.id,
  });

  // Update context
  context.currentPlanetId = planetId;
  context.currentLocationId = firstLocation.id;
  context.currentLevel = "city";

  await interaction.reply({
    content: `🚀 Viajando para o planeta ${targetPlanet.name}...`,
    flags: MessageFlags.Ephemeral,
  });

  // Show updated navigation menu
  setTimeout(async () => {
    await showNavigationMenu(interaction, context);
  }, 2000);
}
