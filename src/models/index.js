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
Character.belongsTo(Vehicle, { foreignKey: "vehicleId" });
Vehicle.hasMany(Character, { foreignKey: "vehicleId" });
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
User.hasMany(Character);
Character.belongsTo(User);
User.belongsTo(Character, {
	as: "currentCharacter",
	foreignKey: "currentCharacterId",
});
//planets,locations - character
Planet.hasMany(Character);
Character.belongsTo(Planet, {
	foreignKey: "currentPlanetId",
	as: "currentPlanet",
});
Location.hasMany(Character);
Character.belongsTo(Location, {
	foreignKey: "currentLocationId",
	as: "currentLocation",
});

//location-planet
Planet.hasMany(Location);
Location.belongsTo(Planet);

module.exports = {
	Item,
	Character,
	CharacterItem,
	Vehicle,
	User,
	Location,
	Planet,
};
