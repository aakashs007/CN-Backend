const cn = require('./cn_routes');

module.exports = (router) => {
	return {
		cn: cn(router)
	};
};