import { Character } from "./character";
import { Item } from "./item";
import { CharacterItem } from "./character-item";
import { Vehicle } from "./vehicle";
import { User } from "./user";
import { Location } from "./location";
import { Planet } from "./planet";
import { Star } from "./star";

// Define associations with proper typing
Character.belongsToMany(Item, {
  through: CharacterItem,
  foreignKey: "CharacterId",
});

Item.belongsToMany(Character, {
  through: CharacterItem,
  foreignKey: "ItemId",
});

// Character-Vehicle associations
Character.belongsTo(Vehicle, {
  foreignKey: "vehicleId",
  as: "currentVehicle",
});

Vehicle.hasMany(Character, {
  foreignKey: "vehicleId",
  as: "characters",
});

// Planet-Location-Vehicle associations
Planet.hasMany(Vehicle, {
  foreignKey: "currentPlanetId",
  as: "vehicles",
});

Vehicle.belongsTo(Planet, {
  foreignKey: "currentPlanetId",
  as: "currentPlanet",
});

Location.hasMany(Vehicle, {
  foreignKey: "currentLocationId",
  as: "vehicles",
});

Vehicle.belongsTo(Location, {
  foreignKey: "currentLocationId",
  as: "currentLocation",
});

// User-Character associations
User.hasMany(Character, {
  foreignKey: "userId",
  as: "characters",
});

Character.belongsTo(User, {
  foreignKey: "userId",
  as: "User",
});

User.belongsTo(Character, {
  as: "currentCharacter",
  foreignKey: "currentCharacterId",
});

// Star-Planet-Vehicle-Character associations
Star.hasMany(Planet, {
  foreignKey: "currentStarId",
  as: "planets",
});

Character.belongsTo(Star, {
  foreignKey: "currentStarId",
  as: "currentStar",
});

Star.hasMany(Vehicle, {
  foreignKey: "currentStarId",
  as: "vehicles",
});

Vehicle.belongsTo(Star, {
  foreignKey: "currentStarId",
  as: "currentStar",
});
Star.hasMany(Character, {
  foreignKey: "currentStarId",
  as: "characters",
});

Character.belongsTo(Star, {
  foreignKey: "currentStarId",
  as: "currentStar",
});

// Planet-Location-Character associations
Planet.hasMany(Character, {
  foreignKey: "currentPlanetId",
  as: "characters",
});

Character.belongsTo(Planet, {
  foreignKey: "currentPlanetId",
  as: "currentPlanet",
});

Location.hasMany(Character, {
  foreignKey: "currentLocationId",
  as: "characters",
});

Character.belongsTo(Location, {
  foreignKey: "currentLocationId",
  as: "currentLocation",
});

// Location-Planet associations
Planet.hasMany(Location, {
  foreignKey: "planetId",
  as: "locations",
});

Location.belongsTo(Planet, {
  foreignKey: "planetId",
  as: "Planet",
});

export { Item, Character, CharacterItem, Vehicle, User, Location, Planet };
