import { sequelize } from "../db-connection";
import { Model, DataTypes, Optional } from "sequelize";
import { Planet } from "./planet";
import { Location } from "./location";

// Define enums for vehicle types and classes
export const VehicleType = [
  "spaceship",
  "car",
  "bike",
  "mech",
  "aircraft",
  "watercraft",
] as const;
type VehicleTypeType = (typeof VehicleType)[number];

export const VehicleClass = ["C", "B", "A", "SUPER", "MEGA", "OMEGA"] as const;
type VehicleClassType = (typeof VehicleClass)[number];

// Interface for Vehicle attributes
interface VehicleAttributes {
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
  currentPlanetId?: number | null;
  currentLocationId?: number | null;
}

// Interface for creation attributes
interface VehicleCreationAttributes extends Optional<VehicleAttributes, "id"> {}

class Vehicle
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
  public currentLocationId!: number | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations (added by Sequelize)
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
        isUrl: true, // Assuming img stores a URL
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

export { Vehicle };
export type {
  VehicleAttributes,
  VehicleCreationAttributes,
  VehicleTypeType,
  VehicleClassType,
};
