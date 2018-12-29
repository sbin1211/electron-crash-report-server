import massive from "massive";

module.exports = massive(process.env.DATABASE_URL);
