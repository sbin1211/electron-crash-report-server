const Boom = require('boom')

module.exports = function validate (request, user, pass) {
	if (!user || !pass) return Boom.unauthorized()
	if (user !== process.env.AUTH_USER) return Boom.unauthorized()
	if (pass === process.env.AUTH_PASS) {
		return {credentials: {pass, user}, isValid: true}
	} else {
		return Boom.unauthorized()
	}
}
