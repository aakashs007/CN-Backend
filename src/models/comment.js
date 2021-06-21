const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	return sequelize.define('Comment', {
		comment: {
			type: DataTypes.TEXT,
			allowNull: false
		}
	});
}