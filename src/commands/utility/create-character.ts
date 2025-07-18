import { SlashCommandBuilder, type CommandInteraction } from "discord.js";
import { Character, Item, User } from "../../models";
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

  async execute(interaction: CommandInteraction) {
    const characterName = interaction.options.get("name")?.value as string;
    const characterDescription = interaction.options.get("description")
      ?.value as string;
    const userId = interaction.user.id;

    try {
      const result = await sequelize.transaction(async (t) => {
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
            currentPlanetId: 1,
            currentLocationId: 1,
          },
          { transaction: t }
        );

        const item = await Item.create(
          {
            name: "Sword",
            type: "weapon",
            damage: 10,
            class: "B",
          },
          { transaction: t }
        );

        await character.addItem(item, {
          through: { quantity: 1, equipped: false },
          transaction: t,
        });

        await user.update(
          {
            currentCharacterId: character.id,
          },
          { where: { id: userId }, transaction: t }
        );

        return { user, character };
      });

      return interaction.reply(`Character ${result.character.name} created.`);
    } catch (error: any) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return interaction.reply("Character already exists");
      }
      console.error("Character creation error:", error);
      return interaction.reply("Something went wrong with creating character");
    }
  },
};
