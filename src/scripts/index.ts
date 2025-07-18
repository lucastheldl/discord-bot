import { syncDatabase } from "../database/sync";
import { sequelize } from "../db-connection";

async function setupDatabase() {
  try {
    console.log("Setting up database...");

    // Test the connection
    await sequelize.authenticate();
    console.log("✓ Database connection established successfully");

    // Sync all tables (use force: true to recreate tables)
    await syncDatabase(true); // Set to false if you want to keep existing data

    console.log("Database setup completed!");
    process.exit(0);
  } catch (error) {
    console.error("Database setup failed:", error);
    process.exit(1);
  }
}

setupDatabase();
