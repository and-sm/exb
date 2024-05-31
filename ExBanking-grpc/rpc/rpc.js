const grpc = require("@grpc/grpc-js");
const { getUserByName, createUser: createUserSql } = require("../sql/sql.js");
const {
  depositAmount,
  getUserBalance,
  withdrawAmount,
  sendFunds,
} = require("../sql/sql");

async function createUser(call, callback) {
  const name = call.request.name;
  try {
    if (!name) {
      return callback(null, {
        status: grpc.status.INTERNAL,
        message: "Bad request",
      });
    }
    const existingUser = await getUserByName(name);
    if (existingUser) {
      return callback(null, {
        status: grpc.status.ALREADY_EXISTS,
        message: "User already exists",
      });
    }
    const user = await createUserSql(name);
    return callback(null, { name: user.name, uuid: user.uuid });
  } catch (err) {
    return callback({
      status: grpc.status.INTERNAL,
      message: "Internal Server Error",
    });
  }
}

async function deposit(call, callback) {
  const uuid = call.request.uuid;
  const amount = call.request.amount;

  try {
    if (!uuid || !amount) {
      return callback(null, {
        status: grpc.status.INTERNAL,
        message: "Bad request",
      });
    }
    await depositAmount(uuid, amount);
    return callback(null, { status: grpc.status.OK });
  } catch (err) {
    return callback({
      status: grpc.status.INTERNAL,
      message: "Internal Server Error",
    });
  }
}

async function withdraw(call, callback) {
  const uuid = call.request.uuid;
  const amount = call.request.amount;

  try {
    if (!uuid || !amount) {
      return callback(null, {
        status: grpc.status.INTERNAL,
        message: "Bad request",
      });
    }
    await withdrawAmount(uuid, amount);
    return callback(null, { status: grpc.status.OK });
  } catch (err) {
    return callback({
      status: grpc.status.INTERNAL,
      message: "Internal Server Error",
    });
  }
}

async function balance(call, callback) {
  const uuid = call.request.uuid;

  try {
    if (!uuid) {
      return callback(null, {
        status: grpc.status.INTERNAL,
        message: "Bad request",
      });
    }
    const result = await getUserBalance(uuid);
    return callback(null, { uuid: result.uuid, amount: result.amount });
  } catch (err) {
    return callback({
      status: grpc.status.INTERNAL,
      message: "Internal Server Error",
    });
  }
}

async function send(call, callback) {
  const fromId = call.request.fromId;
  const toId = call.request.toId;
  const amount = call.request.amount;

  try {
    if (!fromId || !toId || !amount) {
      return callback(null, {
        status: grpc.status.INTERNAL,
        message: "Bad request",
      });
    }
    await getUserBalance(fromId);
    await getUserBalance(toId);
    await sendFunds(fromId, toId, amount);
    return callback(null, { status: grpc.status.OK });
  } catch (err) {
    return callback({
      status: grpc.status.INTERNAL,
      message: "Internal Server Error",
    });
  }
}

exports.createUser = createUser;
exports.deposit = deposit;
exports.withdraw = withdraw;
exports.balance = balance;
exports.send = send;
