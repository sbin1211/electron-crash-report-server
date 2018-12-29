const { readdirSync } = require("fs");

module.exports = readdirSync("routes")
	// eslint-disable-next-line global-require, import/no-dynamic-require
	.map(route => require(`./routes/${route}`))
	.reduce((a, b) => a.concat(b), []);
