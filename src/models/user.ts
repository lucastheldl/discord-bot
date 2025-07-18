import { sequelize } from "../db-connection";
import { Model, DataTypes } from "sequelize";
import type { Character } from "./character";

export interface UserAttributes {
  id: string;
  name: string;
  currentCharacterId?: number | null;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public currentCharacterId!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Association properties
  public readonly Characters?: Character[];
  public readonly currentCharacter?: Character;
}

User.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    currentCharacterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "users",
    tableName: "users",
    timestamps: true,
  }
);
