const mysql = require("mysql2");

const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL;

function missingDatabaseConfig() {
  const err = new Error(
    "Database is not configured. Set DATABASE_URL or DB_HOST, DB_USER, DB_PASSWORD and DB_NAME in Vercel."
  );
  err.code = "DB_CONFIG_MISSING";
  err.status = 503;
  return err;
}

function createUnavailableDatabase() {
  const runCallback = (callback) => {
    const err = missingDatabaseConfig();

    if (typeof callback === "function") {
      process.nextTick(() => callback(err));
      return undefined;
    }

    return Promise.reject(err);
  };

  return {
    query: (...args) => runCallback(args[args.length - 1]),
    execute: (...args) => runCallback(args[args.length - 1]),
    getConnection: (callback) => runCallback(callback),
    end: (callback) => {
      if (typeof callback === "function") process.nextTick(callback);
    }
  };
}

function getConnectionOptions() {
  const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT || 5);
  const useSsl = ["1", "true", "yes"].includes(String(process.env.DB_SSL || "").toLowerCase());

  if (process.env.DATABASE_URL) {
    const databaseUrl = new URL(process.env.DATABASE_URL);

    return {
      host: databaseUrl.hostname,
      port: Number(databaseUrl.port || 3306),
      user: decodeURIComponent(databaseUrl.username),
      password: decodeURIComponent(databaseUrl.password),
      database: databaseUrl.pathname.replace(/^\//, ""),
      waitForConnections: true,
      connectionLimit,
      queueLimit: 0,
      ssl: useSsl ? { rejectUnauthorized: true } : undefined
    };
  }

  if (isProduction && (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME)) {
    return null;
  }

  return {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "band_gigs",
    waitForConnections: true,
    connectionLimit,
    queueLimit: 0,
    ssl: useSsl ? { rejectUnauthorized: true } : undefined
  };
}

const connectionOptions = getConnectionOptions();

if (!connectionOptions) {
  console.error(missingDatabaseConfig().message);
  module.exports = createUnavailableDatabase();
} else {
  const pool = mysql.createPool(connectionOptions);

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("MySQL connection failed:", err.message);
      return;
    }

    connection.release();
    console.log("Connected to MySQL");
  });

  module.exports = pool;
}
