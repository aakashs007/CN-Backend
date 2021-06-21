const express = require('express');
const app = express();
const router = express.Router();
const PORT = 4000;
const bodyParser = require('body-parser');
const cors = require('cors');
const app_routes = require('./src/routes')(router);
const sequelize = require('./src/models');

app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use('/api/v1/cn', (req, res, next) => {
	req.models = sequelize.models;
	req.sequelize = sequelize;
	next();
});

/****Mount routes**/
app.use('/api/v1/cn', app_routes.cn);
/****Mount routes**/

app.listen(PORT, () => {
	console.log(`App is listening on port: ${PORT}`);	
});