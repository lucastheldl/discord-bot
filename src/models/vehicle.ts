import { sequelize } from "../db-connection";
import { Model, DataTypes, type Optional } from "sequelize";
import { Planet } from "./planet";
import { Location } from "./location";
import { Star } from "./star";

export const VehicleType = [
  "spaceship",
  "car",
  "bike",
  "mech",
  "aircraft",
  "watercraft",
] as const;

export type VehicleTypeType = (typeof VehicleType)[number];

export const VehicleClass = ["C", "B", "A", "SUPER", "MEGA", "OMEGA"] as const;
export type VehicleClassType = (typeof VehicleClass)[number];

export interface VehicleAttributes {
  id: number;
  name: string;
  description: string;
  img: string;
  type: VehicleTypeType;
  currentFuel: number;
  maxFuel: number;
  armor: number;
  damage: number;
  class: VehicleClassType;
  currentStarId?: number | null;
  currentPlanetId?: number | null;
  currentLocationId?: number | null;
}

export interface VehicleCreationAttributes
  extends Optional<VehicleAttributes, "id"> {}

export class Vehicle
  extends Model<VehicleAttributes, VehicleCreationAttributes>
  implements VehicleAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public img!: string;
  public type!: VehicleTypeType;
  public currentFuel!: number;
  public maxFuel!: number;
  public armor!: number;
  public damage!: number;
  public class!: VehicleClassType;
  public currentPlanetId!: number | null;
  public currentStarId!: number | null;
  public currentLocationId!: number | null;
  public readonly currentStar!: Star;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly currentPlanet?: Planet;
  public readonly currentLocation?: Location;
}

Vehicle.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    img: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    type: {
      type: DataTypes.ENUM(...VehicleType),
      allowNull: false,
    },
    currentFuel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    maxFuel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    armor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    damage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    class: {
      type: DataTypes.ENUM(...VehicleClass),
      allowNull: false,
    },
    currentStarId: {
      type: DataTypes.INTEGER,
      references: {
        model: Star,
        key: "id",
      },
      allowNull: true,
    },
    currentPlanetId: {
      type: DataTypes.INTEGER,
      references: {
        model: Planet,
        key: "id",
      },
      allowNull: true,
    },
    currentLocationId: {
      type: DataTypes.INTEGER,
      references: {
        model: Location,
        key: "id",
      },
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "vehicles",
    tableName: "vehicles",
    timestamps: true,
    indexes: [
      {
        fields: ["name"],
        unique: true,
      },
      {
        fields: ["currentPlanetId"],
      },
      {
        fields: ["currentLocationId"],
      },
    ],
  }
);
