const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	return sequelize.define('User', {
		name: {
			type: DataTypes.STRING
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false
		},
		type: {
			type: DataTypes.ENUM('s', 't'),
			allowNull: false
		},				
	});
}