const { Character } = require("./character");
const { Item } = require("./item");
const { CharacterItem } = require("./character-item");
const { Vehicle } = require("./vehicle");
const { User } = require("./user");
const { Location } = require("./location");
const { Planet } = require("./planet");

Character.belongsToMany(Item, {
	through: CharacterItem,
	foreignKey: "CharacterId",
});
Item.belongsToMany(Character, {
	through: CharacterItem,
	foreignKey: "ItemId",
});

//character-veicle
Character.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "currentVehicle" });
Vehicle.hasMany(Character, { foreignKey: "vehicleId", as: "characters" });

//planets,locations - character
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

//user-character
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

//planets,locations - character
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

//location-planet
Planet.hasMany(Location, {
	foreignKey: "currentPlanetId",
	as: "locations",
});
Location.belongsTo(Planet, {
	foreignKey: "currentPlanetId",
	as: "Planet",
});

module.exports = {
	Item,
	Character,
	CharacterItem,
	Vehicle,
	User,
	Location,
	Planet,
};
