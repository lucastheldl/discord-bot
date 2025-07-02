import { sequelize } from "../db-connection";
import { Model, DataTypes } from "sequelize";
import { Character } from "./character";
import { Item } from "./item";

// Interface for CharacterItem attributes
interface CharacterItemAttributes {
  id: number;
  quantity: number;
  equipped: boolean;
  CharacterId: number;
  ItemId: number;
}

class CharacterItem
  extends Model<CharacterItemAttributes>
  implements CharacterItemAttributes
{
  public id!: number;
  public quantity!: number;
  public equipped!: boolean;
  public CharacterId!: number;
  public ItemId!: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CharacterItem.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    equipped: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    CharacterId: {
      type: DataTypes.INTEGER,
      references: {
        model: Character,
        key: "id",
      },
      allowNull: false,
    },
    ItemId: {
      type: DataTypes.INTEGER,
      references: {
        model: Item,
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "characterItem",
    tableName: "character_items", // Recommended naming for junction tables
    timestamps: true,
  }
);

export { CharacterItem };
export type { CharacterItemAttributes };
