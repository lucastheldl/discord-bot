import { sequelize } from "../db-connection";
import { Model, DataTypes, Optional, EnumDataType } from "sequelize";

// Define the character class enum
export const CharacterClass = [
  "C",
  "B",
  "A",
  "SUPER",
  "MEGA",
  "OMEGA",
] as const;
type CharacterClassType = (typeof CharacterClass)[number];

// Interface for character attributes
interface CharacterAttributes {
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
  currentPlanetId?: number | null;
  currentLocationId?: number | null;
  userId: string;
}

// Interface for creation attributes (optional fields can be omitted during creation)
interface CharacterCreationAttributes
  extends Optional<CharacterAttributes, "id"> {}

class Character
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

  // Foreign keys
  public vehicleId!: number | null;
  public currentPlanetId!: number | null;
  public currentLocationId!: number | null;
  public userId!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
      references: {
        model: "vehicles",
        key: "id",
      },
      allowNull: true,
    },
    currentPlanetId: {
      type: DataTypes.INTEGER,
      references: {
        model: "planets",
        key: "id",
      },
      allowNull: true,
    },
    currentLocationId: {
      type: DataTypes.INTEGER,
      references: {
        model: "locations",
        key: "id",
      },
      allowNull: true,
    },
    userId: {
      type: DataTypes.STRING,
      references: {
        model: "users",
        key: "id",
      },
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "characters",
    tableName: "characters", // Explicit table name
    timestamps: true, // Ensure timestamps are enabled
  }
);

export { Character };
export type {
  CharacterAttributes,
  CharacterCreationAttributes,
  CharacterClassType,
};
