const { Character } = require("./character");
const { Item } = require("./item");
const { CharacterItem } = require("./character-item");
const { Vehicle } = require("./vehicle");
const { User } = require("./user");

Character.belongsToMany(Item, {
	through: CharacterItem,
	foreignKey: "CharacterId",
});
Item.belongsToMany(Character, {
	through: CharacterItem,
	foreignKey: "ItemId",
});

Character.belongsTo(Vehicle, { foreignKey: "vehicleId" });
Vehicle.hasOne(Character, { foreignKey: "vehicleId" });

User.hasMany(Character);
Character.belongsTo(User);
User.belongsTo(Character, {
	as: "currentCharacter",
	foreignKey: "currentCharacterId",
});

module.exports = { Item, Character, CharacterItem, Vehicle, User };
