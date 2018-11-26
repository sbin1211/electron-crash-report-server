/* eslint-disable max-lines, max-lines-per-function, max-statements, no-console, no-process-env */

import "dotenv/config";
import { unlink, writeFile } from "fs";
import Basic from "hapi-auth-basic";
import Boom from "boom";
import Handlebars from "handlebars";
import Hapi from "hapi";
import Inert from "inert";
import massive from "massive";
import { promisify } from "util";
import { resolve } from "path";
import SQL from "./lib/sql.js";
import { tmpdir } from "os";
import Vision from "vision";
import { walkStack } from "minidump";

const DUPLICATE_COLUMN = "42701";
const UNDEFINED_TABLE = "42P01";
const unlinkAsync = promisify(unlink);
const walkStackAsync = promisify(walkStack);
const writeFileAsync = promisify(writeFile);

const server = new Hapi.Server({
	port: process.env.PORT,
	router: { stripTrailingSlash: true },
});

const validate = (request, user, pass) => {
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

const main = async () => {
	const auth = "simple";
	const GET = "GET";
	const POST = "POST";
	const PATCH = "PATCH";
	const DELETE = "DELETE";
	const NOT_FOUND = 404;

	let database = null;
	let dumps = null;

	// Connect to database
	try {
		database = await massive(process.env.DATABASE_URL);
	} catch (error) {
		console.error(error);
		throw error;
	}

	// Check for pre-1.x database
	try {
		dumps = await database.query("SELECT * FROM dumps");
	} catch (error) {
		if (error.code !== UNDEFINED_TABLE) {
			console.error(error);
			throw error;
		}
	}

	// Upgrade pre-1.x database
	if (dumps) {
		// Add new columns to reports
		try {
			const sql = "ALTER TABLE reports ADD COLUMN";
			await database.query(`${sql} dump bytea`);
			await database.query(`${sql} open boolean DEFAULT TRUE`);
			await database.query(`${sql} closed_at timestamptz`);
			await database.query(`${sql} updated_at timestamptz DEFAULT now()`);
		} catch (error) {
			if (error.code !== DUPLICATE_COLUMN) {
				console.error(error);
				throw error;
			}
		}

		// Migrate dumps table to reports.dump
		try {
			await Promise.all(
				dumps.map(async dump => {
					await database.reports.update({
						dump: dump.file,
						id: dump.report_id,
					});
				})
			);
		} catch (error) {
			console.error(error);
			throw error;
		}

		// Add NOT NULL to dump column
		try {
			await database.query(
				"ALTER TABLE reports ALTER COLUMN dump SET NOT NULL"
			);
		} catch (error) {
			console.error(error);
			throw error;
		}

		// Drop old dumps table
		try {
			await database.query("DROP TABLE dumps");
		} catch (error) {
			console.error(error);
			throw error;
		}
	}

	// Prepare database
	try {
		await database.query(SQL);
	} catch (error) {
		console.error(error);
		throw error;
	}

	// Load and configure plugins
	try {
		await server.register([Basic, Inert, Vision]);
		server.auth.strategy(auth, "basic", { validate });
		server.views({
			engines: {
				hbs: Handlebars,
			},
			layout: true,
			path: "views",
		});
	} catch (error) {
		console.error(error);
		throw error;
	}

	// Application state
	const {
		env: { NODE_ENV, AUTH_USER, AUTH_PASS },
	} = process;
	server.app.database = database;
	server.app.environment = NODE_ENV;
	server.app.username = AUTH_USER;
	server.app.password = AUTH_PASS;
	server.app.authorization = `${server.app.username}:${server.app.password}`;

	// Route: GET /
	server.route({
		method: GET,
		options: {
			auth,
			handler: async (request, h) => {
				try {
					const buffer = Buffer.from(server.app.authorization);
					const authorization = buffer.toString("base64");
					const isSecure = server.app.environment === "production";
					const options = { isHttpOnly: false, isSecure };
					const sql = "SELECT body, created_at, id, open FROM";
					const query = `${sql} reports ORDER BY created_at DESC`;

					let reports = await server.app.database.query(query);
					let applications = reports
						// eslint-disable-next-line no-underscore-dangle
						.map(i => i.body._productName)
						.filter(i => i)
						.sort();

					reports = JSON.stringify(reports);
					applications = JSON.stringify([...new Set(applications)]);

					return h
						.view("index", { applications, reports })
						.state("authorization", authorization, options);
				} catch (error) {
					console.error(error);
					throw error;
				}
			},
		},
		path: "/",
	});

	// Route: POST /
	server.route({
		method: POST,
		options: {
			handler: async request => {
				if (request.payload) {
					try {
						const { payload } = request;
						const { upload_file_minidump: dump } = payload;
						const body = { ...payload };

						delete body.upload_file_minidump;

						const report = await server.app.database.reports.save({
							body,
							dump,
						});

						return report.id;
					} catch (error) {
						console.error(error);
						throw error;
					}
				} else {
					return Boom.badRequest();
				}
			},
		},
		path: "/",
	});

	// Route: GET /reports/{id}
	server.route({
		method: GET,
		options: {
			auth,
			handler: async (request, h) => {
				try {
					const id = Number(request.params.id);
					const report = await server.app.database.reports.find(id);

					if (!report) {
						return h
							.response("not found")
							.type("text/plain")
							.code(NOT_FOUND);
					}

					delete report.dump;
					delete report.search;

					return h.view("report", { report: JSON.stringify(report) });
				} catch (error) {
					console.error(error);
					throw error;
				}
			},
		},
		path: "/reports/{id}",
	});

	// Route: PATCH /reports/{id}
	server.route({
		method: PATCH,
		options: {
			auth,
			handler: async request => {
				try {
					const id = Number(request.params.id);
					const doc = await server.app.database.reports.find(id);
					const closed = doc.open ? new Date() : null;

					doc.open = !doc.open;
					// eslint-disable-next-line camelcase
					doc.closed_at = closed;

					const report = await server.app.database.reports.save(doc);

					delete report.dump;
					delete report.search;

					return report;
				} catch (error) {
					console.error(error);
					throw error;
				}
			},
		},
		path: "/reports/{id}",
	});

	// Route: DELETE /reports/{id}
	server.route({
		method: DELETE,
		options: {
			auth,
			handler: async request => {
				try {
					const id = Number(request.params.id);
					// eslint-disable-next-line max-len
					const report = await server.app.database.reports.destroy(id);

					delete report.dump;
					delete report.search;

					return report;
				} catch (error) {
					console.error(error);
					throw error;
				}
			},
		},
		path: "/reports/{id}",
	});

	// Route: GET /reports/{id}/dump
	server.route({
		method: GET,
		options: {
			auth,
			handler: async (request, h) => {
				try {
					const id = Number(request.params.id);
					const report = await server.app.database.reports.find(id);
					// eslint-disable-next-line no-underscore-dangle
					const name = `${report.body._productName}-crash-${id}.dmp`;
					const attachment = `attachment; filename=${name}`;

					return h
						.response(report.dump)
						.header("content-disposition", attachment)
						.type("application/x-dmp");
				} catch (error) {
					console.error(error);
					throw error;
				}
			},
		},
		path: "/reports/{id}/dump",
	});

	// Route: GET /reports/{id}/stack
	server.route({
		method: GET,
		options: {
			auth,
			handler: async request => {
				try {
					const id = Number(request.params.id);
					const report = await server.app.database.reports.find(id);
					const path = resolve(tmpdir(), `${report.id}.dmp`);
					await writeFileAsync(path, report.dump, "binary");
					const stack = await walkStackAsync(path);
					await unlinkAsync(path);

					// eslint-disable-next-line camelcase
					return { stack_trace: stack.toString() };
				} catch (error) {
					console.error(error);
					throw error;
				}
			},
		},
		path: "/reports/{id}/stack",
	});

	// Route: GET /components/{path}
	server.route({
		method: GET,
		options: {
			handler: (request, h) => {
				const path = resolve("out", request.params.path);
				return h.file(path);
			},
		},
		path: "/components/{path}",
	});

	// Route: GET /{path}
	server.route({
		method: GET,
		options: {
			handler: (request, h) => {
				const path = resolve("assets", request.params.path);
				return h.file(path);
			},
		},
		path: "/{path}",
	});

	// Start server
	try {
		await server.start();
		console.log(`Server running at: ${server.info.uri}`);
	} catch (error) {
		console.error(error);
		throw error;
	}

	return server;
};

main();
