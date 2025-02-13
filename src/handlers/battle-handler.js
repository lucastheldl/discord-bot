class Battle {
	constructor(channelId, firstPlayer, secondPlayer) {
		this.channelId = channelId;
		this.teams = {
			red: [firstPlayer], // Store player objects
			blue: [secondPlayer],
		};
		this.currentTurn = firstPlayer.id; // Track whose turn it is
		this.turnOrder = [firstPlayer.id, secondPlayer.id]; // Array to track turn order
		this.active = true;
	}

	// Add a new player to a team
	addPlayer(player, team) {
		if (!this.active) return false;
		if (!["red", "blue"].includes(team)) return false;

		// Add to team
		this.teams[team].push(player);

		// Add to turn order after current player
		const currentIndex = this.turnOrder.indexOf(this.currentTurn);
		this.turnOrder.splice(currentIndex + 1, 0, player.id);

		return true;
	}

	// Get next player's turn
	nextTurn() {
		const currentIndex = this.turnOrder.indexOf(this.currentTurn);
		this.currentTurn =
			this.turnOrder[(currentIndex + 1) % this.turnOrder.length];
		return this.currentTurn;
	}

	// Check if it's a player's turn
	isPlayerTurn(playerId) {
		return this.currentTurn === playerId;
	}

	// Get current battle status for embed
	async getBattleStatus(sequelize) {
		const redTeamStatus = await Promise.all(
			this.teams.red.map(async (player) => {
				const powers = await this.getPlayerPowers(player.id, sequelize);
				return `${player.username} (Powers: ${powers.map((p) => p.name).join(", ")})`;
			}),
		);

		const blueTeamStatus = await Promise.all(
			this.teams.blue.map(async (player) => {
				const powers = await this.getPlayerPowers(player.id, sequelize);
				return `${player.username} (Powers: ${powers.map((p) => p.name).join(", ")})`;
			}),
		);

		return {
			red: redTeamStatus.join("\n"),
			blue: blueTeamStatus.join("\n"),
			currentTurn: this.currentTurn,
		};
	}

	// Get player's powers from database
	async getPlayerPowers(playerId, sequelize) {
		// Assuming you have a Powers model
		const Powers = sequelize.models.Powers;
		return await Powers.findAll({
			where: {
				userId: playerId,
			},
		});
	}

	// Check if player is in battle
	isPlayerInBattle(playerId) {
		return this.turnOrder.includes(playerId);
	}

	// Get player's team
	getPlayerTeam(playerId) {
		if (this.teams.red.some((p) => p.id === playerId)) return "red";
		if (this.teams.blue.some((p) => p.id === playerId)) return "blue";
		return null;
	}

	// End battle
	endBattle() {
		this.active = false;
	}
}

// Battle Manager to handle multiple battles
class BattleManager {
	constructor() {
		this.battles = new Map(); // Store battles by channel ID
	}

	// Create a new battle
	createBattle(channelId, player1, player2) {
		if (this.battles.has(channelId)) return null;

		const battle = new Battle(channelId, player1, player2);
		this.battles.set(channelId, battle);
		return battle;
	}

	// Get battle by channel ID
	getBattle(channelId) {
		return this.battles.get(channelId);
	}

	// Remove battle
	removeBattle(channelId) {
		this.battles.delete(channelId);
	}
}
const battleManager = new BattleManager();

module.exports = { Battle, battleManager };
