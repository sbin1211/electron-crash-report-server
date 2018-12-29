const database = require("../database.js");

module.exports = [
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
		path: "/d/{id}",
	},
];
