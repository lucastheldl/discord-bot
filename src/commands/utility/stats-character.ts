import {
  SlashCommandBuilder,
  type CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { User, Planet, Character, Location } from "../../models";

export default {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Mostra as estatísticas do personagem"),

  async execute(interaction: CommandInteraction) {
    const userId = interaction.user.id;

    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Character,
            as: "currentCharacter",
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

      const character = user.currentCharacter;

      const statsEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`Perfil de ${character.name}`)
        .setDescription(character.description || "Sem descrição")
        .addFields(
          {
            name: "🔹 Classe",
            value: character.class,
            inline: false,
          },
          {
            name: "❤ Vida",
            value: `${character.current_health}/${character.max_health}`,
            inline: false,
          },
          {
            name: "✨ Energia",
            value: `${character.current_energy}/${character.max_energy}`,
            inline: false,
          },
          { name: "\u200B", value: "\u200B", inline: false },
          {
            name: "🏆 Achievements",
            value:
              "• Defeated the Dragon\n• Saved the Kingdom\n• Found the Lost Artifact",
            inline: false,
          },
          {
            name: "🗺 Local",
            value: `• Planeta ${
              character.currentPlanet?.name || "Desconhecido"
            }\n• ${character.currentLocation?.name || "Desconhecido"}\n`,
            inline: false,
          }
        )
        .setThumbnail("https://i.imgur.com/AfFp7pu.png");

      return await interaction.reply({ embeds: [statsEmbed] });
    } catch (error) {
      console.error("Stats command error:", error);
      return interaction.reply(
        "Something went wrong with getting character stats"
      );
    }
  },
};
