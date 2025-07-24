import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  type CommandInteraction,
} from "discord.js";
import { Character, Item, User, Planet, Location } from "../../models";
import { sequelize } from "../../db-connection";

export default {
  data: new SlashCommandBuilder()
    .setName("character")
    .setDescription("Create a character")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Nome do seu personagem")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Descrição do seu personagem")
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const characterName = interaction.options.get("name")?.value as string;
    const characterDescription = interaction.options.get("description")
      ?.value as string;
    const userId = interaction.user.id;

    try {
      const result = await sequelize.transaction(async (t) => {
        // Check if there's a user and create one if there is not
        let user = await User.findOne({
          where: { id: userId },
          transaction: t,
        });

        if (!user) {
          user = await User.create(
            {
              id: userId,
              name: interaction.user.username,
            },
            { transaction: t }
          );
        }

        // Get any available planet and location (first ones found)
        const defaultPlanet = await Planet.findOne({
          transaction: t,
        });

        const defaultLocation = await Location.findOne({
          transaction: t,
        });

        if (!defaultPlanet || !defaultLocation) {
          throw new Error(
            "No planets or locations found. Please run the /gerar command first to create sample data."
          );
        }

        // Create a character
        const character = await Character.create(
          {
            name: characterName,
            description: characterDescription,
            username: interaction.user.username,
            max_health: 100,
            max_energy: 100,
            current_health: 100,
            current_energy: 100,
            age: 25,
            class: "B",
            isInsideVehicle: false,
            userId: user.id,
            currentPlanetId: defaultPlanet.id,
            currentLocationId: defaultLocation.id,
          },
          { transaction: t }
        );

        // Create the starter item
        const item = await Item.create(
          {
            name: `${characterName}'s Starter Sword`,
            type: "weapon",
            damage: 10,
            class: "C",
          },
          { transaction: t }
        );

        // Add item to character
        await character.addItem(item, {
          through: { quantity: 1, equipped: false },
          transaction: t,
        });

        // Update user with the current character
        await user.update(
          {
            currentCharacterId: character.id,
          },
          { transaction: t }
        );

        return {
          user,
          character,
          planet: defaultPlanet,
          location: defaultLocation,
        };
      });

      return interaction.reply(
        `Character **${result.character.name}** created successfully!\n` +
          `📍 Starting location: ${result.location.name} on planet ${result.planet.name}\n` +
          `⚔️ Equipped with: ${result.character.name}'s Starter Sword`
      );
    } catch (error: any) {
      console.error("Character creation error:", error);

      if (error.name === "SequelizeUniqueConstraintError") {
        return interaction.reply("A character with this name already exists!");
      }

      if (error.message.includes("No planets or locations found")) {
        return interaction.reply(
          "No game world data found. Please run the `/gerar` command first to create the game world!"
        );
      }

      return interaction.reply(
        "Something went wrong while creating the character. Please try again."
      );
    }
  },
};
