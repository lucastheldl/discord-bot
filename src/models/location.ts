import { sequelize } from "../db-connection";
import { Model, DataTypes, Optional } from "sequelize";
import { Planet } from "./planet";

// Define the location type enum
export const LocationType = [
  "city",
  "natural",
  "space_station",
  "outpost",
  "ruins",
] as const;
type LocationTypeType = (typeof LocationType)[number];

interface LocationAttributes {
  id: number;
  name: string;
  description: string;
  type: LocationTypeType;
  population: number;
  capital: number;
  planetId?: number | null;
}

interface LocationCreationAttributes
  extends Optional<LocationAttributes, "id"> {}

class Location
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

  // Associations will be added by Sequelize
  public readonly Planet?: Planet;
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
      references: {
        model: Planet,
        key: "id",
      },
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

export { Location };
export type {
  LocationAttributes,
  LocationCreationAttributes,
  LocationTypeType,
};
