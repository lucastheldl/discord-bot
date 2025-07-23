import { SlashCommandBuilder, type CommandInteraction } from "discord.js";
import { Planet, Location, Vehicle, Star } from "../../models";

export default {
  data: new SlashCommandBuilder()
    .setName("gerar")
    .setDescription("Generate sample data (Admin only)"),

  async execute(interaction: CommandInteraction) {
    try {
      const star = await Star.create({
        name: "Star 1",
        description: "Estrela perdida",
        type: "small",
      });

      const planet = await Planet.create({
        name: "L4",
        description: "Primeiro planeta do universo",
        type: "rock",
        currentStarId: star.id,
      });

      const location_1 = await Location.create({
        name: "L4 location 1",
        description: "Um local inexplorado",
        type: "city",
        population: 4,
        capital: 3,
        planetId: planet.id,
      });

      await Location.create({
        name: "L4 location 2",
        description: "Um local inexplorado",
        type: "natural",
        population: 0,
        capital: 0,
        planetId: planet.id,
      });

      await Vehicle.create({
        name: "V-16-12-turbo",
        description: "Uma nave super rápida e arrojada",
        type: "spaceship",
        img: "https://i.pinimg.com/736x/57/d7/6a/57d76a04e3284d5263ee8efc64c351f8.jpg",
        currentFuel: 1000,
        maxFuel: 1200,
        armor: 140,
        damage: 120,
        class: "A",
        currentPlanetId: planet.id,
        currentLocationId: location_1.id,
      });

      return interaction.reply("Objetos gerados com sucesso!");
    } catch (error) {
      console.error("Generate command error:", error);
      return interaction.reply("Something went wrong with generating objects");
    }
  },
};
