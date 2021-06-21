const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
	return sequelize.define('TADoubt', {
		accepted_time: {
			type: DataTypes.DATE
		},
		escalated_time: {
			type: DataTypes.DATE
		},
		resolved_time: {
			type: DataTypes.DATE
		}
	});
}