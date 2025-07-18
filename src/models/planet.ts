import { sequelize } from "../db-connection";
import { Model, DataTypes, type Optional } from "sequelize";
import type { Location } from "./location";
import type { Character } from "./character";
import type { Vehicle } from "./vehicle";

export const PlanetType = [
  "rock",
  "gas",
  "mecha",
  "ice",
  "lava",
  "ocean",
] as const;

export type PlanetTypeType = (typeof PlanetType)[number];

export interface PlanetAttributes {
  id: number;
  name: string;
  description: string;
  type: PlanetTypeType;
}

export interface PlanetCreationAttributes
  extends Optional<PlanetAttributes, "id"> {}

export class Planet
  extends Model<PlanetAttributes, PlanetCreationAttributes>
  implements PlanetAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public type!: PlanetTypeType;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public readonly locations?: Location[];
  public readonly characters?: Character[];
  public readonly vehicles?: Vehicle[];
}

Planet.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...PlanetType),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "planets",
    tableName: "planets",
    timestamps: true,
  }
);
