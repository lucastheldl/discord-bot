import { Sequelize } from "sequelize";

interface DatabaseConfig {
  database: string;
  username: string;
  password: string | null;
  options: {
    host: string;
    dialect: "sqlite" | "mysql" | "postgres" | "mssql";
    logging: boolean | ((sql: string, timing?: number) => void);
    storage?: string;
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
    storage: "./db/database.sqlite",
  },
};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password ?? "",
  config.options
);

export { sequelize, Sequelize };
