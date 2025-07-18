import { sequelize } from "../db-connection";
import { Model, DataTypes, type Optional } from "sequelize";

export const ItemClass = ["C", "B", "A", "SUPER", "MEGA", "OMEGA"] as const;
export type ItemClassType = (typeof ItemClass)[number];

const ItemType = ["ore", "weapon", "armor", "consumable", "misc"] as const;
export type ItemTypeType = (typeof ItemType)[number];

export interface ItemAttributes {
  id: number;
  name: string;
  type: ItemTypeType;
  defence?: number | null;
  damage?: number | null;
  class: ItemClassType;
}

export interface ItemCreationAttributes
  extends Optional<ItemAttributes, "id"> {}

export class Item
  extends Model<ItemAttributes, ItemCreationAttributes>
  implements ItemAttributes
{
  public id!: number;
  public name!: string;
  public type!: ItemTypeType;
  public defence!: number | null;
  public damage!: number | null;
  public class!: ItemClassType;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Item.init(
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
    type: {
      type: DataTypes.ENUM(...ItemType),
      allowNull: false,
    },
    defence: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    damage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    class: {
      type: DataTypes.ENUM(...ItemClass),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "items",
    tableName: "items",
    timestamps: true,
  }
);
