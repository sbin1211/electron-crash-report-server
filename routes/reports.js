const database = require("../database.js");

const NOT_FOUND = 404;

module.exports = [
	{
		handler: async (request, h) => {
			try {
				const db = await database;
				const id = Number(request.params.id);
				const report = await db.reports.find(id);

				if (!report) {
					return h
						.response("not found")
						.type("text/plain")
						.code(NOT_FOUND);
				}

				delete report.dump;
				delete report.search;

				return h.view("report", { report });
			} catch (error) {
				throw error;
			}
		},
		method: "GET",
		options: { auth: "simple" },
		path: "/r/{id}",
	},
	{
		handler: async request => {
			try {
				const db = await database;
				const id = Number(request.params.id);
				const document = await db.reports.find(id);
				const closed = document.open ? new Date() : null;

				document.open = !document.open;
				document.closed_at = closed;

				const report = await db.reports.save(document);

				delete report.dump;
				delete report.search;

				return report;
			} catch (error) {
				throw error;
			}
		},
		method: "PATCH",
		options: { auth: "simple" },
		path: "/r/{id}",
	},
	{
		handler: async request => {
			try {
				const db = await database;
				const id = Number(request.params.id);
				const report = await db.reports.destroy(id);

				delete report.dump;
				delete report.search;

				return report;
			} catch (error) {
				throw error;
			}
		},
		method: "DELETE",
		options: { auth: "simple" },
		path: "/r/{id}",
	},
];
