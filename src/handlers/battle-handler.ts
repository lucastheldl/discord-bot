import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type BaseInteraction,
  type MessageComponentInteraction,
  type InteractionReplyOptions,
  ChannelType,
  ComponentType,
  APIActionRowComponent,
} from "discord.js";
import type { BattleParticipant, Team, Power, LocationInfo } from "../types";

class Battle {
  locationInfo: LocationInfo;
  teams: { red: BattleParticipant[]; blue: BattleParticipant[] };
  currentTurn: number;
  turnOrder: number[];
  active: boolean;

  constructor(
    locationInfo: LocationInfo,
    firstPlayer: BattleParticipant,
    secondPlayer: BattleParticipant
  ) {
    this.locationInfo = locationInfo;
    this.teams = {
      red: [firstPlayer],
      blue: [secondPlayer],
    };
    this.currentTurn = firstPlayer.id;
    this.turnOrder = [firstPlayer.id, secondPlayer.id];
    this.active = true;
  }

  addCharacter(char: BattleParticipant, team: Team): boolean {
    if (!this.active) return false;
    if (!["red", "blue"].includes(team)) return false;

    this.teams[team].push(char);
    const currentIndex = this.turnOrder.indexOf(this.currentTurn);
    this.turnOrder.splice(currentIndex + 1, 0, char.id);
    return true;
  }

  nextTurn(): number {
    const currentIndex = this.turnOrder.indexOf(this.currentTurn);
    this.currentTurn =
      this.turnOrder[(currentIndex + 1) % this.turnOrder.length];
    return this.currentTurn;
  }

  isPlayerTurn(characterId: number): boolean {
    return this.currentTurn === characterId;
  }

  async getPlayerPowers(): Promise<Power[]> {
    return [
      { id: "1", name: "fire ball" },
      { id: "2", name: "Yonar blast" },
    ];
  }

  isPlayerInBattle(characterId: number): boolean {
    return this.turnOrder.includes(characterId);
  }

  getPlayerTeam(characterId: number): Team | null {
    if (this.teams.red.some((p) => p.id === characterId)) return "red";
    if (this.teams.blue.some((p) => p.id === characterId)) return "blue";
    return null;
  }

  endBattle(): void {
    this.active = false;
  }
}

class BattleManager {
  private battles: Map<string, Battle>;

  constructor() {
    this.battles = new Map();
  }

  createBattleKey(
    starId: number,
    planetId: number,
    locationId: number
  ): string {
    return `star-${starId}-planet-${planetId}-location-${locationId}`;
  }

  createBattle(
    starId: number,
    planetId: number,
    locationId: number,
    player1: BattleParticipant,
    player2: BattleParticipant
  ): Battle | null {
    const battleKey = this.createBattleKey(starId, planetId, locationId);
    if (this.battles.has(battleKey)) return null;

    const battle = new Battle(
      { type: "location", id: locationId },
      player1,
      player2
    );
    this.battles.set(battleKey, battle);
    return battle;
  }

  getBattle(
    starId: number,
    planetId: number,
    locationId: number
  ): Battle | undefined {
    const battleKey = this.createBattleKey(starId, planetId, locationId);
    return this.battles.get(battleKey);
  }

  removeBattle(starId: number, planetId: number, locationId: number): void {
    const battleKey = this.createBattleKey(starId, planetId, locationId);
    this.battles.delete(battleKey);
  }

  getPlayerBattle(characterId: number): Battle | null {
    for (const battle of this.battles.values()) {
      if (battle.isPlayerInBattle(characterId)) {
        return battle;
      }
    }
    return null;
  }
}

const battleManager = new BattleManager();

async function battleFlow(
  interaction: BaseInteraction,
  battle: Battle
): Promise<void> {
  if (!interaction.isRepliable()) return;

  const currentChar = battle.teams[
    battle.getPlayerTeam(battle.currentTurn)!
  ].find((char) => char.id === battle.currentTurn);

  if (!currentChar) return;

  if (currentChar.isBot) {
    await handleBotTurn(interaction, battle, currentChar);
  } else {
    await handlePlayerTurn(interaction, battle, currentChar);
  }
}

async function handleBotTurn(
  interaction: BaseInteraction,
  battle: Battle,
  bot: BattleParticipant
): Promise<void> {
  if (
    !interaction.channel ||
    interaction.channel.type === ChannelType.DM ||
    interaction.channel.type === ChannelType.GroupDM
  )
    return;

  const powers = await battle.getPlayerPowers();
  const randomPower = powers[Math.floor(Math.random() * powers.length)];
  const currentTeam = battle.getPlayerTeam(bot.id)!;
  const opposingTeam = currentTeam === "red" ? "blue" : "red";
  const target = battle.teams[opposingTeam][0];

  const embed = createBattleEmbed(battle);
  await interaction.channel.send({ embeds: [embed] });

  await new Promise((resolve) => setTimeout(resolve, 2000));

  await interaction.channel.send(
    `${bot.name} used ${randomPower.name} on ${target.name}!`
  );

  await new Promise((resolve) => setTimeout(resolve, 3000));

  battle.nextTurn();
  await battleFlow(interaction, battle);
}

async function handlePlayerTurn(
  interaction: BaseInteraction,
  battle: Battle,
  player: BattleParticipant
): Promise<void> {
  if (!interaction.isRepliable()) return;

  const powers = await battle.getPlayerPowers();
  const embed = createBattleEmbed(battle);

  const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    powers.map((power) =>
      new ButtonBuilder()
        .setCustomId(`power_${power.id}_${battle.currentTurn}`)
        .setLabel(power.name)
        .setStyle(ButtonStyle.Primary)
    )
  );

  const replyOptions: InteractionReplyOptions = {
    embeds: [embed],
    components: [actionRow.toJSON()],
  };

  const replyMessage = await interaction.followUp(replyOptions);

  const filter = (i: MessageComponentInteraction) => {
    if (i.componentType !== ComponentType.Button) return false;
    const [prefix, powerId, turn] = i.customId.split("_");
    return prefix === "power" && Number(turn) === battle.currentTurn;
  };

  const collector = replyMessage.createMessageComponentCollector({
    filter,
    time: 10000,
  });

  collector.on("collect", async (i: MessageComponentInteraction) => {
    if (!i.isButton()) return;

    const [_, powerId] = i.customId.split("_");
    const usedPower = powers.find((p) => p.id === powerId)!;
    const currentTeam = battle.getPlayerTeam(battle.currentTurn)!;
    const opposingTeam = currentTeam === "red" ? "blue" : "red";
    const target = battle.teams[opposingTeam][0];

    await i.reply(`${player.name} used ${usedPower.name} on ${target.name}!`);
    collector.stop();

    await new Promise((resolve) => setTimeout(resolve, 3000));

    battle.nextTurn();
    await battleFlow(interaction, battle);
  });

  collector.on("end", async (collected, reason) => {
    if (
      reason === "time" &&
      interaction.channel &&
      interaction.channel.type !== ChannelType.DM &&
      interaction.channel.type !== ChannelType.GroupDM
    ) {
      await interaction.channel.send(`${player.name}'s turn timed out!`);
      battle.nextTurn();
      await battleFlow(interaction, battle);
    }
  });
}

function createBattleEmbed(battle: Battle): EmbedBuilder {
  const currentTeam = battle.getPlayerTeam(battle.currentTurn);
  if (!currentTeam) return new EmbedBuilder().setTitle("Invalid Battle State");

  const currentChar = battle.teams[currentTeam].find(
    (char) => char.id === battle.currentTurn
  );

  if (!currentChar) return new EmbedBuilder().setTitle("Invalid Battle State");

  return new EmbedBuilder()
    .setTitle("Battle in Progress")
    .setColor("#ff0000")
    .setThumbnail(currentChar.img || null)
    .addFields({
      name: "Current Turn",
      value: `${currentChar.name}'s turn!`,
    });
}

export { Battle, battleManager, battleFlow, type BattleParticipant };
