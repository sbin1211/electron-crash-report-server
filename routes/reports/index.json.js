// eslint-disable-next-line import/prefer-default-export
export async function get(req, res) {
  const select = "SELECT * FROM reports ORDER BY created_at DESC";
  let { limit, offset } = req.query;

  limit = Number(limit) || 50;
  offset = Number(offset) || 0;

  const sql = `${select} LIMIT ${limit} OFFSET ${offset}`;

  try {
    const reports = await req.app.get("db").query(sql);

    /* eslint-disable no-param-reassign */
    reports.forEach(report => {
      delete report.dump;
      delete report.search;
    });
    /* eslint-enable no-param-reassign */

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(reports, null, "\t"));
  } catch (error) {
    console.error(error);
    throw error;
  }
}
