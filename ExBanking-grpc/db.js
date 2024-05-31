const sqlite3 = require("sqlite3");
const { v4: uuidv4 } = require("uuid");

const db = new sqlite3.Database(":memory:");

async function initializeDb() {
  await db.serialize(async () => {
    await db.run(
      "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, amount FLOAT, uuid TEXT)",
    );
    await db.run("INSERT INTO users (name, amount, uuid) VALUES (?, ?, ?)", [
      "John Doe",
      100,
      uuidv4(),
    ]);
    await db.run("INSERT INTO users (name, amount, uuid) VALUES (?, ?, ?)", [
      "Jane Smith",
      100,
      uuidv4(),
    ]);
  });
}

module.exports = { db, initializeDb };
