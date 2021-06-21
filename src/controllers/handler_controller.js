const Locals = require('../utility/locals').config();
const error_object = {}//require('../exception/error_codes');

class HandlerController {

	static sendResponse(request, response, status = 200, payload = {}) {
		const response_obj = {
			success: true,
			error: false,
			status,
			data: payload,
			message: HandlerController.messageByStatus(status).message
		}

		response.status(status).send(response_obj);
		response.end();
	}

	static handleError(request, response, status = 500, error = {}) {
		let code = null, message = null;

		if (typeof error === 'string' && error_object[error]) {
			status = error_object[error]['status_code'];
			code = error;
			message = error_object[error]['text'][Locals.language]
		}

		const error_obj = {
			success: false,
			error: true,
			status,
			message: {
				general: {
					code: code || HandlerController.messageByStatus(status).code,
					message: message || HandlerController.messageByStatus(status).message
				}
			},
		}

		response.status(status).send(error_obj);
		response.end();
	}

	static messageByStatus(status) {
		switch (status) {
			case 200:
				return {
					code: 'SUCCESS',
					message: 'Request was successfull!'
				}
			case 201:
				return {
					code: 'SUCCESS',
					message: 'Resource created successfully!'
				}
			case 404:
				return {
					code: 'NOT_FOUND',
					message: 'Not found!'
				}
			case 401:
				return {
					code: 'UNAUTHORIZED',
					message: 'Unauthorized error!'
				}
			case 409:
				return {
					code: 'DUPLICATE',
					message: 'Already exist in the database!'
				}
			case 500:
				return {
					code: 'INTERNAL_ERROR',
					message: 'Internal server error!'
				}
			default:
				return {
					code: 'UNKNOWN',
					message: 'Unknown'
				}
		}
	}

}

module.exports = HandlerController;