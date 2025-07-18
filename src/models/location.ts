import { sequelize } from "../db-connection";
import { Model, DataTypes, type Optional } from "sequelize";
import type { Planet } from "./planet";
import type { Character } from "./character";
import type { Vehicle } from "./vehicle";

export const LocationType = [
  "city",
  "natural",
  "space_station",
  "outpost",
  "ruins",
] as const;

export type LocationTypeType = (typeof LocationType)[number];

export interface LocationAttributes {
  id: number;
  name: string;
  description: string;
  type: LocationTypeType;
  population: number;
  capital: number;
  planetId?: number | null;
}

export interface LocationCreationAttributes
  extends Optional<LocationAttributes, "id"> {}

export class Location
  extends Model<LocationAttributes, LocationCreationAttributes>
  implements LocationAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public type!: LocationTypeType;
  public population!: number;
  public capital!: number;
  public planetId!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public readonly Planet?: Planet;
  public readonly characters?: Character[];
  public readonly vehicles?: Vehicle[];
}

Location.init(
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
    type: {
      type: DataTypes.ENUM(...LocationType),
      allowNull: false,
    },
    population: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 10,
      },
    },
    capital: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 10,
      },
    },
    planetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "locations",
    tableName: "locations",
    timestamps: true,
  }
);
