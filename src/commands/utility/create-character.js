const { SlashCommandBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;
const { Character, Item, User } = require("../../models");
const { sequelize } = require("../../db-connection");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("character")
		.setDescription("Create a character")
		.addStringOption((option) =>
			option
				.setName("name")
				.setDescription("Nome do seu personagem")
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName("description")
				.setDescription("Descrição do seu personagem")
				.setRequired(true),
		),
	async execute(interaction) {
		const characterName = interaction.options.getString("name");
		const characterDescription = interaction.options.getString("description");
		const userId = interaction.user.id;

		try {
			// Use a transaction to ensure data consistency
			const result = await sequelize.transaction(async (t) => {
				// Check if there's a user and create one if there is not
				let user = await User.findOne({
					where: { id: userId },
					transaction: t,
				});

				if (!user) {
					user = await User.create(
						{
							id: userId, // Use the Discord user ID
							name: interaction.user.username,
						},
						{ transaction: t },
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
						class: "B",
						userId: user.id,
					},
					{ transaction: t },
				);

				// Create the starter item
				const item = await Item.create(
					{
						name: "Sword",
						type: "weapon",
						damage: 10,
						class: "B",
					},
					{ transaction: t },
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
					{ transaction: t },
				);

				return { user, character };
			});

			return interaction.reply(`Character ${result.character.name} created.`);
		} catch (error) {
			if (error.name === "SequelizeUniqueConstraintError") {
				return interaction.reply("Character already exists");
			}
			throw new Error(error);
			//return interaction.reply("Something went wrong with creating character");
		}
	},
};
