import type { SlashCommandBuilder, CommandInteraction } from "discord.js";

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: CommandInteraction) => Promise<void>;
}

export interface BattleParticipant {
  id: number;
  name: string;
  img?: string;
  isBot?: boolean;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  damage?: number;
  armor?: number;
  class?: string;
}

export type Team = "red" | "blue";
export type LocationType = "star" | "planet" | "location";

export interface Power {
  id: string;
  name: string;
  accuracy?: number;
  damage?: number;
}

export interface LocationInfo {
  type: LocationType;
  id: number;
}

export interface VehicleOption {
  id: string;
  name: string;
}
