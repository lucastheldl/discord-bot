class Battle {
	constructor(locationInfo, firstPlayer, secondPlayer) {
		// Location info object containing type and ID
		this.locationInfo = locationInfo; // { type: 'star'|'planet'|'location', id: number }
		this.teams = {
			red: [firstPlayer],
			blue: [secondPlayer],
		};
		this.currentTurn = firstPlayer.id;
		this.turnOrder = [firstPlayer.id, secondPlayer.id];
		this.active = true;
	}

	// Rest of battle methods remain the same
	addCharacter(char, team) {
		if (!this.active) return false;
		if (!["red", "blue"].includes(team)) return false;

		this.teams[team].push(char);
		const currentIndex = this.turnOrder.indexOf(this.currentTurn);
		this.turnOrder.splice(currentIndex + 1, 0, char.id);

		return true;
	}

	nextTurn() {
		const currentIndex = this.turnOrder.indexOf(this.currentTurn);
		this.currentTurn =
			this.turnOrder[(currentIndex + 1) % this.turnOrder.length];
		return this.currentTurn;
	}

	isPlayerTurn(characterId) {
		return this.currentTurn === characterId;
	}

	async getPlayerPowers(/* playerId, sequelize */) {
		/* const Powers = sequelize.models.Powers;
		return await Powers.findAll({
			where: {
				userId: playerId,
			},
		}); */
		const powers = [
			{ id: "1", name: "fire ball" },
			{ id: "2", name: "Yonar blast" },
		];
		return powers;
	}

	isPlayerInBattle(characterId) {
		return this.turnOrder.includes(characterId);
	}

	getPlayerTeam(characterId) {
		if (this.teams.red.some((p) => p.id === characterId)) return "red";
		if (this.teams.blue.some((p) => p.id === characterId)) return "blue";
		return null;
	}

	endBattle() {
		this.active = false;
	}
}

class BattleManager {
	constructor() {
		// Store battles by location type and ID
		this.battles = new Map();
	}

	// Create a battle key from location info
	createBattleKey(starId, planetId, locationId) {
		return `star-${starId}-planet-${planetId}-location-${locationId}`;
	}

	// Create a new battle
	createBattle(starId, planetId, locationId, player1, player2) {
		const battleKey = this.createBattleKey(starId, planetId, locationId);

		if (this.battles.has(battleKey)) return null;

		const battle = new Battle(battleKey, player1, player2);

		this.battles.set(battleKey, battle);
		return battle;
	}

	// Get battle by location
	getBattle(starId, planetId, locationId) {
		const battleKey = this.createBattleKey(starId, planetId, locationId);
		return this.battles.get(battleKey);
	}

	// Remove battle
	removeBattle(starId, planetId, locationId) {
		const battleKey = this.createBattleKey(starId, planetId, locationId);
		this.battles.delete(battleKey);
	}

	// Check if player is in any battle
	getPlayerBattle(characterId) {
		for (const battle of this.battles.values()) {
			if (battle.isPlayerInBattle(characterId)) {
				return battle;
			}
		}
		return null;
	}

	// Get all battles in a specific location type
	/* getBattlesByLocationType(locationType) {
		const battles = [];
		for (const [key, battle] of this.battles.entries()) {
			if (battle.locationInfo.type === locationType) {
				battles.push(battle);
			}
		}
		return battles;
	} */
}
const battleManager = new BattleManager();

const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");

async function battleFlow(interaction, battle) {
	// Get current character
	const currentChar = battle.teams[
		battle.getPlayerTeam(battle.currentTurn)
	].find((char) => char.id === battle.currentTurn);

	// Check if current turn is a bot using isBot flag
	if (currentChar.isBot) {
		await handleBotTurn(interaction, battle, currentChar);
	} else {
		await handlePlayerTurn(interaction, battle, currentChar);
	}
}

async function handleBotTurn(interaction, battle, bot) {
	// Get bot's powers
	const powers = await battle.getPlayerPowers(bot.id);

	// Select random power
	const randomPower = powers[Math.floor(Math.random() * powers.length)];

	// Get the opposing team
	const currentTeam = battle.getPlayerTeam(bot.id);
	const opposingTeam = currentTeam === "red" ? "blue" : "red";
	const target = battle.teams[opposingTeam][0]; // Target first opponent

	// Create and send battle status embed
	const embed = createBattleEmbed(battle);
	await interaction.channel.send({ embeds: [embed] });

	// Add a small delay
	await new Promise((resolve) => setTimeout(resolve, 2000));

	// Show bot's action
	await interaction.channel.send(
		`${bot.dataValues.name} used ${randomPower.name} on ${target.name}!`,
	);
	await new Promise((resolve) => setTimeout(resolve, 3000));
	// Move to next turn
	battle.nextTurn();

	// Continue battle flow
	await battleFlow(interaction, battle);
}

async function handlePlayerTurn(interaction, battle, player) {
	const powers = await battle.getPlayerPowers(/* player.id */);

	const embed = createBattleEmbed(battle);

	const actionRow = new ActionRowBuilder().addComponents(
		powers.map((power) =>
			new ButtonBuilder()
				.setCustomId(`power_${power.id}_${battle.currentTurn}`)
				.setLabel(power.name)
				.setStyle(ButtonStyle.Primary),
		),
	);

	const replyMessage = await interaction.followUp({
		embeds: [embed],
		components: [actionRow],
	});

	const filter = (i) => {
		const [prefix, powerId, turn] = i.customId.split("_");
		return (
			prefix === "power" && turn === String(battle.currentTurn) /* &&
			i.user.id === player.id */
		);
	};

	const collector = replyMessage.createMessageComponentCollector({
		filter,
		time: 10000,
	});

	collector.on("collect", async (i) => {
		const [_, powerId, turn] = i.customId.split("_");
		const usedPower = powers.find((p) => p.id === powerId);
		console.log(powerId);
		const currentTeam = battle.getPlayerTeam(battle.currentTurn);
		const opposingTeam = currentTeam === "red" ? "blue" : "red";
		const target = battle.teams[opposingTeam][0].isBot
			? battle.teams[opposingTeam][0].dataValues
			: battle.teams[opposingTeam][0];

		await i.reply(`${player.name} used ${usedPower.name} on ${target.name}!`);
		collector.stop();

		await new Promise((resolve) => setTimeout(resolve, 3000));
		battle.nextTurn();
		await battleFlow(interaction, battle);
	});

	collector.on("end", async (collected, reason) => {
		if (reason === "time") {
			await interaction.channel.send(`${player.name}'s turn timed out!`);
			battle.nextTurn();
			await battleFlow(interaction, battle);
		}
	});
}

function createBattleEmbed(battle) {
	const currentChar = battle.teams[
		battle.getPlayerTeam(battle.currentTurn)
	].find((char) => char.id === battle.currentTurn);
	const embed = new EmbedBuilder()
		.setTitle("Battle in Progress")
		.setColor("#ff0000")
		.setThumbnail(currentChar.dataValues.img);

	/* const redTeamInfo = battle.teams.red
		.map((char) => {
			const turnIndicator =
				char.id === battle.currentTurn ? " (Current Turn)" : "";
			const botIndicator = char.isBot ? " [BOT]" : "";
			return `${char.name}${turnIndicator}${botIndicator}`;
		})
		.join("\n");

	const blueTeamInfo = battle.teams.blue
		.map((char) => {
			const turnIndicator =
				char.id === battle.currentTurn ? " (Current Turn)" : "";
			const botIndicator = char.isBot ? " [BOT]" : "";
			return `${char.name}${turnIndicator}${botIndicator}`;
		})
		.join("\n"); */

	/* embed.addFields(
		{ name: "Red Team", value: redTeamInfo || "No players", inline: true },
		{ name: "Blue Team", value: blueTeamInfo || "No players", inline: true },
	); */

	embed.addFields({
		name: "Turno atual",
		value: `${currentChar.dataValues.name}'s turn!`,
	});

	return embed;
}

module.exports = { Battle, battleManager, battleFlow };
