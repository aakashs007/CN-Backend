// const path = require('path');
// const ENV_FILE = '.env.dev';
// const _path = (process.env.NODE_ENV == 'production') ? {} : {path: path.join(__dirname,'..','..','..',ENV_FILE)}
require('dotenv').config();

class Locals {
	static config() {
		return {
			database: process.env.DATABASE || "",
			db_user: process.env.DB_USER || "",
			db_url: process.env.DB_URL || "",
			db_pswd: process.env.DB_PSWD || "",
			jwt_expires_in: process.env.JWT_EXPIRES_IN || "",
			secret_key: process.env.SECRET_KEY || ""
		};
	}
}

module.exports = Locals;