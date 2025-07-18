import { SlashCommandBuilder, type CommandInteraction } from "discord.js";
import { Character, User } from "../../models";

export default {
  data: new SlashCommandBuilder()
    .setName("entrar")
    .setDescription("Realiza login como um de seus personagens")
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("Nome do seu personagem")
        .setRequired(true)
    ),

  async execute(interaction: CommandInteraction) {
    const userId = interaction.user.id;
    const characterName = interaction.options.get("name")?.value as string;

    try {
      const character = await Character.findOne({
        where: { name: characterName, userId: userId },
      });

      if (!character) {
        return interaction.reply("Este usuário não possui este personagem.");
      }

      // Update user's current character
      await User.update(
        { currentCharacterId: character.id },
        { where: { id: userId } }
      );

      return interaction.reply(`Entrou como personagem: ${character.name}.`);
    } catch (error: any) {
      console.error("Login error:", error);
      return interaction.reply("Something went wrong with character login");
    }
  },
};
