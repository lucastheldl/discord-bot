const { Character } = require("./character");
const { Item } = require("./item");
const { CharacterItem } = require("./character-item");
const { Vehicle } = require("./vehicle");

Character.belongsToMany(Item, { through: CharacterItem, foreignKey: "ItemId" });
Item.belongsToMany(Character, {
	through: CharacterItem,
	foreignKey: "CharacterId",
});

Character.belongsTo(Vehicle, { foreignKey: "vehicleId" });
Vehicle.hasOne(Character, { foreignKey: "vehicleId" });

module.exports = { Item, Character, CharacterItem, Vehicle };
