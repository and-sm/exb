const {
  uniqueNamesGenerator,
  names,
  starWars,
} = require("unique-names-generator");
const api = require("./api.js");

let user1, user2;

beforeEach(async () => {
  const randomName1 = uniqueNamesGenerator({ dictionaries: [names, starWars] });
  user1 = await api
    .postCreateUser({ name: randomName1 })
    .then((result) => result);
  await api.postDeposit({ uuid: user1.data.uuid, amount: 10 });

  const randomName2 = uniqueNamesGenerator({ dictionaries: [names, starWars] });
  user2 = await api.postCreateUser({ name: randomName2 });
  await api.postDeposit({ uuid: user2.data.uuid, amount: 10 });
});

test("Send funds from one account to another", async () => {
  await api
    .postSend({ fromId: user1.data.uuid, toId: user2.data.uuid, amount: 10 })
    .then((res) => {
      expect(res.data.status).toBe("ok");
      expect(res.status).toBe(200);
    });
  await api.getBalance(user1.data.uuid).then((res) => {
    expect(res.data.amount).toBe(0);
  });
  await api.getBalance(user2.data.uuid).then((res) => {
    expect(res.data.amount).toBe(20);
  });
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
    const res = await api.postSend(body);
    expect(res.error).toBe("Bad request");
    expect(res.status).toBe(400);
  });
});

test("Send funds to non-existing account", async () => {
  await api
    .postSend({
      fromId: user1.data.uuid,
      toId: "c366f07b-a767-4cf4-b182-573d7ba62b8e",
      amount: 10,
    })
    .then((res) => {
      expect(res.error).toBe("User not found");
      expect(res.status).toBe(404);
    });
});

test("Send zero amount", async () => {
  await api
    .postSend({ fromId: user1.data.uuid, toId: user2.data.uuid, amount: 0 })
    .then((res) => {
      expect(res.error).toBe("Bad request");
      expect(res.status).toBe(400);
    });
});

test("Send negative amount", async () => {
  await api
    .postSend({ fromId: user1.data.uuid, toId: user2.data.uuid, amount: -100 })
    .then((res) => {
      expect(res.error).toBe("Amount must be positive");
      expect(res.status).toBe(400);
    });
});

test("Insufficient funds", async () => {
  await api
    .postSend({ fromId: user1.data.uuid, toId: user2.data.uuid, amount: 1000 })
    .then((res) => {
      expect(res.error).toBe("Insufficient funds");
      expect(res.status).toBe(400);
    });
});
