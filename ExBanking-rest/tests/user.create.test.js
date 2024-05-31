const {
  uniqueNamesGenerator,
  names,
  starWars,
} = require("unique-names-generator");
const api = require("./api.js");

test("Create a user", () => {
  const randomName = uniqueNamesGenerator({ dictionaries: [names, starWars] });
  return api.postCreateUser({ name: randomName }).then((res) => {
    expect(res.data.name).toBe(randomName);
    expect(res.data.uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(res.status).toBe(200);
  });
});

describe("Request validation tests", () => {
  test.each([[{}], [{ name1: "Test" }]])(
    "Create user with body: %p",
    async (body) => {
      const res = await api.postCreateUser(body);
      expect(res.error).toBe("Bad request");
      expect(res.status).toBe(400);
    },
  );
});

test("Existing user", async () => {
  const randomName = uniqueNamesGenerator({ dictionaries: [names, starWars] });
  await api.postCreateUser({name: randomName}).then(res => res)
  return api.postCreateUser({name: randomName}).then((res) => {
    expect(res.error).toBe("User already exists")
    expect(res.status).toBe(400);
  });
});
