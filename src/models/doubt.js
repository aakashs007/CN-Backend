const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	return sequelize.define('Doubt', {
		title: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		desc: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		is_resolved: {
			type: DataTypes.BOOLEAN
		},
		ans: {
			type: DataTypes.TEXT
		}
	});
}