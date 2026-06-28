import { testConnection } from "../config/db.js";

async function main() {
  try {
    const result = await testConnection();

    console.log("🟢 Database connected successfully.");
    console.log(
      "PostgreSQL server time:",
      result.server_time
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "🔴 Database connection failed:"
    );
    console.error(error);

    process.exit(1);
  }
}

main();