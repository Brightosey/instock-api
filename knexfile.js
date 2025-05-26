import "dotenv/config";

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: 5432,
    ssl: { rejectUnauthorized: false },
  },
};
