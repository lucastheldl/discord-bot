import { sequelize } from "../db-connection";
import { Model, DataTypes, type Optional } from "sequelize";
import type { Planet } from "./planet";
import type { Location } from "./location";
import type { Vehicle } from "./vehicle";
import type { User } from "./user";
import type { Item } from "./item";
import { Star } from "./star";

export const CharacterClass = [
  "C",
  "B",
  "A",
  "SUPER",
  "MEGA",
  "OMEGA",
] as const;

export type CharacterClassType = (typeof CharacterClass)[number];

export interface CharacterAttributes {
  id: number;
  name: string;
  description?: string | null;
  max_health: number;
  max_energy: number;
  current_health: number;
  current_energy: number;
  age: number;
  class: CharacterClassType;
  username: string;
  isInsideVehicle: boolean;
  vehicleId?: number | null;
  currentStarId?: number | null;
  currentPlanetId?: number | null;
  currentLocationId?: number | null;
  userId: string;
  img?: string;
  damage?: number;
  armor?: number;
}

export interface CharacterCreationAttributes
  extends Optional<CharacterAttributes, "id"> {}

export class Character
  extends Model<CharacterAttributes, CharacterCreationAttributes>
  implements CharacterAttributes
{
  public id!: number;
  public name!: string;
  public description!: string | null;
  public max_health!: number;
  public max_energy!: number;
  public current_health!: number;
  public current_energy!: number;
  public age!: number;
  public class!: CharacterClassType;
  public username!: string;
  public isInsideVehicle!: boolean;
  public vehicleId!: number | null;
  public currentStarId!: number | null;
  public currentPlanetId!: number | null;
  public currentLocationId!: number | null;
  public userId!: string;
  public img?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public readonly currentStar?: Star;
  public readonly currentPlanet?: Planet;
  public readonly currentLocation?: Location;
  public readonly currentVehicle?: Vehicle;
  public readonly User?: User;
  public readonly items?: (Item & { characterItem: any })[];

  // Association methods
  public addItem!: (item: Item, options?: any) => Promise<void>;
}

Character.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    max_health: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    max_energy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    current_health: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    current_energy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    class: {
      type: DataTypes.ENUM(...CharacterClass),
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isInsideVehicle: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    vehicleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "vehicles",
        key: "id",
      },
    },
    currentStarId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "stars",
        key: "id",
      },
    },
    currentPlanetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "planets",
        key: "id",
      },
    },
    currentLocationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "locations",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "characters",
    tableName: "characters",
    timestamps: true,
  }
);
