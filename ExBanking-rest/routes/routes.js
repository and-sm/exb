import {
  createUser,
  depositAmount,
  getAllUsers,
  getUserBalance,
  getUserByName,
  sendFunds,
  withdrawAmount,
} from "../db/db.js";

const ERRORS = {
  "Insufficient funds": 400,
  "Amount must be positive": 400,
  "Bad request": 400,
  "User already exists": 400,
  "Not a number": 400,
  "User not found": 404,
  "Internal Server Error": 500,
};

function errorHandler(
  err,
  reply,
  errors,
  defaultError = { error: "Unknown Error" },
  defaultCode = 500,
) {
  if (!Object.hasOwn(errors, err.message))
    return reply.code(defaultCode).send(defaultError);
  return reply.code(errors[err.message]).send({ error: err.message });
}

export async function routes(fastify, options) {
  fastify.get("/users", async (request, reply) => {
    try {
      const res = await getAllUsers();
      return reply.send(res);
    } catch (err) {
      errorHandler(err, reply, ERRORS);
    }
  });

  fastify.post("/create_user", async (request, reply) => {
    const { name } = request.body;
    try {
      if (!name) {
        return errorHandler(new Error("Bad request"), reply, ERRORS);
      }
      const existingUser = await getUserByName(name);
      if (existingUser) {
        return errorHandler(new Error("User already exists"), reply, ERRORS);
      }
      const user = await createUser(name);
      return reply.send(user);
    } catch (err) {
      return errorHandler(err, reply, ERRORS);
    }
  });

  fastify.post("/deposit", async (request, reply) => {
    const { uuid, amount } = request.body;
    try {
      if (!uuid || !amount) {
        return errorHandler(new Error("Bad request"), reply, ERRORS);
      }
      const result = await depositAmount(uuid, amount);
      return reply.send(result);
    } catch (err) {
      return errorHandler(err, reply, ERRORS);
    }
  });

  fastify.post("/withdraw", async (request, reply) => {
    const { uuid, amount } = request.body;
    try {
      if (!uuid || !amount) {
        return errorHandler(new Error("Bad request"), reply, ERRORS);
      }
      const result = await withdrawAmount(uuid, amount);
      return reply.send(result);
    } catch (err) {
      errorHandler(err, reply, ERRORS);
    }
  });

  fastify.get("/get_balance", async (request, reply) => {
    const { uuid } = request.query;
    try {
      if (!uuid) {
        return errorHandler(new Error("Bad request"), reply, ERRORS);
      }
      const balance = await getUserBalance(uuid);
      return reply.send(balance);
    } catch (err) {
      errorHandler(err, reply, ERRORS);
    }
  });

  fastify.post("/send", async (request, reply) => {
    const { fromId, toId, amount } = request.body;
    try {
      if (!fromId || !toId || !amount) {
        return errorHandler(new Error("Bad request"), reply, ERRORS);
      }
      // for simplicity: if sender or receiver weren't found -> the same error will be raised
      await getUserBalance(fromId);
      await getUserBalance(toId);
      await sendFunds(fromId, toId, amount);
      return reply.send({ status: "ok" });
    } catch (err) {
      errorHandler(err, reply, ERRORS);
    }
  });
}
