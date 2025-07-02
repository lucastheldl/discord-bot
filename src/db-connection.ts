import { Sequelize } from "sequelize";

// Define interface for database configuration
interface DatabaseConfig {
  database: string;
  username: string;
  password: string | null;
  options: {
    host: string;
    dialect: "sqlite" | "mysql" | "postgres" | "mssql";
    logging: boolean | ((sql: string, timing?: number) => void);
    storage?: string; // SQLite specific
    // Add other dialect-specific options here as needed
  };
}

const config: DatabaseConfig = {
  database: "database",
  username: "user",
  password: "password",
  options: {
    host: "localhost",
    dialect: "sqlite",
    logging: false,
    // SQLite only
    storage: "./db/database.sqlite",
  },
};

// Create Sequelize instance with type checking
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password ?? "",
  config.options
);

export { sequelize, Sequelize };
