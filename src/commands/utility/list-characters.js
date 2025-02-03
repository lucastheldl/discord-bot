const { SlashCommandBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;
const { Character, Item, User } = require("../../models");
const { sequelize } = require("../../db-connection");
const { where } = require("sequelize");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("personagens")
		.setDescription("Lista seus personagens"),

	async execute(interaction) {
		const userId = interaction.user.id;

		try {
			// Use a transaction to ensure data consistency

			// Check if there's a user and create one if there is not
			const user = await User.findOne({
				where: { id: userId },
			});

			if (!user) {
				return interaction.reply("Você não possui personagens");
			}

			// Create a character
			const characters = await Character.findAll({
				where: { userId: user.id },
			});

			return interaction.reply(`Personagems ${characters}`);
		} catch (error) {
			throw new Error(error);
			//return interaction.reply("Something went wrong with creating character");
		}
	},
};
