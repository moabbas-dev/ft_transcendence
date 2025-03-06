/**
 * in Fastify we work with the Plugins style
 * to enable us to recall the plugin anywhere in the app.
 */

require("dotenv").config();

const path = require("path");

const fastify = require("fastify")({
  logger: true,
});

/**
 * Configure CORS - which is one of best Paractice for using Sockets
 */
fastify.register(require("@fastify/cors"), {
  origin: [process.env.APP_URL],
  methods: "*",
  allowedHeaders: ["Content-Type", "Authorization"],
});

/**
 * Setup SQLite3 instead of Redis
 */
const sqlite3 = require('sqlite3').verbose();
// Open (or create) a SQLite database file
const db = new sqlite3.Database('./data/chatcd.sqlite', (err) => {
  if (err) {
    fastify.log.error("Error opening SQLite database:", err.message);
  } else {
    fastify.log.info("Connected to SQLite database.");
    // Optionally, create a sample table if it doesn't exist
    db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL
      )
    `, (err) => {
      if (err) {
        fastify.log.error("Error creating table:", err.message);
      } else {
        fastify.log.info("Table 'messages' is ready.");
      }
    });
  }
});
// Decorate the fastify instance with the SQLite database connection
fastify.decorate('sqlite', db);

/**
 * Autoload Plugins
 */
fastify.register(require("@fastify/autoload"), {
  dir: path.join(__dirname, "plugins"),
});

/**
 * Run the server!
 */
const start = async () => {
	try {
	  await fastify.listen({ port: process.env.PORT, host: process.env.HOST });
	  fastify.log.info(`Server started on http://${process.env.HOST}:${process.env.PORT}`);
	} catch (err) {
	  fastify.log.error(err);
	  process.exit(1);
	}
};
  
start();