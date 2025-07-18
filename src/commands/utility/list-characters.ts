import { SlashCommandBuilder, type CommandInteraction } from "discord.js";
import { Character, User } from "../../models";

export default {
  data: new SlashCommandBuilder()
    .setName("personagens")
    .setDescription("Lista seus personagens"),

  async execute(interaction: CommandInteraction) {
    const userId = interaction.user.id;

    try {
      const user = await User.findOne({
        where: { id: userId },
      });

      if (!user) {
        return interaction.reply("Você não possui personagens");
      }

      const characters = await Character.findAll({
        where: { userId: user.id },
      });

      if (characters.length === 0) {
        return interaction.reply("Você não possui personagens");
      }

      const characterList = characters
        .map(
          (char) => `• **${char.name}** - ${char.class} (${char.description})`
        )
        .join("\n");

      return interaction.reply(`**Seus Personagens:**\n${characterList}`);
    } catch (error) {
      console.error("List characters error:", error);
      return interaction.reply("Something went wrong with listing characters");
    }
  },
};
