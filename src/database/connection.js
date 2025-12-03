import mysql from "mysql2/promise";
import { config } from "dotenv";
config();

export async function initializeDB() {
  try {
    // Step 1: Connect without selecting a database
    const serverConnection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });

    // Step 2: Create DB if it doesn't exist
    await serverConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
    );
    await serverConnection.end();

    // Step 3: Connect to the actual DB
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    console.log("Connected to DB:", process.env.DB_NAME);
    return db;
  } catch (err) {
    console.error("DB Connection Failed:", err.message);
    throw err;
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
});

async function query(config) {
  const conn = await pool.getConnection();
  let rows = [];

  try {
    let sql = "";
    let values = [];

    switch (config.action) {
      case "count": {
        sql = `SELECT COUNT(*) as count FROM \`${config.table}\``;
        if (config.where && typeof config.where === "object") {
          const conditions = Object.entries(config.where).map(([key, val]) => {
            values.push(val);
            return `${key} = ?`;
          });
          sql += ` WHERE ${conditions.join(" AND ")}`;
          if (config.other) {
            sql += ` ${config.other}`;
          }
        }
        [rows] = await conn.execute(sql, values);
        break;
      }
      case "read":
        sql = `SELECT ${config.get || "*"} FROM ${config.table}`;
        if (config.where && typeof config.where === "object") {
          const conditions = Object.entries(config.where).map(([key, val]) => {
            if (val === "__RAW__") {
              return key;
            }
            values.push(val);
            return `${key} = ?`;
          });
          sql += ` WHERE ${conditions.join(" AND ")}`;
          sql += ` ${config.other ? config.other : ""}`;
        }
        [rows] = await conn.execute(sql, values);
        break;

      case "create":
        const columns = Object.keys(config.data).join(", ");
        const placeholders = Object.keys(config.data)
          .map(() => "?")
          .join(", ");
        values = Object.values(config.data);
        sql = `INSERT INTO ${config.table} (${columns}) VALUES (${placeholders})`;
        [rows] = await conn.execute(sql, values);
        break;

      case "update":
        const updates = Object.entries(config.data).map(([key, val]) => {
          if (val === "__RAW__") {
            return key;
          }
          values.push(val);
          return `${key} = ?`;
        });
        sql = `UPDATE ${config.table} SET ${updates.join(", ")}`;

        if (config.where && typeof config.where === "object") {
          const conditions = Object.entries(config.where).map(([key, val]) => {
            if (val === "__RAW__") {
              return key;
            }
            values.push(val);
            return `${key} = ?`;
          });
          sql += ` WHERE ${conditions.join(" AND ")}`;
        }
        [rows] = await conn.execute(sql, values);
        break;

      case "destroy":
        sql = `DELETE FROM ${config.table}`;
        if (config.where && typeof config.where === "object") {
          const conditions = Object.entries(config.where).map(([key, val]) => {
            if (val === "__RAW__") {
              return key;
            }
            values.push(val);
            return `${key} = ?`;
          });
          sql += ` WHERE ${conditions.join(" AND ")}`;
        } else {
          throw new Error(
            "DELETE requires a 'where' condition to avoid full deletion"
          );
        }
        [rows] = await conn.execute(sql, values);
        break;

      default:
        throw new Error(`Unknown action: ${config.action}`);
    }

    return rows;
  } catch (err) {
    console.error("Query Error:", err.message);
    throw err;
  } finally {
    await conn.release();
  }
}

async function createTable(tableName, columns) {
  let conn;
  try {
    conn = await initializeDB();

    if (
      !tableName ||
      typeof columns !== "object" ||
      Object.keys(columns).length === 0
    ) {
      throw new Error("Invalid table name or columns definition.");
    }

    const columnDefs = Object.entries(columns)
      .map(([col, type]) => `${col} ${type}`)
      .join(", ");
    const sql = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (${columnDefs})`;

    await conn.execute(sql);
    console.log(`Table '${tableName}' created.`);
  } catch (err) {
    console.error(`Failed to create table '${tableName}':`, err.message);
    throw err;
  } finally {
    if (conn) await conn.end();
  }
}

async function dropTable(tableName) {
  let conn;
  try {
    conn = await initializeDB();

    if (!tableName) {
      throw new Error("Table name is required.");
    }

    const sql = `DROP TABLE IF EXISTS ${tableName}`;
    await conn.execute(sql);
    console.log(`Table '${tableName}' dropped.`);
  } catch (err) {
    console.error(`Failed to drop table '${tableName}':`, err.message);
    throw err;
  } finally {
    if (conn) await conn.end();
  }
}

async function updateTable(table) {
  let conn;
  try {
    conn = await initializeDB();

    if (!table || !table.name || !table.columns) {
      throw new Error("Valid table structure is required.");
    }

    const tableName = table.name;

    // Check if table exists
    const [tables] = await conn.execute(
      `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
      [tableName]
    );

    const exists = tables[0].count > 0;

    if (!exists) {
      // Create table
      const columnDefs = Object.entries(table.columns)
        .map(([col, type]) => `\`${col}\` ${type}`)
        .join(", ");

      const createSQL = `CREATE TABLE \`${tableName}\` (${columnDefs})`;
      await conn.execute(createSQL);
      console.log(`Created table '${tableName}'`);
      return;
    }

    // Table exists, get existing columns
    const [existingColumnsRows] = await conn.execute(
      `SHOW COLUMNS FROM \`${tableName}\``
    );
    const existingColumns = existingColumnsRows.map((row) => row.Field);

    // Get primary key columns
    const [primaryKeyRows] = await conn.execute(
      `SHOW INDEX FROM \`${tableName}\` WHERE Key_name = 'PRIMARY'`
    );
    const primaryKeyColumns = primaryKeyRows.map((row) => row.Column_name);

    // For each column to update/add
    for (const [column, type] of Object.entries(table.columns)) {
      // Remove PRIMARY KEY from type string if modifying existing primary key
      let columnType = type;

      if (existingColumns.includes(column)) {
        if (primaryKeyColumns.includes(column)) {
          // Remove only the exact "PRIMARY KEY" substring, keep spaces between other parts
          columnType = type.replace(/\bPRIMARY KEY\b/i, "").trim();
        }
        // Modify column
        const sql = `ALTER TABLE \`${tableName}\` MODIFY COLUMN \`${column}\` ${columnType.trim()}`;
        await conn.execute(sql);
        console.log(`Modified column '${column}' in '${tableName}'`);
      } else {
        // Add column as is
        const sql = `ALTER TABLE \`${tableName}\` ADD COLUMN \`${column}\` ${type}`;
        await conn.execute(sql);
        console.log(`Added column '${column}' to '${tableName}'`);
      }
    }
  } catch (err) {
    console.error(`Failed to update table '${table?.name}':`, err.message);
    throw err;
  } finally {
    if (conn) await conn.end();
  }
}

const TIMESTAMP = {
  created_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
  updated_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
};

export { query, createTable, dropTable, updateTable, TIMESTAMP };