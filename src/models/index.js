const { Sequelize } = require('sequelize');
const Locals = require('../utility/locals').config();
const userModel = require('./user');
const doubtModel = require('./doubt');
const commentModel = require('./comment');
const ta_doubtModel = require('./ta_doubt');

/**Database**/
const sequelize = new Sequelize(Locals.database, Locals.db_user, Locals.db_pswd, {
	host: Locals.db_url,
	dialect: 'mysql'
});

sequelize.authenticate().
	then(() => {
		// sync models with database
		syncModels();
	}).
	catch((e) => console.log(`Database connection error!! ${e}`))
/**Database**/


function syncModels() {
	const user = userModel(sequelize);
	const doubt = doubtModel(sequelize);
	const comment = commentModel(sequelize);
	const ta_doubt = ta_doubtModel(sequelize);

	/**relations */
	user.hasMany(doubt, { foreignKey: { name: 's_id', allowNull: false, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' } });
	doubt.belongsTo(user, { foreignKey: { name: 's_id', allowNull: false, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' } });
	user.hasOne(comment, { foreignKey: { name: 's_id', allowNull: false, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' } });
	comment.belongsTo(user, { foreignKey: { name: 's_id', allowNull: false, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' } });
	user.hasMany(ta_doubt, { foreignKey: { name: 'ta_id', allowNull: false, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' } });
	ta_doubt.belongsTo(user, { foreignKey: { name: 'ta_id', allowNull: false, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' } });

	doubt.hasMany(comment, { foreignKey: { name: 'dt_id', allowNull: false, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' } });
	comment.belongsTo(doubt, { foreignKey: { name: 'dt_id', allowNull: false, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' } });
	doubt.hasMany(ta_doubt, { foreignKey: { name: 'dt_id', allowNull: false, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' } });
	ta_doubt.belongsTo(doubt, { foreignKey: { name: 'dt_id', allowNull: false, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' } });
	/**relations */

	sequelize.sync()
		.then(() => console.log("All models were synchronized successfully."))
		.catch(e => console.log("Error in syncing models", e))
}

module.exports = sequelize;