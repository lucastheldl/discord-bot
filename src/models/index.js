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
Vehicle.hasOne(Character, { foreignKey: "vehicleId" });
//user-character
User.hasMany(Character);
Character.belongsTo(User);
User.belongsTo(Character, {
	as: "currentCharacter",
	foreignKey: "currentCharacterId",
});
//location-planet
Planet.hasMany(Location);
Location.belongsTo(Planet);

module.exports = { Item, Character, CharacterItem, Vehicle, User };
