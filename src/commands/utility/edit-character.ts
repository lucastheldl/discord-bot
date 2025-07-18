import { SlashCommandBuilder, type CommandInteraction } from "discord.js";
import { Character, User } from "../../models";

export default {
  data: new SlashCommandBuilder()
    .setName("edit")
    .setDescription("Edit a character")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Nome do seu personagem")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Descrição do seu personagem")
        .setRequired(false)
    ),

  async execute(interaction: CommandInteraction) {
    const characterName = interaction.options.get("name")?.value as
      | string
      | null;
    const characterDescription = interaction.options.get("description")
      ?.value as string | null;
    const userId = interaction.user.id;

    try {
      const user = await User.findByPk(userId, {
        include: ["currentCharacter"],
      });

      if (!user) {
        return interaction.reply("Você não possui personagens");
      }

      if (!user.currentCharacter) {
        return interaction.reply("Você não possui um personagem selecionado");
      }

      const updateData: any = {};
      if (characterName) updateData.name = characterName;
      if (characterDescription) updateData.description = characterDescription;

      const [affectedRows] = await Character.update(updateData, {
        where: {
          id: user.currentCharacterId!,
          userId: userId,
        },
      });

      if (affectedRows > 0) {
        return interaction.reply(
          `Personagem ${characterName || "atual"} foi editado`
        );
      }

      return interaction.reply("Este personagem não existe.");
    } catch (error) {
      console.error("Edit character error:", error);
      return interaction.reply("Something went wrong with edit character");
    }
  },
};
