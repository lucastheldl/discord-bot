import { sequelize } from "../db-connection";
import { Model, DataTypes } from "sequelize";
import { Character } from "./character";

interface UserAttributes {
  id: string;
  name: string;
  currentCharacterId?: number | null;
}

class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public currentCharacterId!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations will be added by Sequelize
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
      references: {
        model: Character,
        key: "id",
      },
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

export { User };
export type { UserAttributes };
