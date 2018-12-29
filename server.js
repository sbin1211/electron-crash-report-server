/* eslint-disable no-console */

require("dotenv").config();
const Basic = require("hapi-auth-basic");
const Hapi = require("hapi");
const Inert = require("inert");
const Vision = require("vision");
const database = require("./database.js");
const routes = require("./routes.js");
const sql = require("./sql.js");
const SvelteView = require("./hapi-svelte-view.js");
const validate = require("./validate.js");

const server = new Hapi.Server({
	port: process.env.PORT,
	router: { stripTrailingSlash: true },
});

const main = async () => {
	try {
		const db = await database;

		await db.query(sql);
		await server.register([Basic, Inert, Vision]);

		server.auth.strategy("simple", "basic", { validate });

		server.views({
			engines: { svelte: SvelteView },
			path: "components",
		});

		server.route(routes);
		server.route({
			handler: (request, h) => h.file("favicon.png"),
			method: "GET",
			path: "/favicon.png",
		});
		server.route({
			handler: (request, h) => h.file(`build/${request.params.file}`),
			method: "GET",
			path: "/{file}",
		});

		await server.start();

		console.log(`server running at ${server.info.uri}`);
	} catch (error) {
		throw error;
	}
};

process.on("unhandledRejection", error => {
	console.error(error);
	process.exit(1);
});

main();
