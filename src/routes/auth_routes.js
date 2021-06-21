const auth_controller = require('../controllers/auth_controller');

module.exports = (router) => {

	router.post(
		'/user/auth',
		auth_controller.verifyJwtToken
	);

	return router;
}