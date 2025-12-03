import { createTable, dropTable, updateTable } from "../connection.js";


const tables = [];

async function migrate() {
  for (const table of tables) {
    const response = await createTable(table.name, table.columns);
    if (response) {
      console.log(response);
    }
  }
  console.log("🟢 Finished creating tables.");
  return 1;
}

async function migrateClear() {
  for (const table of tables) {
    await dropTable(table.name);
  }
  console.log("🟢 Finished clearing tables.");
  return 1;
}

async function migrateUpdate() {
  for (const table of tables) {
    await updateTable(table);
  }
  console.log("🟢 Finished updating tables.");
  return 1;
}

export { migrate, migrateClear, migrateUpdate };