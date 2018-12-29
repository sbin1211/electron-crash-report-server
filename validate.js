const Boom = require("boom");

module.exports = (request, user, pass) => {
	if (!user || !pass) {
		return Boom.unauthorized();
	}
	if (user !== process.env.AUTH_USER) {
		return Boom.unauthorized();
	}
	if (pass !== process.env.AUTH_PASS) {
		return Boom.unauthorized();
	}
	return { credentials: { pass, user }, isValid: true };
};
