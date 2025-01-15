const { sequelize } = require("../db-connection");
const Sequelize = require("sequelize");

const Item = sequelize.define("items", {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: Sequelize.STRING,
	type: Sequelize.STRING, // Example: "ore", "wepom", "armour",""
	defence: Sequelize.INTEGER,
	damage: Sequelize.INTEGER,
	class: Sequelize.ENUM("C", "B", "A", "SUPER", "MEGA", "OMEGA"),
});

module.exports = { Item };

//logica pra criar item e adicionar ao personagem o metodo addItem é automatico
/* const item = await Item.create({
	name: "Sword",
	type: "weapon",
	damage: 10,
	class: "B"
});

await character.addItem(item, { 
	through: { quantity: 1, equipped: true }
}); */
