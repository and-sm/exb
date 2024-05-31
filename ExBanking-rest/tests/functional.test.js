const {
  uniqueNamesGenerator,
  names,
  starWars,
} = require("unique-names-generator");
const api = require("./api.js");
const { exec } = require("child_process");

test("GET /get_balance should respond within 200ms", async () => {
  const randomName1 = uniqueNamesGenerator({ dictionaries: [names, starWars] });
  const user = await api
    .postCreateUser({ name: randomName1 })
    .then((result) => result);
  const start = Date.now();
  await api.getBalance(user.data.uuid).then((res) => {
    expect(res.data.amount).toBe(0);
  });
  const end = Date.now();
  expect(end - start).toBeLessThan(200);
});

describe("Load testing", () => {
  jest.setTimeout(50000);

  test("Run load test for user creation", (done) => {
    exec("artillery run artillery.yml", (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return done(error);
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return done(new Error(stderr));
      }
      console.log(`Stdout: ${stdout}`);
      done();
    });
  });
});
