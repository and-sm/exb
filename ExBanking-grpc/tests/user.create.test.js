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

test("Create a user", async () => {
  const randomName = uniqueNamesGenerator({ dictionaries: [names, starWars] });
  const user = await runGrpcCall(client.CreateUser.bind(client), {
    name: randomName,
  });
  expect(user.name).toBe(randomName);
  expect(user.uuid).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
});

describe("Request validation tests", () => {
  test.each([[{}], [{ name1: "Test" }]])(
    "Create user with body: %p",
    async (body) => {
      const res = await runGrpcCall(client.CreateUser.bind(client), body);
      expect(res.status).toBe(grpc.status.INTERNAL);
      expect(res.message).toBe("Bad request");
    },
  );
});

test("Existing user", async () => {
  const randomName = uniqueNamesGenerator({ dictionaries: [names, starWars] });
  await runGrpcCall(client.CreateUser.bind(client), { name: randomName });
  const createUserCall2 = await runGrpcCall(client.CreateUser.bind(client), {
    name: randomName,
  });
  expect(createUserCall2.status).toBe(grpc.status.ALREADY_EXISTS);
  expect(createUserCall2.message).toBe("User already exists");
});
