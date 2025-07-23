import { sequelize } from "../db-connection";
import { Model, DataTypes, type Optional } from "sequelize";
import type { Location } from "./location";
import type { Character } from "./character";
import type { Vehicle } from "./vehicle";
import { Planet } from "./planet";

export const StarType = ["small", "giant", "huge", "black", "neutron"] as const;

export type StarTypeType = (typeof StarType)[number];

export interface StarAttributes {
  id: number;
  name: string;
  description: string;
  type: StarTypeType;
}

export interface StarCreationAttributes
  extends Optional<StarAttributes, "id"> {}

export class Star
  extends Model<StarAttributes, StarCreationAttributes>
  implements StarAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public type!: StarTypeType;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public readonly planets?: Planet[];
  public readonly characters?: Character[];
  public readonly vehicles?: Vehicle[];
}

Star.init(
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
      type: DataTypes.ENUM(...StarType),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "stars",
    tableName: "stars",
    timestamps: true,
  }
);
