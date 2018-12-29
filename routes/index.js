const Boom = require("boom");
const database = require("../database.js");

module.exports = [
	{
		handler: async (request, h) => {
			try {
				const {
					env: { AUTH_USER, AUTH_PASS, NODE_ENV },
				} = process;
				const authorization = `${AUTH_USER}:${AUTH_PASS}`;
				const buffer = Buffer.from(authorization);
				const credentials = buffer.toString("base64");
				const db = await database;
				const isSecure = NODE_ENV === "production";
				const options = { isHttpOnly: false, isSecure };
				const sql = "SELECT body, created_at, id, open FROM";
				const query = `${sql} reports ORDER BY created_at DESC`;
				const reports = await db.query(query);
				const applications = reports
					// eslint-disable-next-line no-underscore-dangle
					.map(i => i.body._productName)
					.filter(x => x)
					.filter((x, i, a) => a.indexOf(x) === i)
					.sort();

				return h
					.view("index", { applications, reports })
					.state("authorization", credentials, options);
			} catch (error) {
				throw error;
			}
		},
		method: "GET",
		options: { auth: "simple" },
		path: "/",
	},
	{
		handler: async request => {
			if (request.payload) {
				try {
					const db = await database;
					const { payload } = request;
					const { upload_file_minidump: dump } = payload;
					const body = { ...payload };

					delete body.upload_file_minidump;

					const report = await db.reports.save({ body, dump });

					return report.id;
				} catch (error) {
					throw error;
				}
			} else {
				return Boom.badRequest();
			}
		},
		method: "POST",
		path: "/",
	},
];
