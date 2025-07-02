import { sequelize } from "../db-connection";
import { Model, DataTypes, Optional } from "sequelize";

// Define the planet type enum
export const PlanetType = [
  "rock",
  "gas",
  "mecha",
  "ice",
  "lava",
  "ocean",
] as const;
type PlanetTypeType = (typeof PlanetType)[number];

interface PlanetAttributes {
  id: number;
  name: string;
  description: string;
  type: PlanetTypeType;
}

interface PlanetCreationAttributes extends Optional<PlanetAttributes, "id"> {}

class Planet
  extends Model<PlanetAttributes, PlanetCreationAttributes>
  implements PlanetAttributes
{
  public id!: number;
  public name!: string;
  public description!: string;
  public type!: PlanetTypeType;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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

export { Planet };
export type { PlanetAttributes, PlanetCreationAttributes, PlanetTypeType };
