require("dotenv").config();
const {
  uniqueNamesGenerator,
  names,
  starWars,
} = require("unique-names-generator");
const { user_proto } = require("../client");
const grpc = require("@grpc/grpc-js");
const { runGrpcCall } = require("./utils");

const client = new user_proto.UserService(
  process.env.GRPC_HOST,
  grpc.credentials.createInsecure(),
);

let user1, user2;

beforeEach(async () => {
  const randomName1 = uniqueNamesGenerator({ dictionaries: [names, starWars] });
  user1 = await runGrpcCall(client.CreateUser.bind(client), {
    name: randomName1,
  });
  await runGrpcCall(client.DepositUser.bind(client), {
    uuid: user1.uuid,
    amount: 10,
  });

  const randomName2 = uniqueNamesGenerator({ dictionaries: [names, starWars] });
  user2 = await runGrpcCall(client.CreateUser.bind(client), {
    name: randomName2,
  }); //.then(result => result);
  await runGrpcCall(client.DepositUser.bind(client), {
    uuid: user2.uuid,
    amount: 10,
  });
});

test("Send funds from one account to another", async () => {
  const sendCall = await runGrpcCall(client.SendFunds.bind(client), {
    fromId: user1.uuid,
    toId: user2.uuid,
    amount: 10,
  });
  expect(sendCall.status).toBe(grpc.status.OK);
  const balance1 = await runGrpcCall(client.UserBalance.bind(client), {
    uuid: user1.uuid,
  });
  expect(balance1.amount).toBe(0);
  const balance2 = await runGrpcCall(client.UserBalance.bind(client), {
    uuid: user2.uuid,
  });
  expect(balance2.amount).toBe(20);
});

describe("Request validation tests", () => {
  test.each([
    [{}],
    [{ fromId: "1", toId: "2" }],
    [{ fromId: "1", amount: 10 }],
    [{ toId: "2", amount: 10 }],
    [{ amount: 10 }],
    [{ fromId: "1" }],
    [{ toId: "2" }],
    [{ fromId: "1", toId: "2", amount: 0 }],
  ])("Send funds with body: %p", async (body) => {
    const res = await runGrpcCall(client.SendFunds.bind(client), body);
    expect(res.status).toBe(grpc.status.INTERNAL);
    expect(res.message).toBe("Bad request");
  });
});

test("Send funds to non-existing account", async () => {
  const res = await runGrpcCall(client.SendFunds.bind(client), {
    uuid: "wrong-uuid",
    amount: 10,
  });
  expect(res.status).toBe(grpc.status.INTERNAL);
  expect(res.message).toBe("Bad request");
});

test("Send zero amount", async () => {
  const res = await runGrpcCall(client.SendFunds.bind(client), {
    uuid: user1.uuid,
    amount: 0,
  });
  expect(res.status).toBe(grpc.status.INTERNAL);
  expect(res.message).toBe("Bad request");
});

test("Send negative amount", async () => {
  const res = await runGrpcCall(client.SendFunds.bind(client), {
    uuid: user1.uuid,
    amount: -2,
  });
  expect(res.status).toBe(grpc.status.INTERNAL);
  expect(res.message).toBe("Bad request");
});

test("Insufficient funds", async () => {
  const res = await runGrpcCall(client.SendFunds.bind(client), {
    uuid: user1.uuid,
    amount: 1000,
  });
  expect(res.status).toBe(grpc.status.INTERNAL);
  expect(res.message).toBe("Bad request");
});
