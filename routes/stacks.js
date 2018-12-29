const { unlink, writeFile } = require("fs");
const { promisify } = require("util");
const { resolve } = require("path");
const { tmpdir } = require("os");
const { walkStack } = require("minidump");
const database = require("../database.js");

const unlinkAsync = promisify(unlink);
const walkStackAsync = promisify(walkStack);
const writeFileAsync = promisify(writeFile);

module.exports = [
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
		path: "/s/{id}",
	},
];
