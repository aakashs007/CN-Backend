var jwt = require('jsonwebtoken');
const Logger = require('../utility/app-logger');
const Locals = require('../utility/locals').config();
const HanlderController = require('./handler_controller');

class AuthController {

	verifyJwtToken(request, response, next) {
		//Logger.info("AuthController.checkingToken");
		console.log("AuthController.checkingToken");
		try {
			let token = "";
			console.log("request.headers:=====" + JSON.stringify(request.headers));
			if (request.headers['x-auth-token']) {
				token = request.headers['x-auth-token'];
			} else if (request.headers.authorization && request.headers.authorization.split(" ")[1]) {
				token = request.headers.authorization.split(" ")[1];
			}

			jwt.verify(token, Locals.secret_key, function (err, payload) {
				if (err) {
					Logger.debug("AuthController.checkedToken::Token Verification Failed !");
					HanlderController.handleError(request, response, 401, 'UNAUTHORIZED');
					// response.status(401).send({
					//   success: false,
					//   tokenExpired: true,
					//   data: 'Auth token not provided or Expired!'
					// });
					// response.end();
					return;
				} else {
					Logger.trace("AuthController.checkedToken::payload.data:", payload)
					request.user = payload;
					console.log("Token: ", request.user);
					Logger.debug("AuthController.checkedToken::Token verified successfully !");
					next();
				}
			})
		} catch (e) {
			Logger.error("AuthController.checkedToken::Error in catch:==" + JSON.stringify(e));
			HanlderController.handleError(request, response, 500, e);
			// response.status(500).send({
			//   success: false,
			//   data: `Error in processing token! ${e}`
			// });
			// response.end();
			return;
		}
	}

	generateJwtToken(payload) {
		const duration = Locals.token_expire_time || '1h';
		const algo = Locals.jwt_algo || 'HS256';
		const token = jwt.sign({ data: payload }, Locals.secret_key, { expiresIn: duration, algorithm: algo });
		return token;
	}

}

module.exports = new AuthController();