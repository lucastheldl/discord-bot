const { SlashCommandBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;
const { Character, Item } = require("../../models");
const { EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("invent")
		.setDescription("Mostra o inventario do personagem"),
	async execute(interaction) {
		const username = interaction.user.username;

		try {
			const character = await Character.findOne({
				where: { username: username },
				include: [
					{
						model: Item,
						through: { attributes: ["quantity", "equipped"] }, // This excludes the junction table attributes
					},
				],
			});

			if (!character) {
				return interaction.reply("Este usuário não possui um personagem.");
			}

			const itemsList =
				character.items
					.map((item) => {
						const equippedStatus = item.characterItem.equipped
							? "(Equipado)"
							: "";
						const quantity =
							item.characterItem.quantity >= 1
								? `x${item.characterItem.quantity}`
								: "";

						return (
							`• **${item.name}** ${quantity} ${equippedStatus}\n` +
							`  Tipo: ${item.type} | Class: **${item.class}**` +
							`${item.damage ? ` | Dmg: **${item.damage}**` : ""}` +
							`${item.defence ? ` | Def: **${item.defence}**` : ""}`
						);
					})
					.join("\n") || "Nenhum item encontrado";

			const inventoryEmbed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(`Inventário de ${character.name}`)
				.addFields({ name: "🔹 Items", value: itemsList, inline: false });

			return await interaction.reply({ embeds: [inventoryEmbed] });
		} catch (error) {
			console.error("Inventory command error:", error);
			return interaction.reply("Ocorreu um erro ao buscar o inventário.");
			/* return interaction.reply(
				"Something went wrong with getting character inventory",
			); */
		}
	},
};
