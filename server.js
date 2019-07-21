require("dotenv").config();
const { unlink, writeFile } = require("fs");
const basic = require("@hapi/basic");
const boom = require("@hapi/boom");
const brok = require("brok");
const FormData = require("form-data");
const gh = require("gh-got");
const got = require("got");
const handlebars = require("handlebars");
const hapi = require("@hapi/hapi");
const inert = require("@hapi/inert");
const joi = require("@hapi/joi");
const massive = require("massive");
const nodemailer = require("nodemailer");
const pgMonitor = require("pg-monitor");
const pino = require("hapi-pino");
const prettyMs = require("pretty-ms");
const { promisify } = require("util");
const { resolve } = require("path");
const { tmpdir } = require("os");
const vision = require("@hapi/vision");
const { walkStack } = require("./node-minidump/lib/minidump");
const migrate = require("./migrate.js");

const DELETE = "DELETE";
const GET = "GET";
const PATCH = "PATCH";
const POST = "POST";
const MINIDUMP_MIN = 2;
const SEMVER_REGEX = /(?<=^v?|\sv?)(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*)(?:\.(?:[1-9]\d*|[\da-z-]*[a-z-][\da-z-]*))*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?(?=$|\s)/i; /* eslint-disable-line max-len */

const unlinkAsync = promisify(unlink);
const walkStackAsync = promisify(walkStack);
const writeFileAsync = promisify(writeFile);

const openedDuration = report => {
	const closed_at = report.closed_at || new Date();
	return prettyMs(closed_at - report.created_at, { compact: true });
};

const validate = async (request, username, password) => {
	if (!username || !password) return boom.unauthorized();
	if (username !== process.env.AUTH_USER) return boom.unauthorized();
	if (password !== process.env.AUTH_PASS) return boom.unauthorized();

	return { credentials: { password, username }, isValid: true };
};

const start = async () => {
	const production = process.env.NODE_ENV === "production";
	const test = process.env.NODE_ENV === "test";

	const {
		env: { DATABASE_URL: database_url },
	} = process;
	const server = hapi.server({
		address: process.env.ADDRESS || "0.0.0.0",
		compression: { minBytes: 1 },
		host: process.env.HOST || "localhost",
		port: process.env.PORT,
		router: { stripTrailingSlash: true },
	});

	try {
		const database = await massive(database_url);

		await database.query(migrate);
		await server.register([basic, brok, inert, vision]);

		if (!production && !test) {
			await server.register(pino);
			pgMonitor.attach(database.driverConfig);
		}

		server.app.database = database;

		server.auth.strategy("simple", "basic", { validate });
		server.auth.default("simple");

		server.views({
			engines: { handlebars },
			layout: true,
			path: "templates",
		});

		// route: GET /
		server.route({
			handler: async (request, h) => {
				try {
					const { query } = request;

					let closed_active;
					let closed_count;
					let opened_active;
					let opened_count;
					let reports;

					if (
						query.closed === "true" ||
						query.closed === "" ||
						query.open === "false"
					) {
						reports = await database.query(
							/* eslint-disable-next-line max-len */
							`SELECT id, body, closed_at FROM reports WHERE closed_at is NOT NULL ORDER BY closed_at DESC`
						);

						[{ count: opened_count }] = await database.query(
							`select count(1) from reports where closed_at is null`
						);

						reports.forEach((x, i) => {
							let duration = prettyMs(Date.now() - x.closed_at, {
								compact: true,
							});
							duration = duration.replace(/~/, "");
							reports[i].closed_at = `closed ${duration} ago`;
						});

						closed_active = true;
						({ length: closed_count } = reports);
					} else {
						reports = await database.query(
							/* eslint-disable-next-line max-len */
							`SELECT id, body, created_at FROM reports WHERE closed_at is NULL ORDER BY created_at DESC`
						);

						[{ count: closed_count }] = await database.query(
							`select count(1) from reports where closed_at is not null`
						);

						reports.forEach((x, i) => {
							let duration = openedDuration(x);
							duration = duration.replace(/~/, "");
							reports[i].created_at = `opened ${duration} ago`;
						});

						opened_active = true;
						({ length: opened_count } = reports);
					}

					return h.view("index", {
						closed_active,
						closed_count,
						opened_active,
						opened_count,
						reports,
					});
				} catch (error) {
					throw error;
				}
			},
			method: GET,
			path: "/",
		});

		// route: POST /
		server.route({
			handler: async request => {
				if (request.payload) {
					const report = {
						body: Object.assign({}, request.payload, { ip: request.info.remoteAddress }),
						dump: request.payload.upload_file_minidump,
					};

					delete report.body.upload_file_minidump;

					// Generate and store stack trace from dump file.
					try {
						const path = resolve(tmpdir(), `${Date.now()}.dmp`);

						await writeFileAsync(path, report.dump, "binary");

						const { platform } = report.body;
						let symbolPath = resolve(__dirname, 'symbols', 'win32');
						if (platform === 'darwin') {
							symbolPath = resolve(__dirname, 'symbols', 'darwin');
						}

						report.stack = await walkStackAsync(path, [symbolPath]);
						report.stack = report.stack.toString();

						await unlinkAsync(path);
					} catch (error) {
						console.error(error); /* eslint-disable-line no-console */
						throw error;
					}

					try {
						const document = await database.reports.save(report);

						if (process.env.GITHUB_TOKEN || process.env.GITLAB_TOKEN) {
							const title = `ecrs: Crash report ${document.id}`;
							const body = `[Download dump file](${process.env.ECRS_URL}/r/${
								document.id
								}/dump)\n\n~~~json\n${JSON.stringify(
									document.body,
									null,
									"\t"
								)}\n~~~\n\n~~~\n${
								document.stack
								}\n~~~`; /* eslint-disable-line max-len */
							const labels = [];

							/* eslint-disable no-underscore-dangle */
							if (document.body._productName) {
								labels.push(document.body._productName);
							}
							if (document.body._version) {
								labels.push(document.body._version);
							}
							if (document.body.process_type) {
								labels.push(document.body.process_type);
							}
							if (document.body.platform) {
								labels.push(document.body.platform);
							}
							/* eslint-enable no-underscore-dangle */

							if (process.env.GITHUB_TOKEN) {
								await gh.post(
									`/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/issues` /* eslint-disable-line max-len */,
									{ body: { body, labels, title } }
								);
							}

							if (process.env.GITLAB_TOKEN) {
								const base_url =
									process.env.GITLAB_URL || "https://gitlab.com/api/v4";
								const form_data = new FormData();

								form_data.append("title", title);
								form_data.append("description", body);
								form_data.append("labels", labels.join(","));

								await got.post(
									`${base_url}/projects/${process.env.GITLAB_ID}/issues`,
									{
										body: form_data,
										headers: {
											"Private-Token": process.env.GITLAB_TOKEN,
										},
									}
								);
							}
						}

						if (process.env.SMTP_SERVER) {
							const labels = process.env.SMTP_LABELS.split(",")
								.map(x => document.body[x])
								.join(", ");
							/* eslint-disable no-eval, no-underscore-dangle */
							const {
								body: { _productName: product_name },
							} = document;
							const subject = eval(process.env.SMTP_SUBJECT);
							/* eslint-enable no-eval, no-underscore-dangle */
							const transporter = nodemailer.createTransport({
								auth: {
									pass: process.env.SMTP_PASSWORD,
									user: process.env.SMTP_LOGIN,
								},
								host: process.env.SMTP_SERVER,
								port: process.env.SMTP_PORT,
							});

							await transporter.sendMail({
								from: process.env.SMTP_FROM,
								subject:
									`${subject}${labels}` || `ecrs: Crash report ${document.id}`,
								text: `${JSON.stringify(document.body, null, "\t")}\n\n---\n\n${
									document.stack
									}\n`,
								to: process.env.SMTP_TO,
							});
						}

						return document.id;
					} catch (error) {
						console.error(error); /* eslint-disable-line no-console */
						throw error;
					}
				} else {
					return boom.badRequest();
				}
			},
			method: POST,
			options: {
				auth: false,
				validate: {
					/* eslint-disable sort-keys, unicorn/prevent-abbreviations */
					payload: joi
						.object({
							_companyName: joi.string(),
							_productName: joi.string(),
							_version: joi
								.string()
								.regex(SEMVER_REGEX, { name: "semantic versioning" }),
							guid: joi.string().guid(),
							platform: joi.string().regex(/^darwin|linux|win32$/),
							process_type: joi.string().regex(/^browser|renderer$/),
							prod: joi.string().regex(/^Electron$/),
							upload_file_minidump: joi
								.binary()
								.min(MINIDUMP_MIN)
								.required(),
							ver: joi
								.string()
								.regex(SEMVER_REGEX, { name: "semantic versioning" }),
							// Other attributes observed in the wild.
							extra1: joi.string(),
							extra2: joi.string(),
							list_annotations: joi.string(),
							"lsb-release": joi.string(),
							pid: joi.string(),
							ptime: joi.string(),
							rept: joi.string(),
						})
						.unknown(),
					/* eslint-enable sort-keys, unicorn/prevent-abbreviations */
				},
			},
			path: "/",
		});

		// route: GET /r/{id}
		server.route({
			handler: async (request, h) => {
				try {
					const id = Number(request.params.id);
					const fields = ["id", "body", "closed_at", "created_at"];
					const report = await database.reports.find(id, { fields });
					const [{ count: opened_count }] = await database.query(
						`select count(1) from reports where closed_at is null`
					);
					const [{ count: closed_count }] = await database.query(
						`select count(1) from reports where closed_at is not null`
					);

					let closed_active;
					let opened_active;

					report.opened_duration = openedDuration(report);
					report.body = JSON.stringify(report.body, null, "\t");
					report.created_at = report.created_at.toLocaleString();

					if (report.closed_at) {
						closed_active = true;
						report.closed_at = report.closed_at.toLocaleString();
					} else {
						opened_active = true;
					}

					return h.view("show", {
						closed_active,
						closed_count,
						opened_active,
						opened_count,
						report,
					});
				} catch (error) {
					throw error;
				}
			},
			method: GET,
			path: "/r/{id}",
		});

		// route: PATCH /r/{id}
		server.route({
			handler: async request => {
				try {
					const id = Number(request.params.id);
					const fields = ["id", "closed_at", "created_at"];
					const report = await database.reports.find(id, { fields });

					let closed_active;
					let opened_active;

					report.closed_at = report.closed_at ? null : new Date();

					await database.reports.save(report);

					const [{ count: opened_count }] = await database.query(
						`select count(1) from reports where closed_at is null`
					);
					const [{ count: closed_count }] = await database.query(
						`select count(1) from reports where closed_at is not null`
					);

					report.opened_duration = openedDuration(report);
					report.created_at = report.created_at.toLocaleString();

					if (report.closed_at) {
						closed_active = true;
						report.closed_at = report.closed_at.toLocaleString();
					} else {
						opened_active = true;
						report.closed_at = "—";
					}

					return {
						closed_active,
						closed_count,
						opened_active,
						opened_count,
						report,
					};
				} catch (error) {
					throw error;
				}
			},
			method: PATCH,
			path: "/r/{id}",
		});

		// route: DELETE /r/{id}
		server.route({
			handler: async request => {
				try {
					const id = Number(request.params.id);
					const response = await database.reports.destroy(id);

					return { id: response.id };
				} catch (error) {
					throw new Error(error);
				}
			},
			method: DELETE,
			path: "/r/{id}",
		});

		// route: GET /r/{id}/dump
		server.route({
			handler: async (request, h) => {
				try {
					const id = Number(request.params.id);
					const report = await database.reports.find(id);
					/* eslint-disable-next-line no-underscore-dangle */
					const name = `${report.body._productName}-crash-${id}.dmp`;

					return h
						.response(report.dump)
						.header("content-disposition", `attachment; filename=${name}`)
						.type("application/x-dmp");
				} catch (error) {
					throw error;
				}
			},
			method: GET,
			path: "/r/{id}/dump",
		});

		// route: GET /r/{id}/stack
		server.route({
			handler: async (request, h) => {
				try {
					const id = Number(request.params.id);
					const report = await database.reports.find(id, { fields: ["stack"] });

					// Reports from pre-2.x do not have a stored stack trace.
					// Generate and store stack trace on first view.
					if (!report.stack) {
						const document = await database.reports.find(id);
						const path = resolve(tmpdir(), `${document.id}.dmp`);

						await writeFileAsync(path, document.dump, "binary");

						const stack = await walkStackAsync(path);

						document.stack = stack.toString();
						report.stack = stack.toString();

						await unlinkAsync(path);
						await database.reports.save(document);
					}

					return h.response(report.stack).type("text/plain");
				} catch (error) {
					throw error;
				}
			},
			method: GET,
			path: "/r/{id}/stack",
		});

		// route: GET /search
		server.route({
			handler: async (request, h) => {
				const {
					query: { app, version, process_type, platform },
				} = request;
				const [{ count: opened_count }] = await database.query(
					`select count(1) from reports where closed_at is null`
				);
				const [{ count: closed_count }] = await database.query(
					`select count(1) from reports where closed_at is not null`
				);

				let reports = [];
				let select = `select id, body, created_at, closed_at from reports where`;
				let where = ``;

				if (app) {
					if (where) where = `${where} and`;
					where = `${where} body @> '{"app": "${app}"}'`;
				}

				if (version) {
					if (where) where = `${where} and`;
					where = `${where} body @> '{"ver": "${version}"}'`;
				}

				if (process_type) {
					if (where) where = `${where} and`;
					where = `${where} body @> '{"process_type": "${process_type}"}'`;
				}

				if (platform) {
					if (where) where = `${where} and`;
					where = `${where} body @> '{"platform": "${platform}"}'`;
				}

				if (!where) return [];

				select = `${select} ${where} order by created_at desc`;
				reports = await database.query(select);

				reports.forEach((x, i) => {
					let duration = openedDuration(x);
					duration = duration.replace(/~/, "");
					reports[i].created_at = `opened ${duration} ago`;
				});

				reports.forEach((x, i) => {
					if (x.closed_at) {
						let duration = prettyMs(Date.now() - x.closed_at, {
							compact: true,
						});
						duration = duration.replace(/~/, "");
						reports[i].closed_at = `closed ${duration} ago`;
					}
				});

				return h.view("search", { closed_count, opened_count, reports });
			},
			method: GET,
			path: "/search",
		});

		// Serve static assets
		server.route({
			handler: (request, h) => h.file(`assets/${request.params.filename}`),
			method: GET,
			path: "/assets/{filename}",
		});

		await server.start();

		return server;
	} catch (error) {
		console.error(error); /* eslint-disable-line no-console */
		throw error;
	}
};

process.on("unhandledRejection", error => {
	console.error(error); /* eslint-disable-line no-console */
	process.exit(1);
});

exports.start = start;
