import Fastify from "fastify";
import sqlite3 from "sqlite3";
import { routes } from "./routes/routes.js";
import { v4 as uuidv4 } from "uuid";

export const db = new sqlite3.Database(":memory:");

const fastify = Fastify({
  logger: true,
});

const start = async () => {
  try {
    await fastify.register(routes);
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
    await fastify.listen({ port: 3000 });
  } catch (err) {
    await db.close();
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
