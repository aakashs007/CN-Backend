const auth_controller = require('./auth_controller');
const handler_controller = require('./handler_controller');
const bcrypt = require('bcrypt');
const { QueryTypes } = require('sequelize');

class CNController {
	constructor() {
		Date.prototype.toMysqlFormat = function() {
			return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
		};
	}

  async authUser(request, response, next) {
		try {
			const { email, password, type, auth_type } = request.body;
			console.log(request.body)
			if(!email || !password || !type || !auth_type) throw 'Invalid Values';

			const { User } = request.models;

			let _user_inst = await User.findOne({
				where: { email }
			});

			if(auth_type == 'signin') {
				if(!_user_inst) {
		      handler_controller.sendResponse(request, response, 401, { 'msg': 'Email id not found!' });
					return;
				}
				const pswd_math = await bcrypt.compare(password, _user_inst.dataValues.password);
				if(!pswd_math) {
		      handler_controller.sendResponse(request, response, 401, { 'msg': 'Password did not match!' });
					return;
				}
			} else if(auth_type == 'signup') {
				if(_user_inst) {
		      handler_controller.sendResponse(request, response, 401, { 'msg': 'Email already exists' });
					return;
				}
				const hash = await bcrypt.hash(password, 10);
				_user_inst = await User.create({ email, password: hash, type });
			} else {
				throw 'Auth type not valid!';
			}

			const _user = _user_inst.dataValues || _user_inst[0].dataValues;
			const payload = {
				user_id: _user.id,
				type
			};
			
      handler_controller.sendResponse(request, response, 200, { 'token': auth_controller.generateJwtToken(payload) });
		} catch(err) {
			console.log(err)
      handler_controller.handleError(request, response, 500, err);
		}
	}

	async raiseDoubt(request, response, next) {
		try {
			const { title, desc } = request.body;
			if(!title || !desc) throw 'Invalid Values';
			if(request.user.data.type != 's') throw 'Only students can raise doubts!';

			const { Doubt } = request.models;
			const s_id = request.user.data.user_id;

			const _doubt_ins = await Doubt.create({ title, desc, is_resolved: false, s_id });

      handler_controller.sendResponse(request, response, 200, { doubt: { id: _doubt_ins.dataValues.id } });
		} catch(err) {
			console.log(err)
      handler_controller.handleError(request, response, 500, err);
		}
	}

	async getDoubts(request, response, next) {
		try {
			const { type } = request.query;

			let result;
			switch(type) {
				case 'res':
					result = await request.sequelize.query(
						`select d.id as doubt_id,d.title,d.desc,d.is_resolved,d.ans,c.comment,u.email  from Doubts as d join Comments as c on d.id = c.dt_id join Users as u on u.id = c.s_id where d.is_resolved = 1;`,
						{ type: QueryTypes.SELECT }
					);
					console.log("res",result)
				break;
				
				case 'unres':
				default:
					result = await request.sequelize.query(
						`select d.id as doubt_id, d.title,d.desc,d.is_resolved,d.ans,c.comment,u.email  from Doubts as d join Comments as c on d.id = c.dt_id join Users as u on u.id = c.s_id where d.is_resolved = 0;`,
						{ type: QueryTypes.SELECT }
					);
				break;
			}

      handler_controller.sendResponse(request, response, 200, { result });
		} catch(err) {
			console.log(err)
      handler_controller.handleError(request, response, 500, err);
		}
	}

	async postComment(request, response, next) {
		try {
			const { doubt_id, comment } = request.body;
			if(!doubt_id || !comment) return;
			const s_id = request.user.data.user_id;
			if(request.user.data.type != 's') throw 'Ony students can post comment for now!'

			const { Comment } = request.models;
			// const comments_by_user = await Comment.find({ where: { s_id, dt_id: doubt_id } });

			const comment_inst = await Comment.create({ comment, s_id, dt_id: doubt_id });
      handler_controller.sendResponse(request, response, 200, { comment });
		} catch(err) {
			console.log(err)
      handler_controller.handleError(request, response, 500, err);
		}
	}

	async actionOnDoubt(request, response, next) {
		try {
			const { type, doubt_id, ans } = request.body;
			if(!doubt_id || !type) throw 'Invalid input params provided!';
			if(request.user.data.type != 't') throw 'Only TAs can take actions on raised doubts';

			const { TADoubt, Doubt } = request.models;
			const ta_id = request.user.data.user_id;

			const ta_doubt_ins = await TADoubt.findOne({
				where: { dt_id: doubt_id, ta_id }
			});

			const curr_time = new Date().toMysqlFormat();

			switch(type) {
				case 'accept':
					if(!ta_doubt_ins) {
						// allow to accept
						await TADoubt.create({ dt_id: doubt_id, ta_id, accepted_time: curr_time });
					} else {
						throw 'Already accepted by this TA';
					}
				break;

				case 'escalate':
					if(!ta_doubt_ins) {
						throw 'You have not accepted this doubt!'
					}	else {
						await TADoubt.update({ escalated_time: curr_time }, { where: { dt_id: doubt_id, ta_id } });
					}
				break;
				
				case 'ans':
					if(!ta_doubt_ins) {
						throw 'You have not accepted this doubt!'
					} else if(!ans) {
						throw 'Answer not provided by the TA!';
					} else if(ta_doubt_ins.dataValues.escalated_time) {
						throw 'You have already escalated this doubt!';
					} else if(ta_doubt_ins.dataValues.resolved_time) {
						throw 'This doubt is already resolved!';
					} else {
						await Promise.all([
							TADoubt.update({ resolved_time: curr_time }, { where: { dt_id: doubt_id, ta_id } }),
							Doubt.update({ is_resolved: true, ans }, { where: { id: doubt_id } })
						]);
					}
				break;
				
				default:
					throw 'No valid params provided!';
			}

			handler_controller.sendResponse(request, response, 200, { });
		} catch(err) {
			console.log(err)
      handler_controller.handleError(request, response, 500, err);
		}
	}

	async taReport(request, response, next) {
		try {
			const total_report = await Promise.all([
				request.sequelize.query(
					`select tmp.*,u.email from Users as u join (select t.ta_id, sum(if(t.accepted_time is not null, 1, 0)) as total_db_accepted, sum(if(t.escalated_time is not null, 1, 0)) as total_db_escalated, sum(if(t.resolved_time is not null, 1, 0)) as total_db_resolved, avg(if(t.resolved_time is not null and t.accepted_time is not null, t.resolved_time - t.accepted_time, 0)) as avg_resolution_time from TADoubts as t group by t.ta_id) as tmp on u.id = tmp.ta_id where u.type = 't';`,
					{ type: QueryTypes.SELECT }
				),
				request.sequelize.query(`select count(*) as total_doubts, sum(if(d.is_resolved = 1, 1, 0)) as total_resolved from Doubts as d;`, { type: QueryTypes.SELECT }),
				request.sequelize.query(`select avg(TIMEDIFF(t.resolved_time, d.createdAt)) as avg_time from Doubts as D join TADoubts as t on t.dt_id = d.id where d.is_resolved = 1 and t.resolved_time is not null;`, { type: QueryTypes.SELECT }),
				request.sequelize.query(`select count(*) as esc_time from TADoubts as t where t.escalated_time is not null group by t.dt_id`, { type: QueryTypes.SELECT })
			]);

			handler_controller.sendResponse(request, response, 200, { total_report });
		} catch(err) {
			console.log(err)
      handler_controller.handleError(request, response, 500, err);
		}
	}

	async userLogout(request, response, next) {

	}
}

function twoDigits(d) {
	if(0 <= d && d < 10) return "0" + d.toString();
	if(-10 < d && d < 0) return "-0" + (-1*d).toString();
	return d.toString();
}

module.exports = new CNController();