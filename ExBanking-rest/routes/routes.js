import {
  createUser,
  depositAmount,
  getAllUsers,
  getUserBalance,
  getUserByName,
  sendFunds,
  withdrawAmount,
} from "../db/db.js";

const errorHandler = (err, reply) => {
  if (err.message === "Insufficient funds") {
    return reply.code(400).send({ error: "Insufficient funds" });
  }
  if (err.message === "Amount must be positive") {
    return reply.code(400).send({ error: "Amount must be positive" });
  }
  if (err.message === "Bad request") {
    return reply.code(400).send({ error: "Bad request" });
  }
  if (err.message === "User already exists") {
    return reply.code(400).send({ error: "User already exists" });
  }
  if (err.message === "Not a number") {
    return reply.code(400).send({ error: "Not a number" });
  }
  if (err.message === "User not found") {
    return reply.code(404).send({ error: "User not found" });
  }
  return reply.code(500).send({ error: "Internal Server Error" });
};

export async function routes(fastify, options) {
  fastify.get("/users", async (request, reply) => {
    try {
      const res = await getAllUsers();
      return reply.send(res);
    } catch (err) {
      errorHandler(err, reply);
    }
  });

  fastify.post("/create_user", async (request, reply) => {
    const { name } = request.body;
    try {
      if (!name) {
        return errorHandler(new Error("Bad request"), reply);
      }
      const existingUser = await getUserByName(name);
      if (existingUser) {
        return errorHandler(new Error("User already exists"), reply);
      }
      const user = await createUser(name);
      return reply.send(user);
    } catch (err) {
      return errorHandler(err, reply);
    }
  });

  fastify.post("/deposit", async (request, reply) => {
    const { uuid, amount } = request.body;
    try {
      if (!uuid || !amount) {
        return errorHandler(new Error("Bad request"), reply);
      }
      const result = await depositAmount(uuid, amount);
      return reply.send(result);
    } catch (err) {
      return errorHandler(err, reply);
    }
  });

  fastify.post("/withdraw", async (request, reply) => {
    const { uuid, amount } = request.body;
    try {
      if (!uuid || !amount) {
        return errorHandler(new Error("Bad request"), reply);
      }
      const result = await withdrawAmount(uuid, amount);
      return reply.send(result);
    } catch (err) {
      errorHandler(err, reply);
    }
  });

  fastify.get("/get_balance", async (request, reply) => {
    const { uuid } = request.query;
    try {
      if (!uuid) {
        return errorHandler(new Error("Bad request"), reply);
      }
      const balance = await getUserBalance(uuid);
      return reply.send(balance);
    } catch (err) {
      errorHandler(err, reply);
    }
  });

  fastify.post("/send", async (request, reply) => {
    const { fromId, toId, amount } = request.body;
    try {
      if (!fromId || !toId || !amount) {
        return errorHandler(new Error("Bad request"), reply);
      }
      // for simplicity: if sender or receiver weren't found -> the same error will be raised
      await getUserBalance(fromId);
      await getUserBalance(toId);
      await sendFunds(fromId, toId, amount);
      return reply.send({ status: "ok" });
    } catch (err) {
      errorHandler(err, reply);
    }
  });
}
