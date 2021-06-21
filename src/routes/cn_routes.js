const auth_controller = require('../controllers/auth_controller');
const cn_controller = require('../controllers/cn_controller');

module.exports = (router) => {

	router.post(
		'/auth',
		cn_controller.authUser
	);

	router.post(
		'/doubt',
		auth_controller.verifyJwtToken,
		cn_controller.raiseDoubt
	);

	router.post(
		'/comment',
		auth_controller.verifyJwtToken,
		cn_controller.postComment
	);

	router.post(
		'/doubt/action',
		auth_controller.verifyJwtToken,
		cn_controller.actionOnDoubt
	);

	router.get(
		'/ta/report',
		auth_controller.verifyJwtToken,
		cn_controller.taReport
	);

	router.get(
		'/doubt',
		auth_controller.verifyJwtToken,
		cn_controller.getDoubts
	);

	return router;
}