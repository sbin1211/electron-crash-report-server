const { unlink, writeFile } = require("fs");
const { promisify } = require("util");
const { resolve } = require("path");
const { tmpdir } = require("os");
const { walkStack } = require("minidump");
const database = require("../database.js");

const unlinkAsync = promisify(unlink);
const walkStackAsync = promisify(walkStack);
const writeFileAsync = promisify(writeFile);
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
	{
		handler: async (request, h) => {
			try {
				const db = await database;
				const id = Number(request.params.id);
				const report = await db.reports.find(id);
				// eslint-disable-next-line no-underscore-dangle
				const name = `${report.body._productName}-crash-${id}.dmp`;
				const attachment = `attachment; filename=${name}`;

				return h
					.response(report.dump)
					.header("content-disposition", attachment)
					.type("application/x-dmp");
			} catch (error) {
				throw error;
			}
		},
		method: "GET",
		options: { auth: "simple" },
		path: "/r/{id}/dump",
	},
	{
		handler: async request => {
			try {
				const db = await database;
				const id = Number(request.params.id);
				const report = await db.reports.find(id);
				const path = resolve(tmpdir(), `${report.id}.dmp`);

				await writeFileAsync(path, report.dump, "binary");

				const stack = await walkStackAsync(path);

				await unlinkAsync(path);

				return { stack_trace: stack.toString() };
			} catch (error) {
				throw error;
			}
		},
		method: "GET",
		options: { auth: "simple" },
		path: "/r/{id}/stack",
	},
];
